package com.pragati.canteen.service;

import com.pragati.canteen.dto.AddToCartRequest;
import com.pragati.canteen.dto.CartDto;
import com.pragati.canteen.dto.UpdateCartItemRequest;
import com.pragati.canteen.entity.*;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.CartItemRepository;
import com.pragati.canteen.repository.CartRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import com.pragati.canteen.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CartServiceTest {

    private CartService cartService;

    private final Map<Long, Cart> cartDb = new HashMap<>();
    private final Map<Long, FoodItem> foodDb = new HashMap<>();
    private final Map<String, User> userDb = new HashMap<>();

    private long cartIdSeq = 1L;
    private long cartItemIdSeq = 1L;

    private User studentUser;
    private User facultyUser;
    private FoodItem idliFood;
    private FoodItem dosaFood;

    @BeforeEach
    void setUp() {
        cartDb.clear();
        foodDb.clear();
        userDb.clear();
        cartIdSeq = 1L;
        cartItemIdSeq = 1L;

        studentUser = User.builder()
                .id(1L)
                .registrationId("23A91A0501")
                .fullName("Sai Vardhan")
                .email("student@pragati.edu.in")
                .role(Role.STUDENT)
                .active(true)
                .build();

        facultyUser = User.builder()
                .id(2L)
                .registrationId("FAC1024")
                .fullName("Dr. K. Srinivas")
                .email("faculty@pragati.edu.in")
                .role(Role.FACULTY)
                .active(true)
                .build();

        userDb.put("23a91a0501", studentUser);
        userDb.put("fac1024", facultyUser);

        FoodCategory cat = FoodCategory.builder().id(1L).categoryName("Breakfast").active(true).build();

        idliFood = FoodItem.builder()
                .id(101L)
                .foodName("Idli (3 pcs)")
                .category(cat)
                .price(new BigDecimal("40.00"))
                .availableStock(50)
                .active(true)
                .availableToday(true)
                .mealType(MealType.BREAKFAST)
                .build();
        foodDb.put(101L, idliFood);

        dosaFood = FoodItem.builder()
                .id(102L)
                .foodName("Crispy Masala Dosa")
                .category(cat)
                .price(new BigDecimal("50.00"))
                .availableStock(30)
                .active(true)
                .availableToday(true)
                .mealType(MealType.BREAKFAST)
                .build();
        foodDb.put(102L, dosaFood);

        UserRepository fakeUserRepo = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    if ("findByRegistrationIdIgnoreCaseOrEmailIgnoreCase".equals(method.getName())) {
                        String id = (String) args[0];
                        return Optional.ofNullable(userDb.get(id.toLowerCase()));
                    }
                    return null;
                }
        );

        FoodItemRepository fakeFoodRepo = (FoodItemRepository) Proxy.newProxyInstance(
                FoodItemRepository.class.getClassLoader(),
                new Class<?>[]{FoodItemRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(foodDb.get(id));
                    }
                    return null;
                }
        );

        CartRepository fakeCartRepo = (CartRepository) Proxy.newProxyInstance(
                CartRepository.class.getClassLoader(),
                new Class<?>[]{CartRepository.class},
                (proxy, method, args) -> {
                    String mName = method.getName();
                    if ("save".equals(mName)) {
                        Cart c = (Cart) args[0];
                        if (c.getId() == null) {
                            c.setId(cartIdSeq++);
                        }
                        for (CartItem it : c.getItems()) {
                            if (it.getId() == null) {
                                it.setId(cartItemIdSeq++);
                            }
                            it.setCart(c);
                        }
                        cartDb.put(c.getUser().getId(), c);
                        return c;
                    } else if ("findByUserId".equals(mName)) {
                        Long uid = (Long) args[0];
                        return Optional.ofNullable(cartDb.get(uid));
                    }
                    return null;
                }
        );

        CartItemRepository fakeCartItemRepo = (CartItemRepository) Proxy.newProxyInstance(
                CartItemRepository.class.getClassLoader(),
                new Class<?>[]{CartItemRepository.class},
                (proxy, method, args) -> null
        );

        CanteenBusinessRuleService ruleService = new CanteenBusinessRuleService();
        cartService = new CartService(fakeCartRepo, fakeCartItemRepo, fakeFoodRepo, fakeUserRepo, ruleService);

        // Set default authenticated caller to student
        authenticateAs(studentUser);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user.getRegistrationId(), null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Add item to cart and calculate correct item subtotal, tax, and grand total")
    void testAddItemToCartCalculations() {
        AddToCartRequest request = AddToCartRequest.builder()
                .foodItemId(101L)
                .quantity(2)
                .build();

        CartDto cart = cartService.addItemToCart(request);

        assertThat(cart).isNotNull();
        assertThat(cart.getTotalItemCount()).isEqualTo(2);
        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().get(0).getFoodName()).isEqualTo("Idli (3 pcs)");
        assertThat(cart.getItems().get(0).getUnitPrice()).isEqualByComparingTo("40.00");
        assertThat(cart.getItems().get(0).getItemSubtotal()).isEqualByComparingTo("80.00");

        // Subtotal: 80.00, Tax (5%): 4.00, Grand Total: 84.00
        assertThat(cart.getSubtotal()).isEqualByComparingTo("80.00");
        assertThat(cart.getTax()).isEqualByComparingTo("4.00");
        assertThat(cart.getGrandTotal()).isEqualByComparingTo("84.00");

        // Verify stock in database was NOT deducted
        assertThat(idliFood.getAvailableStock()).isEqualTo(50);
    }

    @Test
    @DisplayName("Adding existing food item increments quantity without duplicate entries")
    void testAddExistingItemIncrementsQuantity() {
        cartService.addItemToCart(AddToCartRequest.builder().foodItemId(101L).quantity(2).build());
        CartDto cart = cartService.addItemToCart(AddToCartRequest.builder().foodItemId(101L).quantity(3).build());

        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().get(0).getQuantity()).isEqualTo(5);
        assertThat(cart.getItems().get(0).getItemSubtotal()).isEqualByComparingTo("200.00");
        assertThat(cart.getTotalItemCount()).isEqualTo(5);

        // Verify stock remains untouched
        assertThat(idliFood.getAvailableStock()).isEqualTo(50);
    }

    @Test
    @DisplayName("Reject adding quantity greater than available stock")
    void testInsufficientStockRejection() {
        AddToCartRequest request = AddToCartRequest.builder()
                .foodItemId(102L)
                .quantity(35) // Only 30 available
                .build();

        assertThatThrownBy(() -> cartService.addItemToCart(request))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    @DisplayName("Reject adding inactive or unavailable food items")
    void testInactiveFoodRejection() {
        idliFood.setActive(false);

        AddToCartRequest request = AddToCartRequest.builder()
                .foodItemId(101L)
                .quantity(1)
                .build();

        assertThatThrownBy(() -> cartService.addItemToCart(request))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    @DisplayName("Update item quantity directly and via delta")
    void testUpdateCartItemQuantity() {
        CartDto initialCart = cartService.addItemToCart(AddToCartRequest.builder().foodItemId(101L).quantity(2).build());
        Long cartItemId = initialCart.getItems().get(0).getId();

        // Direct quantity update to 4
        CartDto updated = cartService.updateCartItemQuantity(cartItemId, UpdateCartItemRequest.builder().quantity(4).build());
        assertThat(updated.getItems().get(0).getQuantity()).isEqualTo(4);
        assertThat(updated.getSubtotal()).isEqualByComparingTo("160.00");

        // Delta adjustment (+2 -> 6)
        CartDto deltaUpdated = cartService.updateCartItemQuantity(cartItemId, UpdateCartItemRequest.builder().delta(2).build());
        assertThat(deltaUpdated.getItems().get(0).getQuantity()).isEqualTo(6);

        // Zero or negative quantity rejection
        assertThatThrownBy(() -> cartService.updateCartItemQuantity(cartItemId, UpdateCartItemRequest.builder().quantity(0).build()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Quantity must be at least 1");
    }

    @Test
    @DisplayName("Remove individual item and clear entire cart")
    void testRemoveItemAndClearCart() {
        cartService.addItemToCart(AddToCartRequest.builder().foodItemId(101L).quantity(1).build());
        CartDto cart = cartService.addItemToCart(AddToCartRequest.builder().foodItemId(102L).quantity(1).build());
        assertThat(cart.getItems()).hasSize(2);

        Long item1Id = cart.getItems().get(0).getId();
        CartDto afterRemoval = cartService.removeCartItem(item1Id);
        assertThat(afterRemoval.getItems()).hasSize(1);

        CartDto cleared = cartService.clearCart();
        assertThat(cleared.getItems()).isEmpty();
        assertThat(cleared.getTotalItemCount()).isEqualTo(0);
        assertThat(cleared.getSubtotal()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Strict Account Isolation: Student and Faculty carts are completely independent")
    void testStrictAccountIsolation() {
        // 1. Student adds Idli to their cart
        authenticateAs(studentUser);
        cartService.addItemToCart(AddToCartRequest.builder().foodItemId(101L).quantity(2).build());
        CartDto studentCart = cartService.getCartForCurrentUser();
        assertThat(studentCart.getUserRegistrationId()).isEqualTo("23A91A0501");
        assertThat(studentCart.getItems()).hasSize(1);
        assertThat(studentCart.getItems().get(0).getFoodName()).isEqualTo("Idli (3 pcs)");
        Long studentItemId = studentCart.getItems().get(0).getId();

        // 2. Switch context to Faculty
        authenticateAs(facultyUser);
        CartDto facultyCartInitial = cartService.getCartForCurrentUser();
        assertThat(facultyCartInitial.getItems()).isEmpty(); // Faculty cart is empty!

        // Faculty adds Dosa
        cartService.addItemToCart(AddToCartRequest.builder().foodItemId(102L).quantity(1).build());
        CartDto facultyCart = cartService.getCartForCurrentUser();
        assertThat(facultyCart.getUserRegistrationId()).isEqualTo("FAC1024");
        assertThat(facultyCart.getItems()).hasSize(1);
        assertThat(facultyCart.getItems().get(0).getFoodName()).isEqualTo("Crispy Masala Dosa");

        // 3. Faculty attempts to modify or delete Student's cart item -> REJECTED
        assertThatThrownBy(() -> cartService.removeCartItem(studentItemId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found in your active cart");

        assertThatThrownBy(() -> cartService.updateCartItemQuantity(studentItemId, UpdateCartItemRequest.builder().quantity(10).build()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found in your active cart");

        // 4. Verify Student's cart was not affected
        authenticateAs(studentUser);
        CartDto studentCartAfter = cartService.getCartForCurrentUser();
        assertThat(studentCartAfter.getItems()).hasSize(1);
        assertThat(studentCartAfter.getItems().get(0).getQuantity()).isEqualTo(2);
    }
}

