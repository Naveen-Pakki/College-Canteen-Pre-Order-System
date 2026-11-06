package com.pragati.canteen.service;

import com.pragati.canteen.dto.*;
import com.pragati.canteen.entity.*;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.enums.PaymentStatus;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Core business service managing order placement, inventory reservation,
 * status lifecycle progression, digital tickets, and exact-once stock restoration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final CanteenBusinessRuleService businessRuleService;
    private final OrderLifecycleValidator lifecycleValidator;

    // Standard 5% GST tax rate for university canteen food operations
    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

    /**
     * Resolves the authenticated user from Spring Security context.
     */
    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadCredentialsException("Authentication required: No valid authenticated user found in session.");
        }

        String username = auth.getName();
        return userRepository.findByRegistrationIdIgnoreCaseOrEmailIgnoreCase(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database: " + username));
    }

    /**
     * Places a new order from the caller's active shopping cart.
     * Features:
     * 1. Idempotency protection against duplicate requests.
     * 2. Atomic stock reservation preventing concurrent overselling.
     * 3. Meal schedule validation.
     * 4. Immutable price, food name, and category name snapshots.
     * 5. Automatic cart cleanup upon placement.
     */
    @Transactional
    public OrderDto placeOrder(OrderPlacementRequest request) {
        User user = getCurrentAuthenticatedUser();

        // 1. Idempotency Check
        if (request != null && request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            String key = request.getIdempotencyKey().trim();
            var existing = orderRepository.findByIdempotencyKeyAndUserId(key, user.getId());
            if (existing.isPresent()) {
                log.info("Idempotent hit for user id={} idempotencyKey={}. Returning existing order id={}",
                        user.getId(), key, existing.get().getId());
                return OrderDto.fromEntity(existing.get());
            }
        }

        // 2. Fetch User's Cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new InvalidOperationException("Cannot place order: No active cart found."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new InvalidOperationException("Cannot place order: Your cart is empty.");
        }

        // 3. Pre-validate Food Items, Ordering Windows, and Active State
        for (CartItem cartItem : cart.getItems()) {
            FoodItem food = cartItem.getFoodItem();
            if (food == null || !food.isActive()) {
                throw new InvalidOperationException("Item '" + (food != null ? food.getFoodName() : "Unknown") +
                        "' is no longer active in the canteen menu.");
            }

            if (!businessRuleService.isWindowOpen(food.getMealType())) {
                throw new InvalidOperationException("Ordering window is closed for '" + food.getFoodName() +
                        "' (" + food.getMealType().getDisplayName() + "). " +
                        businessRuleService.getScheduleMessage(food.getMealType()));
            }
        }

        // 4. Atomically Reserve Inventory in MySQL
        for (CartItem cartItem : cart.getItems()) {
            FoodItem food = cartItem.getFoodItem();
            int rowsUpdated = foodItemRepository.reserveStock(food.getId(), cartItem.getQuantity());
            if (rowsUpdated == 0) {
                int currentAvailable = food.getAvailableStock() != null ? food.getAvailableStock() : 0;
                throw new InvalidOperationException("Insufficient stock for '" + food.getFoodName() +
                        "'. Requested: " + cartItem.getQuantity() + ", Available: " + currentAvailable);
            }
            log.info("Reserved {} units of '{}' (id={}) for user '{}'",
                    cartItem.getQuantity(), food.getFoodName(), food.getId(), user.getRegistrationId());
        }

        // 5. Calculate Subtotal, Tax, and Grand Total
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            FoodItem food = cartItem.getFoodItem();
            BigDecimal itemTotal = food.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        // 6. Generate Unique Order Number and Daily Pickup Token
        String orderNumber = generateUniqueOrderNumber();
        String tokenNumber = generateDailyPickupToken();

        // 7. Assemble Order Entity
        String paymentMethod = (request != null && request.getPaymentMethod() != null)
                ? request.getPaymentMethod().trim()
                : "Razorpay (Direct Online)";

        String instructions = (request != null && request.getSpecialInstructions() != null)
                ? request.getSpecialInstructions().trim()
                : null;

        String idempotencyKey = (request != null && request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty())
                ? request.getIdempotencyKey().trim()
                : null;

        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .tokenNumber(tokenNumber)
                .user(user)
                .orderDate(now)
                .subtotal(subtotal)
                .tax(tax)
                .totalAmount(grandTotal)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(paymentMethod)
                .idempotencyKey(idempotencyKey)
                .stockReserved(true)
                .paymentExpiresAt(now.plusMinutes(15))
                .specialInstructions(instructions)
                .build();

        // 8. Snapshot Items into Order
        for (CartItem cartItem : cart.getItems()) {
            FoodItem food = cartItem.getFoodItem();
            String catName = (food.getCategory() != null) ? food.getCategory().getCategoryName() : "General";
            BigDecimal itemSub = food.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .foodItem(food)
                    .foodNameSnapshot(food.getFoodName())
                    .categoryNameSnapshot(catName)
                    .unitPriceSnapshot(food.getPrice())
                    .quantity(cartItem.getQuantity())
                    .itemSubtotal(itemSub)
                    .build();

            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // 9. Clear the User's Shopping Cart
        cart.clearItems();
        cartRepository.save(cart);

        log.info("Order successfully placed: id={}, orderNumber={}, token={}, user='{}', amount=Rs.{}",
                savedOrder.getId(), savedOrder.getOrderNumber(), savedOrder.getTokenNumber(),
                user.getRegistrationId(), savedOrder.getTotalAmount());

        return OrderDto.fromEntity(savedOrder);
    }

    /**
     * Retrieves an order by primary ID, enforcing strict account isolation.
     */
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        User user = getCurrentAuthenticatedUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + orderId + " not found."));

        verifyOrderAccess(order, user);
        return OrderDto.fromEntity(order);
    }

    /**
     * Retrieves an order by unique order number string (e.g. PU-2026-001042).
     */
    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        User user = getCurrentAuthenticatedUser();
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order with number " + orderNumber + " not found."));

        verifyOrderAccess(order, user);
        return OrderDto.fromEntity(order);
    }

    /**
     * Retrieves the digital pickup ticket for an order.
     */
    @Transactional(readOnly = true)
    public OrderTicketDto getOrderTicket(Long orderId) {
        User user = getCurrentAuthenticatedUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + orderId + " not found."));

        verifyOrderAccess(order, user);
        return OrderTicketDto.fromEntity(order);
    }

    /**
     * Retrieves paginated order history for the calling student or faculty member.
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(Pageable pageable) {
        User user = getCurrentAuthenticatedUser();
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId(), pageable)
                .map(OrderDto::fromEntity);
    }

    /**
     * Cancels an order, releases reserved stock exactly once, and updates status.
     * Enforces customer vs admin cancellation permissions.
     */
    @Transactional
    public OrderDto cancelOrder(Long orderId, String reason) {
        User user = getCurrentAuthenticatedUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + orderId + " not found."));

        verifyOrderAccess(order, user);

        // Enforce role-based cancellation validation
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (isAdmin) {
            lifecycleValidator.validateAdminCancellation(order.getOrderStatus());
        } else {
            lifecycleValidator.validateCustomerCancellation(order.getOrderStatus());
        }

        // Release stock exactly once
        restoreStockIfReserved(order);

        // Update state
        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Cancelled by " + user.getRole().name());

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        Order saved = orderRepository.save(order);
        log.info("Order id={} cancelled by user '{}'. Reason: {}", orderId, user.getRegistrationId(), order.getCancellationReason());
        return OrderDto.fromEntity(saved);
    }

    /**
     * Admin: Searches, filters, and paginates campus orders.
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrdersAdmin(OrderStatus status, String search, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return orderRepository.searchOrdersAdmin(status, cleanSearch, pageable)
                .map(OrderDto::fromEntity);
    }

    /**
     * Admin: Transitions an order's lifecycle stage (e.g. CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> COMPLETED).
     */
    @Transactional
    public OrderDto updateOrderStatusByAdmin(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + orderId + " not found."));

        OrderStatus targetStatus = request.getOrderStatus();
        lifecycleValidator.validateTransition(order.getOrderStatus(), targetStatus);

        // If transitioning to a cancellation, failure, or expiration state, restore reserved stock exactly once
        if (targetStatus == OrderStatus.CANCELLED ||
            targetStatus == OrderStatus.PAYMENT_FAILED ||
            targetStatus == OrderStatus.EXPIRED) {
            restoreStockIfReserved(order);
            if (request.getCancellationReason() != null) {
                order.setCancellationReason(request.getCancellationReason());
            }
            if (order.getPaymentStatus() == PaymentStatus.SUCCESS && targetStatus == OrderStatus.CANCELLED) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
            }
        }

        // If admin confirms order directly (e.g. manual counter payment verification)
        if (targetStatus == OrderStatus.CONFIRMED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }

        order.setOrderStatus(targetStatus);
        if (request.getAdminNote() != null && !request.getAdminNote().trim().isEmpty()) {
            order.setAdminNote(request.getAdminNote().trim());
        }

        Order saved = orderRepository.save(order);
        log.info("Admin updated order id={} to status={}", orderId, targetStatus);
        return OrderDto.fromEntity(saved);
    }

    /**
     * Direct confirmation hook used for payment completion in Module 5.
     */
    @Transactional
    public OrderDto confirmPayment(Long orderId, String razorpayPaymentId, String razorpayOrderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + orderId + " not found."));

        lifecycleValidator.validateTransition(order.getOrderStatus(), OrderStatus.CONFIRMED);

        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setRazorpayOrderId(razorpayOrderId);

        Order saved = orderRepository.save(order);
        log.info("Payment confirmed for order id={} (paymentId={})", orderId, razorpayPaymentId);
        return OrderDto.fromEntity(saved);
    }

    /**
     * Sweeps and expires all pending unpaid orders whose checkout window (15 mins) has passed.
     * Restores stock atomically and exactly once.
     */
    @Transactional
    public int expireUnpaidOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> expiredOrders = orderRepository.findByOrderStatusAndPaymentExpiresAtBeforeAndStockReservedTrue(
                OrderStatus.PENDING_PAYMENT, now
        );

        int count = 0;
        for (Order order : expiredOrders) {
            restoreStockIfReserved(order);
            order.setOrderStatus(OrderStatus.EXPIRED);
            order.setAdminNote("Order expired due to unpaid checkout window timeout (15 mins).");
            orderRepository.save(order);
            count++;
        }

        if (count > 0) {
            log.info("Expired {} unpaid orders and restored inventory.", count);
        }
        return count;
    }

    /**
     * Atomically restores inventory for all items in an order if stock was reserved.
     * Modifies the stock_reserved flag in the same transaction to guarantee exact-once restoration.
     */
    public void restoreStockIfReserved(Order order) {
        if (order.isStockReserved()) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getFoodItem() != null) {
                        foodItemRepository.restoreStock(item.getFoodItem().getId(), item.getQuantity());
                        log.info("Restored {} units of foodId={} for order {}",
                                item.getQuantity(), item.getFoodItem().getId(), order.getOrderNumber());
                    }
                }
            }
            order.setStockReserved(false);
        }
    }

    /**
     * Enforces user account isolation. Admins have global access.
     */
    private void verifyOrderAccess(Order order, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access Denied: You do not have permission to view or manage this order.");
        }
    }

    /**
     * Generates a readable university order number: PU-2026-XXXXXX.
     */
    private String generateUniqueOrderNumber() {
        int year = LocalDate.now().getYear();
        String orderNum;
        do {
            int randomNum = ThreadLocalRandom.current().nextInt(100000, 999999);
            orderNum = String.format("PU-%d-%06d", year, randomNum);
        } while (orderRepository.findByOrderNumber(orderNum).isPresent());
        return orderNum;
    }

    /**
     * Generates a sequential daily pickup token for counter announcements: TKT-XX.
     */
    private String generateDailyPickupToken() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayCount = orderRepository.countByOrderDateBetween(startOfDay, endOfDay);
        int tokenSequence = (int) ((todayCount % 99) + 1);
        return String.format("TKT-%02d", tokenSequence);
    }
}

