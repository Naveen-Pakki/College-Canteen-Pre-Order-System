package com.pragati.canteen.controller;

import com.pragati.canteen.dto.AddToCartRequest;
import com.pragati.canteen.dto.CartDto;
import com.pragati.canteen.dto.UpdateCartItemRequest;
import com.pragati.canteen.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for User Shopping Cart operations.
 * Enforces strict user isolation via Spring Security JWT context.
 */
@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart
     * Retrieves the authenticated user's cart and real-time subtotal calculations.
     */
    @GetMapping
    public ResponseEntity<CartDto> getCart() {
        return ResponseEntity.ok(cartService.getCartForCurrentUser());
    }

    /**
     * POST /api/cart/items
     * Adds a food item to the caller's cart. Increments quantity if item already present.
     */
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItemToCart(@Valid @RequestBody AddToCartRequest request) {
        CartDto updatedCart = cartService.addItemToCart(request);
        return new ResponseEntity<>(updatedCart, HttpStatus.CREATED);
    }

    /**
     * PUT /api/cart/items/{itemId}
     * Updates the quantity of a specific item in the caller's cart.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateCartItemQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(itemId, request));
    }

    /**
     * DELETE /api/cart/items/{itemId}
     * Removes a specific item from the caller's cart.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeCartItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeCartItem(itemId));
    }

    /**
     * DELETE /api/cart
     * Clears all items from the authenticated user's cart.
     */
    @DeleteMapping
    public ResponseEntity<CartDto> clearCart() {
        return ResponseEntity.ok(cartService.clearCart());
    }
}

