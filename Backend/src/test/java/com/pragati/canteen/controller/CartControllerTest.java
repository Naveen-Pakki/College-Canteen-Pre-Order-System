package com.pragati.canteen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pragati.canteen.dto.AddToCartRequest;
import com.pragati.canteen.dto.CartDto;
import com.pragati.canteen.dto.CartItemDto;
import com.pragati.canteen.dto.UpdateCartItemRequest;
import com.pragati.canteen.exception.GlobalExceptionHandler;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CartControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Stub service to avoid bytecode agent issues in sandboxed environments
    private static class StubCartService extends CartService {
        public StubCartService() {
            super(null, null, null, null, null);
        }

        @Override
        public CartDto getCartForCurrentUser() {
            return CartDto.create(1L, 10L, "23A91A0501", "Sai Vardhan", List.of(
                    CartItemDto.builder()
                            .id(100L)
                            .foodItemId(1L)
                            .foodName("Idli (3 pcs)")
                            .unitPrice(new BigDecimal("40.00"))
                            .quantity(2)
                            .itemSubtotal(new BigDecimal("80.00"))
                            .availableStock(50)
                            .stockSufficient(true)
                            .active(true)
                            .availableToday(true)
                            .orderingWindowOpen(true)
                            .build()
            ));
        }

        @Override
        public CartDto addItemToCart(AddToCartRequest request) {
            if (request.getQuantity() > 20) {
                throw new InvalidOperationException("Insufficient stock for requested quantity.");
            }
            return CartDto.create(1L, 10L, "23A91A0501", "Sai Vardhan", List.of(
                    CartItemDto.builder()
                            .id(100L)
                            .foodItemId(request.getFoodItemId())
                            .foodName("Idli (3 pcs)")
                            .unitPrice(new BigDecimal("40.00"))
                            .quantity(request.getQuantity())
                            .itemSubtotal(BigDecimal.valueOf(40L * request.getQuantity()))
                            .availableStock(50)
                            .stockSufficient(true)
                            .active(true)
                            .availableToday(true)
                            .orderingWindowOpen(true)
                            .build()
            ));
        }

        @Override
        public CartDto updateCartItemQuantity(Long itemId, UpdateCartItemRequest request) {
            int qty = request.getQuantity() != null ? request.getQuantity() : 1;
            return CartDto.create(1L, 10L, "23A91A0501", "Sai Vardhan", List.of(
                    CartItemDto.builder()
                            .id(itemId)
                            .foodItemId(1L)
                            .foodName("Idli (3 pcs)")
                            .unitPrice(new BigDecimal("40.00"))
                            .quantity(qty)
                            .itemSubtotal(BigDecimal.valueOf(40L * qty))
                            .availableStock(50)
                            .stockSufficient(true)
                            .active(true)
                            .availableToday(true)
                            .orderingWindowOpen(true)
                            .build()
            ));
        }

        @Override
        public CartDto removeCartItem(Long itemId) {
            return CartDto.create(1L, 10L, "23A91A0501", "Sai Vardhan", List.of());
        }

        @Override
        public CartDto clearCart() {
            return CartDto.create(1L, 10L, "23A91A0501", "Sai Vardhan", List.of());
        }
    }

    @BeforeEach
    void setUp() {
        CartController cartController = new CartController(new StubCartService());
        mockMvc = MockMvcBuilders.standaloneSetup(cartController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/cart returns 200 OK and current user cart payload")
    void testGetCart() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userRegistrationId").value("23A91A0501"))
                .andExpect(jsonPath("$.subtotal").value(80.00))
                .andExpect(jsonPath("$.tax").value(4.00))
                .andExpect(jsonPath("$.grandTotal").value(84.00))
                .andExpect(jsonPath("$.items[0].foodName").value("Idli (3 pcs)"));
    }

    @Test
    @DisplayName("POST /api/cart/items returns 201 Created and updated cart")
    void testAddItemToCart() throws Exception {
        AddToCartRequest request = AddToCartRequest.builder()
                .foodItemId(1L)
                .quantity(3)
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalItemCount").value(3))
                .andExpect(jsonPath("$.subtotal").value(120.00));
    }

    @Test
    @DisplayName("POST /api/cart/items with invalid quantity returns 400 Bad Request")
    void testAddItemValidationFailure() throws Exception {
        AddToCartRequest request = AddToCartRequest.builder()
                .foodItemId(1L)
                .quantity(0) // Invalid: quantity must be at least 1
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("PUT /api/cart/items/{itemId} returns 200 OK and updated quantity")
    void testUpdateCartItemQuantity() throws Exception {
        UpdateCartItemRequest request = UpdateCartItemRequest.builder().quantity(5).build();

        mockMvc.perform(put("/api/cart/items/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItemCount").value(5))
                .andExpect(jsonPath("$.subtotal").value(200.00));
    }

    @Test
    @DisplayName("DELETE /api/cart/items/{itemId} returns 200 OK and cart without item")
    void testRemoveCartItem() throws Exception {
        mockMvc.perform(delete("/api/cart/items/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItemCount").value(0))
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    @DisplayName("DELETE /api/cart returns 200 OK and empty cart")
    void testClearCart() throws Exception {
        mockMvc.perform(delete("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItemCount").value(0))
                .andExpect(jsonPath("$.subtotal").value(0.00));
    }
}

