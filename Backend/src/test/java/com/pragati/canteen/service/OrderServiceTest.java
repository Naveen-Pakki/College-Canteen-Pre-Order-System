package com.pragati.canteen.service;

import com.pragati.canteen.dto.OrderDto;
import com.pragati.canteen.dto.OrderPlacementRequest;
import com.pragati.canteen.dto.OrderStatusUpdateRequest;
import com.pragati.canteen.dto.OrderTicketDto;
import com.pragati.canteen.entity.*;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.enums.PaymentStatus;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Module 4 - OrderService Unit and Integration Tests")
class OrderServiceTest {

    private OrderService orderService;
    private OrderLifecycleValidator lifecycleValidator;

    private final Map<Long, Order> orderDb = new HashMap<>();
    private final Map<Long, Cart> cartDb = new HashMap<>();
    private final Map<Long, FoodItem> foodDb = new HashMap<>();
    private final Map<String, User> userDb = new HashMap<>();

    private long orderIdSeq = 1L;

    private User studentUser;
    private User otherStudentUser;
    private User adminUser;
    private FoodItem idliFood;
    private FoodItem dosaFood;
    private FoodCategory category;

    @BeforeEach
    void setUp() {
        orderDb.clear();
        cartDb.clear();
        foodDb.clear();
        userDb.clear();
        orderIdSeq = 1L;

        studentUser = User.builder()
                .id(1L)
                .registrationId("23A91A0501")
                .fullName("Sai Vardhan")
                .email("student@pragati.edu.in")
                .role(Role.STUDENT)
                .active(true)
                .build();

        otherStudentUser = User.builder()
                .id(2L)
                .registrationId("23A91A0502")
                .fullName("Pooja Sharma")
                .email("pooja@pragati.edu.in")
                .role(Role.STUDENT)
                .active(true)
                .build();

        adminUser = User.builder()
                .id(99L)
                .registrationId("ADMIN001")
                .fullName("Campus Admin")
                .email("admin@pragati.edu.in")
                .role(Role.ADMIN)
                .active(true)
                .build();

        userDb.put("23a91a0501", studentUser);
        userDb.put("23a91a0502", otherStudentUser);
        userDb.put("admin001", adminUser);

        category = FoodCategory.builder().id(1L).categoryName("Breakfast").active(true).build();

        idliFood = FoodItem.builder()
                .id(101L)
                .foodName("Idli (3 pcs)")
                .category(category)
                .price(new BigDecimal("40.00"))
                .availableStock(50)
                .active(true)
                .availableToday(true)
                .mealType(MealType.BREAKFAST)
                .build();

        dosaFood = FoodItem.builder()
                .id(102L)
                .foodName("Masala Dosa")
                .category(category)
                .price(new BigDecimal("50.00"))
                .availableStock(30)
                .active(true)
                .availableToday(true)
                .mealType(MealType.BREAKFAST)
                .build();

        foodDb.put(101L, idliFood);
        foodDb.put(102L, dosaFood);

        // Proxied repositories
        OrderRepository orderRepository = createOrderRepositoryProxy();
        OrderItemRepository orderItemRepository = createOrderItemRepositoryProxy();
        CartRepository cartRepository = createCartRepositoryProxy();
        FoodItemRepository foodItemRepository = createFoodItemRepositoryProxy();
        UserRepository userRepository = createUserRepositoryProxy();

        CanteenBusinessRuleService businessRuleService = new CanteenBusinessRuleService() {
            @Override
            public boolean isWindowOpen(MealType mealType) {
                return true; // Open during test execution
            }

            @Override
            public String getScheduleMessage(MealType mealType) {
                return "Window is open";
            }
        };

        lifecycleValidator = new OrderLifecycleValidator();

        orderService = new OrderService(
                orderRepository,
                orderItemRepository,
                cartRepository,
                foodItemRepository,
                userRepository,
                businessRuleService,
                lifecycleValidator
        );

        setAuthenticatedUser("23A91A0501");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setAuthenticatedUser(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, "N/A", List.of())
        );
    }

    // =========================================================================
    // 1. Order Placement Tests
    // =========================================================================

    @Test
    @DisplayName("Place order successfully reserves inventory, clears cart, and creates snapshots")
    void testPlaceOrder_Success() {
        // Setup cart with 2 Idli and 1 Dosa
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(2).build());
        cart.addItem(CartItem.builder().id(11L).foodItem(dosaFood).quantity(1).build());
        cartDb.put(1L, cart);

        OrderPlacementRequest req = OrderPlacementRequest.builder()
                .paymentMethod("Razorpay (Direct Online)")
                .specialInstructions("Extra chutney please")
                .build();

        OrderDto order = orderService.placeOrder(req);

        // Verify Order creation
        assertThat(order).isNotNull();
        assertThat(order.getOrderNumber()).startsWith("PU-");
        assertThat(order.getTokenNumber()).startsWith("TKT-");
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(order.isStockReserved()).isTrue();

        // 2 Idli @ 40 = 80; 1 Dosa @ 50 = 50 -> Subtotal = 130
        assertThat(order.getSubtotal()).isEqualByComparingTo("130.00");
        // 5% Tax of 130 = 6.50
        assertThat(order.getTax()).isEqualByComparingTo("6.50");
        // Total = 136.50
        assertThat(order.getTotalAmount()).isEqualByComparingTo("136.50");

        // Verify stock was decremented atomically
        assertThat(idliFood.getAvailableStock()).isEqualTo(48); // 50 - 2
        assertThat(dosaFood.getAvailableStock()).isEqualTo(29); // 30 - 1

        // Verify Cart was cleared
        assertThat(cart.getItems()).isEmpty();

        // Verify snapshots preserved
        assertThat(order.getItems()).hasSize(2);
        assertThat(order.getItems().get(0).getFoodName()).isEqualTo("Idli (3 pcs)");
        assertThat(order.getItems().get(0).getCategoryName()).isEqualTo("Breakfast");
    }

    @Test
    @DisplayName("Idempotency key prevents duplicate orders and duplicate stock reservations")
    void testPlaceOrder_Idempotency() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(1).build());
        cartDb.put(1L, cart);

        OrderPlacementRequest req = OrderPlacementRequest.builder()
                .idempotencyKey("unique-checkout-token-12345")
                .paymentMethod("ONLINE")
                .build();

        // First call
        OrderDto order1 = orderService.placeOrder(req);
        assertThat(idliFood.getAvailableStock()).isEqualTo(49);

        // Second call with same idempotency key
        OrderDto order2 = orderService.placeOrder(req);

        // Must return identical order
        assertThat(order2.getId()).isEqualTo(order1.getId());
        assertThat(order2.getOrderNumber()).isEqualTo(order1.getOrderNumber());

        // Stock must not be deducted a second time
        assertThat(idliFood.getAvailableStock()).isEqualTo(49);
    }

    @Test
    @DisplayName("Placing order with empty cart throws InvalidOperationException")
    void testPlaceOrder_EmptyCart_ThrowsException() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cartDb.put(1L, cart);

        assertThatThrownBy(() -> orderService.placeOrder(new OrderPlacementRequest()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("cart is empty");
    }

    @Test
    @DisplayName("Placing order when stock is insufficient throws InvalidOperationException and retains stock")
    void testPlaceOrder_InsufficientStock_ThrowsException() {
        idliFood.setAvailableStock(1);
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(5).build());
        cartDb.put(1L, cart);

        assertThatThrownBy(() -> orderService.placeOrder(new OrderPlacementRequest()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Insufficient stock");

        // Stock unchanged
        assertThat(idliFood.getAvailableStock()).isEqualTo(1);
    }

    // =========================================================================
    // 2. Cancellation and Exact-Once Stock Restoration Tests
    // =========================================================================

    @Test
    @DisplayName("Customer cancellation releases stock exactly once")
    void testCancelOrder_Customer_ReleasesStockExactlyOnce() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(3).build());
        cartDb.put(1L, cart);

        OrderDto orderDto = orderService.placeOrder(new OrderPlacementRequest());
        assertThat(idliFood.getAvailableStock()).isEqualTo(47); // 50 - 3

        // Cancel order
        OrderDto cancelled = orderService.cancelOrder(orderDto.getId(), "Changed mind");
        assertThat(cancelled.getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(cancelled.isStockReserved()).isFalse();

        // Stock must be restored to 50
        assertThat(idliFood.getAvailableStock()).isEqualTo(50);

        // Subsequent cancellation must fail and cannot restore stock again
        assertThatThrownBy(() -> orderService.cancelOrder(orderDto.getId(), "Again"))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("already cancelled");

        assertThat(idliFood.getAvailableStock()).isEqualTo(50);
    }

    @Test
    @DisplayName("Customer cannot cancel order once canteen kitchen begins PREPARING")
    void testCancelOrder_CustomerCannotCancelInPreparing() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(1).build());
        cartDb.put(1L, cart);

        OrderDto placed = orderService.placeOrder(new OrderPlacementRequest());

        // Admin marks as PREPARING
        Order order = orderDb.get(placed.getId());
        order.setOrderStatus(OrderStatus.PREPARING);

        // Student attempts cancellation
        assertThatThrownBy(() -> orderService.cancelOrder(placed.getId(), "Cancel please"))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Cannot cancel order: Canteen kitchen is already preparing");
    }

    @Test
    @DisplayName("Completed orders cannot be cancelled by either customer or admin")
    void testCancelOrder_CompletedOrderCannotBeCancelled() {
        Order order = Order.builder()
                .id(50L)
                .orderNumber("PU-2026-000050")
                .tokenNumber("TKT-50")
                .user(studentUser)
                .orderDate(LocalDateTime.now())
                .subtotal(new BigDecimal("100.00"))
                .tax(new BigDecimal("5.00"))
                .totalAmount(new BigDecimal("105.00"))
                .orderStatus(OrderStatus.COMPLETED)
                .paymentStatus(PaymentStatus.SUCCESS)
                .stockReserved(false)
                .build();
        orderDb.put(50L, order);

        // Customer attempts cancellation
        assertThatThrownBy(() -> orderService.cancelOrder(50L, "Cancel"))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Completed orders cannot be cancelled");

        // Admin attempts cancellation
        setAuthenticatedUser("ADMIN001");
        assertThatThrownBy(() -> orderService.cancelOrder(50L, "Admin Cancel"))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Completed orders cannot be cancelled");
    }

    // =========================================================================
    // 3. Account Isolation and Admin Access Tests
    // =========================================================================

    @Test
    @DisplayName("Cross-account access is denied: Student cannot view another student's order")
    void testAccountIsolation_Denied() {
        Order order = Order.builder()
                .id(60L)
                .orderNumber("PU-2026-000060")
                .tokenNumber("TKT-60")
                .user(otherStudentUser) // Belongs to Pooja
                .orderDate(LocalDateTime.now())
                .subtotal(new BigDecimal("50.00"))
                .tax(new BigDecimal("2.50"))
                .totalAmount(new BigDecimal("52.50"))
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();
        orderDb.put(60L, order);

        // Logged in as Sai Vardhan
        setAuthenticatedUser("23A91A0501");

        assertThatThrownBy(() -> orderService.getOrderById(60L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access Denied");

        assertThatThrownBy(() -> orderService.getOrderTicket(60L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Admin can view and manage any student order")
    void testAdminCanViewAnyOrder() {
        Order order = Order.builder()
                .id(70L)
                .orderNumber("PU-2026-000070")
                .tokenNumber("TKT-70")
                .user(studentUser)
                .orderDate(LocalDateTime.now())
                .subtotal(new BigDecimal("80.00"))
                .tax(new BigDecimal("4.00"))
                .totalAmount(new BigDecimal("84.00"))
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();
        orderDb.put(70L, order);

        setAuthenticatedUser("ADMIN001");

        OrderDto retrieved = orderService.getOrderById(70L);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getOrderNumber()).isEqualTo("PU-2026-000070");
    }

    // =========================================================================
    // 4. Digital Order Ticket Generation Tests
    // =========================================================================

    @Test
    @DisplayName("Digital order ticket contains valid token, snapshots, and verification hash")
    void testGetOrderTicket_Success() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(2).build());
        cartDb.put(1L, cart);

        OrderDto placed = orderService.placeOrder(new OrderPlacementRequest());

        OrderTicketDto ticket = orderService.getOrderTicket(placed.getId());
        assertThat(ticket).isNotNull();
        assertThat(ticket.getOrderNumber()).isEqualTo(placed.getOrderNumber());
        assertThat(ticket.getTokenNumber()).isEqualTo(placed.getTokenNumber());
        assertThat(ticket.getUserName()).isEqualTo("Sai Vardhan");
        assertThat(ticket.getUserRegistrationId()).isEqualTo("23A91A0501");
        assertThat(ticket.getVerificationHash()).isNotEmpty();
        assertThat(ticket.getItems()).hasSize(1);
        assertThat(ticket.getItems().get(0).getFoodName()).isEqualTo("Idli (3 pcs)");
    }

    // =========================================================================
    // 5. Unpaid Order Expiration and Sweep Tests
    // =========================================================================

    @Test
    @DisplayName("Expiring unpaid orders past timeout restores stock exactly once")
    void testExpireUnpaidOrders_RestoresStock() {
        idliFood.setAvailableStock(50);
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(4).build());
        cartDb.put(1L, cart);

        OrderDto placed = orderService.placeOrder(new OrderPlacementRequest());
        assertThat(idliFood.getAvailableStock()).isEqualTo(46);

        // Simulate order payment window expiring (past 15 mins)
        Order order = orderDb.get(placed.getId());
        order.setPaymentExpiresAt(LocalDateTime.now().minusMinutes(5));

        // Admin triggers expiry sweep
        setAuthenticatedUser("ADMIN001");
        int expiredCount = orderService.expireUnpaidOrders();

        assertThat(expiredCount).isEqualTo(1);
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.EXPIRED);
        assertThat(order.isStockReserved()).isFalse();

        // Stock restored back to 50
        assertThat(idliFood.getAvailableStock()).isEqualTo(50);
    }

    // =========================================================================
    // 6. Admin Status Transition Progression Tests
    // =========================================================================

    @Test
    @DisplayName("Admin transitions order through standard lifecycle: CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> COMPLETED")
    void testAdminLifecycleProgression() {
        Cart cart = Cart.builder().id(1L).user(studentUser).items(new ArrayList<>()).build();
        cart.addItem(CartItem.builder().id(10L).foodItem(idliFood).quantity(1).build());
        cartDb.put(1L, cart);

        OrderDto placed = orderService.placeOrder(new OrderPlacementRequest());
        Long id = placed.getId();

        setAuthenticatedUser("ADMIN001");

        // 1. Confirm
        OrderDto confirmed = orderService.updateOrderStatusByAdmin(id,
                OrderStatusUpdateRequest.builder().orderStatus(OrderStatus.CONFIRMED).build());
        assertThat(confirmed.getOrderStatus()).isEqualTo(OrderStatus.CONFIRMED);

        // 2. Preparing
        OrderDto preparing = orderService.updateOrderStatusByAdmin(id,
                OrderStatusUpdateRequest.builder().orderStatus(OrderStatus.PREPARING).adminNote("Chef started").build());
        assertThat(preparing.getOrderStatus()).isEqualTo(OrderStatus.PREPARING);

        // 3. Ready for pickup
        OrderDto ready = orderService.updateOrderStatusByAdmin(id,
                OrderStatusUpdateRequest.builder().orderStatus(OrderStatus.READY_FOR_PICKUP).build());
        assertThat(ready.getOrderStatus()).isEqualTo(OrderStatus.READY_FOR_PICKUP);

        // 4. Completed
        OrderDto completed = orderService.updateOrderStatusByAdmin(id,
                OrderStatusUpdateRequest.builder().orderStatus(OrderStatus.COMPLETED).build());
        assertThat(completed.getOrderStatus()).isEqualTo(OrderStatus.COMPLETED);

        // 5. Cannot transition completed order
        assertThatThrownBy(() -> orderService.updateOrderStatusByAdmin(id,
                OrderStatusUpdateRequest.builder().orderStatus(OrderStatus.CANCELLED).build()))
                .isInstanceOf(InvalidOperationException.class);
    }

    // =========================================================================
    // Proxy Repository Implementations (Fast, deterministic, 0 bytecode overhead)
    // =========================================================================

    @SuppressWarnings("unchecked")
    private OrderRepository createOrderRepositoryProxy() {
        return (OrderRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{OrderRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        Order o = (Order) args[0];
                        if (o.getId() == null) {
                            o.setId(orderIdSeq++);
                        }
                        orderDb.put(o.getId(), o);
                        return o;
                    }
                    if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(orderDb.get(id));
                    }
                    if ("findByOrderNumber".equals(name)) {
                        String num = (String) args[0];
                        return orderDb.values().stream()
                                .filter(o -> o.getOrderNumber().equals(num))
                                .findFirst();
                    }
                    if ("findByIdempotencyKeyAndUserId".equals(name)) {
                        String key = (String) args[0];
                        Long userId = (Long) args[1];
                        return orderDb.values().stream()
                                .filter(o -> key.equals(o.getIdempotencyKey()) && o.getUser().getId().equals(userId))
                                .findFirst();
                    }
                    if ("countByOrderDateBetween".equals(name)) {
                        return (long) orderDb.size();
                    }
                    if ("findByOrderStatusAndPaymentExpiresAtBeforeAndStockReservedTrue".equals(name)) {
                        OrderStatus status = (OrderStatus) args[0];
                        LocalDateTime time = (LocalDateTime) args[1];
                        List<Order> result = new ArrayList<>();
                        for (Order o : orderDb.values()) {
                            if (o.getOrderStatus() == status &&
                                o.getPaymentExpiresAt() != null &&
                                o.getPaymentExpiresAt().isBefore(time) &&
                                o.isStockReserved()) {
                                result.add(o);
                            }
                        }
                        return result;
                    }
                    if ("searchOrdersAdmin".equals(name)) {
                        return new PageImpl<>(new ArrayList<>(orderDb.values()));
                    }
                    if ("findByUserIdOrderByOrderDateDesc".equals(name)) {
                        Long userId = (Long) args[0];
                        List<Order> list = orderDb.values().stream()
                                .filter(o -> o.getUser().getId().equals(userId))
                                .sorted(Comparator.comparing(Order::getOrderDate).reversed())
                                .toList();
                        if (args.length > 1 && args[1] instanceof Pageable) {
                            return new PageImpl<>(list);
                        }
                        return list;
                    }
                    return null;
                }
        );
    }

    @SuppressWarnings("unchecked")
    private OrderItemRepository createOrderItemRepositoryProxy() {
        return (OrderItemRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{OrderItemRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );
    }

    @SuppressWarnings("unchecked")
    private CartRepository createCartRepositoryProxy() {
        return (CartRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{CartRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("findByUserId".equals(name)) {
                        Long uid = (Long) args[0];
                        return cartDb.values().stream().filter(c -> c.getUser().getId().equals(uid)).findFirst();
                    }
                    if ("save".equals(name)) {
                        Cart c = (Cart) args[0];
                        if (c.getId() == null) c.setId(1L);
                        cartDb.put(c.getId(), c);
                        return c;
                    }
                    return null;
                }
        );
    }

    @SuppressWarnings("unchecked")
    private FoodItemRepository createFoodItemRepositoryProxy() {
        return (FoodItemRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{FoodItemRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("reserveStock".equals(name)) {
                        Long foodId = (Long) args[0];
                        Integer qty = (Integer) args[1];
                        FoodItem item = foodDb.get(foodId);
                        if (item != null && item.getAvailableStock() != null && item.getAvailableStock() >= qty) {
                            item.setAvailableStock(item.getAvailableStock() - qty);
                            return 1;
                        }
                        return 0;
                    }
                    if ("restoreStock".equals(name)) {
                        Long foodId = (Long) args[0];
                        Integer qty = (Integer) args[1];
                        FoodItem item = foodDb.get(foodId);
                        if (item != null && item.getAvailableStock() != null) {
                            item.setAvailableStock(item.getAvailableStock() + qty);
                            return 1;
                        }
                        return 0;
                    }
                    if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(foodDb.get(id));
                    }
                    return null;
                }
        );
    }

    @SuppressWarnings("unchecked")
    private UserRepository createUserRepositoryProxy() {
        return (UserRepository) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{UserRepository.class},
                (proxy, method, args) -> {
                    if ("findByRegistrationIdIgnoreCaseOrEmailIgnoreCase".equals(method.getName())) {
                        String idOrEmail = ((String) args[0]).toLowerCase();
                        return Optional.ofNullable(userDb.get(idOrEmail));
                    }
                    return Optional.empty();
                }
        );
    }
}

