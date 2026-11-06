package com.pragati.canteen.service;

import com.pragati.canteen.dto.DailyMenuItemDto;
import com.pragati.canteen.dto.DailyMenuRequest;
import com.pragati.canteen.entity.DailyMenuItem;
import com.pragati.canteen.entity.FoodCategory;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.exception.DuplicateResourceException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.DailyMenuItemRepository;
import com.pragati.canteen.repository.FoodCategoryRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DailyMenuServiceTest {

    private DailyMenuService dailyMenuService;
    private final Map<Long, DailyMenuItem> menuDb = new HashMap<>();
    private final Map<Long, FoodItem> foodDb = new HashMap<>();
    private long menuIdSeq = 1L;

    @BeforeEach
    void setUp() {
        menuDb.clear();
        foodDb.clear();
        menuIdSeq = 1L;

        FoodCategory cat = FoodCategory.builder().id(1L).categoryName("Breakfast").build();

        FoodItem item1 = FoodItem.builder()
                .id(101L)
                .foodName("Idli")
                .category(cat)
                .price(new BigDecimal("40.00"))
                .availableStock(50)
                .mealType(MealType.BREAKFAST)
                .active(true)
                .availableToday(true)
                .build();
        foodDb.put(101L, item1);

        FoodItem item2 = FoodItem.builder()
                .id(102L)
                .foodName("Dosa")
                .category(cat)
                .price(new BigDecimal("50.00"))
                .availableStock(40)
                .mealType(MealType.BREAKFAST)
                .active(true)
                .availableToday(true)
                .build();
        foodDb.put(102L, item2);

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

        DailyMenuItemRepository fakeDailyMenuRepo = (DailyMenuItemRepository) Proxy.newProxyInstance(
                DailyMenuItemRepository.class.getClassLoader(),
                new Class<?>[]{DailyMenuItemRepository.class},
                (proxy, method, args) -> {
                    String mName = method.getName();
                    if ("save".equals(mName)) {
                        DailyMenuItem item = (DailyMenuItem) args[0];
                        if (item.getId() == null) item.setId(menuIdSeq++);
                        menuDb.put(item.getId(), item);
                        return item;
                    } else if ("findById".equals(mName)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(menuDb.get(id));
                    } else if ("existsByMenuDateAndFoodItemId".equals(mName)) {
                        LocalDate d = (LocalDate) args[0];
                        Long fId = (Long) args[1];
                        return menuDb.values().stream()
                                .anyMatch(m -> m.getMenuDate().equals(d) && m.getFoodItem().getId().equals(fId));
                    } else if ("findByMenuDateOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc".equals(mName)) {
                        LocalDate d = (LocalDate) args[0];
                        return menuDb.values().stream().filter(m -> m.getMenuDate().equals(d)).toList();
                    } else if ("findByMenuDateAndAvailableTrueOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc".equals(mName)) {
                        LocalDate d = (LocalDate) args[0];
                        return menuDb.values().stream().filter(m -> m.getMenuDate().equals(d) && m.isAvailable()).toList();
                    } else if ("delete".equals(mName)) {
                        DailyMenuItem item = (DailyMenuItem) args[0];
                        menuDb.remove(item.getId());
                        return null;
                    }
                    return null;
                }
        );

        CanteenBusinessRuleService businessRuleService = new CanteenBusinessRuleService();
        FoodCategoryRepository fakeCatRepo = (FoodCategoryRepository) Proxy.newProxyInstance(
                FoodCategoryRepository.class.getClassLoader(),
                new Class<?>[]{FoodCategoryRepository.class},
                (proxy, method, args) -> null
        );
        FoodItemService foodItemService = new FoodItemService(fakeFoodRepo, fakeCatRepo, fakeDailyMenuRepo, businessRuleService);

        dailyMenuService = new DailyMenuService(fakeDailyMenuRepo, fakeFoodRepo, foodItemService);
    }

    @Test
    @DisplayName("Add items to daily menu successfully")
    void testAddToDailyMenuSuccess() {
        LocalDate today = LocalDate.now();
        DailyMenuRequest request = DailyMenuRequest.builder()
                .menuDate(today)
                .foodItemIds(List.of(101L, 102L))
                .specialNote("Today's special breakfast")
                .build();

        List<DailyMenuItemDto> items = dailyMenuService.addToDailyMenu(request);

        assertThat(items).hasSize(2);
        assertThat(items.get(0).getMenuDate()).isEqualTo(today);
        assertThat(items.get(0).getFoodItem().getFoodName()).isEqualTo("Idli");
    }

    @Test
    @DisplayName("Prevent duplicate daily menu addition for same item and date")
    void testPreventDuplicateDailyMenuEntry() {
        LocalDate today = LocalDate.now();
        dailyMenuService.addToDailyMenu(DailyMenuRequest.builder()
                .menuDate(today)
                .foodItemIds(List.of(101L))
                .build());

        DailyMenuRequest duplicateReq = DailyMenuRequest.builder()
                .menuDate(today)
                .foodItemIds(List.of(101L))
                .build();

        assertThatThrownBy(() -> dailyMenuService.addToDailyMenu(duplicateReq))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already on the menu for date");
    }

    @Test
    @DisplayName("Remove item from daily menu")
    void testRemoveFromDailyMenu() {
        LocalDate today = LocalDate.now();
        List<DailyMenuItemDto> added = dailyMenuService.addToDailyMenu(DailyMenuRequest.builder()
                .menuDate(today)
                .foodItemIds(List.of(101L))
                .build());

        Long menuId = added.get(0).getId();
        dailyMenuService.removeFromDailyMenu(menuId);

        List<DailyMenuItemDto> menuAfter = dailyMenuService.getDailyMenuForDate(today, false);
        assertThat(menuAfter).isEmpty();
    }

    @Test
    @DisplayName("Toggle daily menu item availability")
    void testToggleDailyMenuAvailability() {
        LocalDate today = LocalDate.now();
        List<DailyMenuItemDto> added = dailyMenuService.addToDailyMenu(DailyMenuRequest.builder()
                .menuDate(today)
                .foodItemIds(List.of(101L))
                .build());

        Long menuId = added.get(0).getId();
        DailyMenuItemDto updated = dailyMenuService.updateDailyMenuItemStatus(menuId, false);

        assertThat(updated.isAvailable()).isFalse();

        // Active only query should filter it out
        List<DailyMenuItemDto> activeMenu = dailyMenuService.getDailyMenuForDate(today, true);
        assertThat(activeMenu).isEmpty();
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when adding invalid food item ID to menu")
    void testAddNonExistentFoodToMenu() {
        DailyMenuRequest badReq = DailyMenuRequest.builder()
                .menuDate(LocalDate.now())
                .foodItemIds(List.of(999L))
                .build();

        assertThatThrownBy(() -> dailyMenuService.addToDailyMenu(badReq))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Food item not found with ID: 999");
    }
}

