package com.pragati.canteen.service;

import com.pragati.canteen.dto.AddToCartRequest;
import com.pragati.canteen.dto.CartDto;
import com.pragati.canteen.dto.CartItemDto;
import com.pragati.canteen.dto.UpdateCartItemRequest;
import com.pragati.canteen.entity.Cart;
import com.pragati.canteen.entity.CartItem;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.entity.User;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.CartItemRepository;
import com.pragati.canteen.repository.CartRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import com.pragati.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service managing user shopping carts with complete account isolation,
 * real-time price calculations, stock validation, and zero stock deduction.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final CanteenBusinessRuleService businessRuleService;

    /**
     * Resolves the authenticated user from the Spring SecurityContextHolder.
     * Prevents clients from supplying or spoofing user IDs.
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
     * Retrieves or lazily creates an active Cart belonging to the specified User.
     */
    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();
                    Cart saved = cartRepository.save(newCart);
                    log.info("Created new isolated cart id={} for user='{}'", saved.getId(), user.getRegistrationId());
                    return saved;
                });
    }

    /**
     * Retrieves the current authenticated user's cart, enriched with live prices,
     * subtotal calculations, and validity status.
     */
    @Transactional(readOnly = true)
    public CartDto getCartForCurrentUser() {
        User user = getCurrentAuthenticatedUser();
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> Cart.builder().id(null).user(user).items(new ArrayList<>()).build());

        return mapToCartDto(cart, user);
    }

    /**
     * Adds an item to the calling user's cart.
     * If already present, increments quantity.
     * Validates stock and ordering window.
     * Does NOT deduct stock from the database.
     */
    @Transactional
    public CartDto addItemToCart(AddToCartRequest request) {
        User user = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new InvalidOperationException("Quantity must be at least 1.");
        }

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + request.getFoodItemId()));

        if (!foodItem.isActive()) {
            throw new InvalidOperationException("Food item '" + foodItem.getFoodName() + "' is currently inactive.");
        }

        if (!foodItem.isAvailableToday()) {
            throw new InvalidOperationException("Food item '" + foodItem.getFoodName() + "' is marked unavailable today.");
        }

        int availableStock = foodItem.getAvailableStock() != null ? foodItem.getAvailableStock() : 0;

        // Check if item already exists in this cart
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getFoodItem().getId().equals(foodItem.getId()))
                .findFirst();

        int targetQuantity = request.getQuantity();
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            targetQuantity = cartItem.getQuantity() + request.getQuantity();

            if (targetQuantity > availableStock) {
                throw new InvalidOperationException("Insufficient stock for '" + foodItem.getFoodName() +
                        "'. Requested total: " + targetQuantity + ", Available stock: " + availableStock);
            }

            cartItem.setQuantity(targetQuantity);
            log.info("Incremented quantity for food '{}' in cart id={} to {}", foodItem.getFoodName(), cart.getId(), targetQuantity);
        } else {
            if (targetQuantity > availableStock) {
                throw new InvalidOperationException("Insufficient stock for '" + foodItem.getFoodName() +
                        "'. Requested: " + targetQuantity + ", Available stock: " + availableStock);
            }

            cartItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(targetQuantity)
                    .build();
            cart.addItem(cartItem);
            log.info("Added new item '{}' (qty: {}) to cart id={}", foodItem.getFoodName(), targetQuantity, cart.getId());
        }

        Cart saved = cartRepository.save(cart);
        return mapToCartDto(saved, user);
    }

    /**
     * Updates quantity of an item in the caller's cart.
     * Enforces user isolation so users cannot modify items in another user's cart.
     */
    @Transactional
    public CartDto updateCartItemQuantity(Long cartItemId, UpdateCartItemRequest request) {
        User user = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item with ID " + cartItemId + " not found in your active cart."));

        // Strict account isolation check
        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access Denied: You do not have permission to modify this cart item.");
        }

        int targetQuantity;
        if (request.getQuantity() != null) {
            targetQuantity = request.getQuantity();
        } else if (request.getDelta() != null) {
            targetQuantity = cartItem.getQuantity() + request.getDelta();
        } else {
            throw new InvalidOperationException("Either 'quantity' or 'delta' must be provided.");
        }

        if (targetQuantity <= 0) {
            throw new InvalidOperationException("Quantity must be at least 1. To remove an item, please use the delete action.");
        }

        FoodItem food = cartItem.getFoodItem();
        int availableStock = food.getAvailableStock() != null ? food.getAvailableStock() : 0;
        if (targetQuantity > availableStock) {
            throw new InvalidOperationException("Insufficient stock for '" + food.getFoodName() +
                    "'. Requested: " + targetQuantity + ", Available stock: " + availableStock);
        }

        cartItem.setQuantity(targetQuantity);
        Cart saved = cartRepository.save(cart);
        log.info("Updated cart item id={} quantity to {}", cartItemId, targetQuantity);
        return mapToCartDto(saved, user);
    }

    /**
     * Removes an individual item from the caller's cart with account isolation.
     */
    @Transactional
    public CartDto removeCartItem(Long cartItemId) {
        User user = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item with ID " + cartItemId + " not found in your active cart."));

        cart.removeItem(cartItem);
        Cart saved = cartRepository.save(cart);
        log.info("Removed cart item id={} from user cart id={}", cartItemId, cart.getId());
        return mapToCartDto(saved, user);
    }

    /**
     * Clears all items from the calling user's cart.
     */
    @Transactional
    public CartDto clearCart() {
        User user = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        cart.clearItems();
        Cart saved = cartRepository.save(cart);
        log.info("Cleared all items from cart id={} for user='{}'", cart.getId(), user.getRegistrationId());
        return mapToCartDto(saved, user);
    }

    /**
     * Maps Cart entity to CartDto, evaluating live database prices and current window status.
     */
    public CartDto mapToCartDto(Cart cart, User user) {
        List<CartItemDto> itemDtos = new ArrayList<>();

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                boolean windowOpen = businessRuleService.isWindowOpen(item.getFoodItem().getMealType());
                String windowMsg = businessRuleService.getScheduleMessage(item.getFoodItem().getMealType());
                itemDtos.add(CartItemDto.fromEntity(item, windowOpen, windowMsg));
            }
        }

        return CartDto.create(
                cart.getId(),
                user.getId(),
                user.getRegistrationId(),
                user.getFullName(),
                itemDtos
        );
    }
}

