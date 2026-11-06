package com.pragati.canteen.service;

import com.pragati.canteen.dto.FoodItemDto;
import com.pragati.canteen.dto.FoodItemRequest;
import com.pragati.canteen.dto.StatusUpdateRequest;
import com.pragati.canteen.dto.StockUpdateRequest;
import com.pragati.canteen.entity.FoodCategory;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.exception.DuplicateResourceException;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.DailyMenuItemRepository;
import com.pragati.canteen.repository.FoodCategoryRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FoodItemServiceTest {

    private FoodItemService foodItemService;
    private final Map<Long, FoodItem> foodDb = new HashMap<>();
    private final Map<Long, FoodCategory> categoryDb = new HashMap<>();
    private long foodIdSeq = 1L;

    @BeforeEach
    void setUp() {
        foodDb.clear();
        categoryDb.clear();
        foodIdSeq = 1L;

        FoodCategory tiffins = FoodCategory.builder()
                .id(1L)
                .categoryName("Breakfast")
                .active(true)
                .build();
        categoryDb.put(1L, tiffins);

        FoodCategory lunch = FoodCategory.builder()
                .id(2L)
                .categoryName("Lunch")
                .active(true)
                .build();
        categoryDb.put(2L, lunch);

        FoodCategoryRepository fakeCategoryRepo = (FoodCategoryRepository) Proxy.newProxyInstance(
                FoodCategoryRepository.class.getClassLoader(),
                new Class<?>[]{FoodCategoryRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(categoryDb.get(id));
                    }
                    return null;
                }
        );

        FoodItemRepository fakeFoodRepo = (FoodItemRepository) Proxy.newProxyInstance(
                FoodItemRepository.class.getClassLoader(),
                new Class<?>[]{FoodItemRepository.class},
                (proxy, method, args) -> {
                    String mName = method.getName();
                    if ("save".equals(mName)) {
                        FoodItem item = (FoodItem) args[0];
                        if (item.getId() == null) {
                            item.setId(foodIdSeq++);
                        }
                        foodDb.put(item.getId(), item);
                        return item;
                    } else if ("findById".equals(mName)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(foodDb.get(id));
                    } else if ("existsByFoodNameIgnoreCaseAndCategoryId".equals(mName)) {
                        String name = (String) args[0];
                        Long catId = (Long) args[1];
                        return foodDb.values().stream()
                                .anyMatch(f -> f.getFoodName().equalsIgnoreCase(name) && f.getCategory().getId().equals(catId));
                    } else if ("existsByFoodNameIgnoreCaseAndCategoryIdAndIdNot".equals(mName)) {
                        String name = (String) args[0];
                        Long catId = (Long) args[1];
                        Long id = (Long) args[2];
                        return foodDb.values().stream()
                                .anyMatch(f -> f.getFoodName().equalsIgnoreCase(name) && f.getCategory().getId().equals(catId) && !f.getId().equals(id));
                    } else if ("searchActiveFoodItems".equals(mName)) {
                        return foodDb.values().stream().filter(FoodItem::isActive).toList();
                    } else if ("delete".equals(mName)) {
                        FoodItem item = (FoodItem) args[0];
                        foodDb.remove(item.getId());
                        return null;
                    }
                    return null;
                }
        );

        DailyMenuItemRepository fakeDailyMenuRepo = (DailyMenuItemRepository) Proxy.newProxyInstance(
                DailyMenuItemRepository.class.getClassLoader(),
                new Class<?>[]{DailyMenuItemRepository.class},
                (proxy, method, args) -> {
                    if ("countByFoodItemId".equals(method.getName())) {
                        return 0L;
                    }
                    return null;
                }
        );

        CanteenBusinessRuleService businessRuleService = new CanteenBusinessRuleService();
        foodItemService = new FoodItemService(fakeFoodRepo, fakeCategoryRepo, fakeDailyMenuRepo, businessRuleService);
    }

    @Test
    @DisplayName("Add food item successfully with BigDecimal price and positive stock")
    void testAddFoodItemSuccess() {
        FoodItemRequest request = FoodItemRequest.builder()
                .foodName("Masala Dosa")
                .categoryId(1L)
                .price(new BigDecimal("50.00"))
                .availableStock(40)
                .mealType(MealType.BREAKFAST)
                .isVeg(true)
                .prepTime("8 mins")
                .build();

        FoodItemDto dto = foodItemService.addFoodItem(request);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isNotNull();
        assertThat(dto.getFoodName()).isEqualTo("Masala Dosa");
        assertThat(dto.getPrice()).isEqualByComparingTo("50.00");
        assertThat(dto.getAvailableStock()).isEqualTo(40);
        assertThat(dto.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("Prevent duplicate food name in same category")
    void testPreventDuplicateFoodInSameCategory() {
        FoodItemRequest request1 = FoodItemRequest.builder()
                .foodName("Idli")
                .categoryId(1L)
                .price(new BigDecimal("40.00"))
                .availableStock(50)
                .build();
        foodItemService.addFoodItem(request1);

        FoodItemRequest request2 = FoodItemRequest.builder()
                .foodName("IDLI")
                .categoryId(1L)
                .price(new BigDecimal("45.00"))
                .availableStock(20)
                .build();

        assertThatThrownBy(() -> foodItemService.addFoodItem(request2))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists in category");
    }

    @Test
    @DisplayName("Reject negative price on food addition")
    void testRejectNegativePrice() {
        FoodItemRequest request = FoodItemRequest.builder()
                .foodName("Vada")
                .categoryId(1L)
                .price(new BigDecimal("-10.00"))
                .availableStock(20)
                .build();

        assertThatThrownBy(() -> foodItemService.addFoodItem(request))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Price must be a valid non-negative amount");
    }

    @Test
    @DisplayName("Update stock: absolute value")
    void testUpdateStockAbsolute() {
        FoodItemDto created = foodItemService.addFoodItem(FoodItemRequest.builder()
                .foodName("Biryani")
                .categoryId(2L)
                .price(new BigDecimal("120.00"))
                .availableStock(30)
                .build());

        StockUpdateRequest updateReq = StockUpdateRequest.builder().stock(75).build();
        FoodItemDto updated = foodItemService.updateStock(created.getId(), updateReq);

        assertThat(updated.getAvailableStock()).isEqualTo(75);
    }

    @Test
    @DisplayName("Update stock: delta increment and decrement")
    void testUpdateStockDelta() {
        FoodItemDto created = foodItemService.addFoodItem(FoodItemRequest.builder()
                .foodName("Fried Rice")
                .categoryId(2L)
                .price(new BigDecimal("80.00"))
                .availableStock(20)
                .build());

        // Increment delta (+15)
        FoodItemDto inc = foodItemService.updateStock(created.getId(), StockUpdateRequest.builder().delta(15).build());
        assertThat(inc.getAvailableStock()).isEqualTo(35);

        // Decrement delta (-10)
        FoodItemDto dec = foodItemService.updateStock(created.getId(), StockUpdateRequest.builder().delta(-10).build());
        assertThat(dec.getAvailableStock()).isEqualTo(25);
    }

    @Test
    @DisplayName("Prevent stock from becoming negative via delta")
    void testPreventNegativeStockOnDelta() {
        FoodItemDto created = foodItemService.addFoodItem(FoodItemRequest.builder()
                .foodName("Curd Rice")
                .categoryId(2L)
                .price(new BigDecimal("60.00"))
                .availableStock(5)
                .build());

        StockUpdateRequest badReq = StockUpdateRequest.builder().delta(-10).build();

        assertThatThrownBy(() -> foodItemService.updateStock(created.getId(), badReq))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Stock cannot be negative");
    }

    @Test
    @DisplayName("Toggle item status and availability today")
    void testToggleStatus() {
        FoodItemDto created = foodItemService.addFoodItem(FoodItemRequest.builder()
                .foodName("Poori")
                .categoryId(1L)
                .price(new BigDecimal("45.00"))
                .availableStock(25)
                .build());

        StatusUpdateRequest statusReq = StatusUpdateRequest.builder().availableToday(false).build();
        FoodItemDto updated = foodItemService.updateStatus(created.getId(), statusReq);

        assertThat(updated.isAvailableToday()).isFalse();
        assertThat(updated.isAvailable()).isFalse(); // Not available when availableToday is false
    }
}

