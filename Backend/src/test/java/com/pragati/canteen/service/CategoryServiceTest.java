package com.pragati.canteen.service;

import com.pragati.canteen.dto.CategoryDto;
import com.pragati.canteen.dto.CategoryRequest;
import com.pragati.canteen.entity.FoodCategory;
import com.pragati.canteen.exception.DuplicateResourceException;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.FoodCategoryRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CategoryServiceTest {

    private CategoryService categoryService;
    private final Map<Long, FoodCategory> categoryDb = new HashMap<>();
    private final Map<Long, Long> activeFoodCountMap = new HashMap<>();
    private long idSeq = 1L;

    @BeforeEach
    void setUp() {
        categoryDb.clear();
        activeFoodCountMap.clear();
        idSeq = 1L;

        FoodCategoryRepository fakeCategoryRepo = (FoodCategoryRepository) Proxy.newProxyInstance(
                FoodCategoryRepository.class.getClassLoader(),
                new Class<?>[]{FoodCategoryRepository.class},
                (proxy, method, args) -> {
                    String mName = method.getName();
                    if ("save".equals(mName)) {
                        FoodCategory cat = (FoodCategory) args[0];
                        if (cat.getId() == null) {
                            cat.setId(idSeq++);
                        }
                        categoryDb.put(cat.getId(), cat);
                        return cat;
                    } else if ("findById".equals(mName)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(categoryDb.get(id));
                    } else if ("existsByCategoryNameIgnoreCase".equals(mName)) {
                        String name = (String) args[0];
                        return categoryDb.values().stream()
                                .anyMatch(c -> c.getCategoryName().equalsIgnoreCase(name));
                    } else if ("existsByCategoryNameIgnoreCaseAndIdNot".equals(mName)) {
                        String name = (String) args[0];
                        Long id = (Long) args[1];
                        return categoryDb.values().stream()
                                .anyMatch(c -> c.getCategoryName().equalsIgnoreCase(name) && !c.getId().equals(id));
                    } else if ("findAllByOrderByDisplayOrderAscCategoryNameAsc".equals(mName)) {
                        return new ArrayList<>(categoryDb.values());
                    } else if ("findByActiveTrueOrderByDisplayOrderAscCategoryNameAsc".equals(mName)) {
                        return categoryDb.values().stream().filter(FoodCategory::isActive).toList();
                    } else if ("delete".equals(mName)) {
                        FoodCategory cat = (FoodCategory) args[0];
                        categoryDb.remove(cat.getId());
                        return null;
                    }
                    return null;
                }
        );

        FoodItemRepository fakeFoodRepo = (FoodItemRepository) Proxy.newProxyInstance(
                FoodItemRepository.class.getClassLoader(),
                new Class<?>[]{FoodItemRepository.class},
                (proxy, method, args) -> {
                    String mName = method.getName();
                    if ("countByCategoryId".equals(mName)) {
                        Long catId = (Long) args[0];
                        return activeFoodCountMap.getOrDefault(catId, 0L);
                    } else if ("countByCategoryIdAndActiveTrue".equals(mName)) {
                        Long catId = (Long) args[0];
                        return activeFoodCountMap.getOrDefault(catId, 0L);
                    }
                    return 0L;
                }
        );

        categoryService = new CategoryService(fakeCategoryRepo, fakeFoodRepo);
    }

    @Test
    @DisplayName("Create category successfully")
    void testCreateCategorySuccess() {
        CategoryRequest request = CategoryRequest.builder()
                .categoryName("Breakfast")
                .description("South Indian morning tiffins")
                .active(true)
                .displayOrder(1)
                .build();

        CategoryDto dto = categoryService.createCategory(request);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isNotNull();
        assertThat(dto.getCategoryName()).isEqualTo("Breakfast");
        assertThat(dto.isActive()).isTrue();
    }

    @Test
    @DisplayName("Prevent duplicate category creation (case-insensitive)")
    void testDuplicateCategoryPrevention() {
        CategoryRequest req1 = CategoryRequest.builder().categoryName("Lunch").build();
        categoryService.createCategory(req1);

        CategoryRequest req2 = CategoryRequest.builder().categoryName("LUNCH").build();
        assertThatThrownBy(() -> categoryService.createCategory(req2))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Prevent deactivation if category has active food items")
    void testPreventDeactivationWithActiveFoodItems() {
        CategoryDto cat = categoryService.createCategory(CategoryRequest.builder().categoryName("Beverages").build());
        activeFoodCountMap.put(cat.getId(), 5L); // 5 active foods in Beverages

        assertThatThrownBy(() -> categoryService.updateCategoryStatus(cat.getId(), false))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("still contains 5 active food items");
    }

    @Test
    @DisplayName("Allow deactivation if category has zero active items")
    void testAllowDeactivationWhenEmpty() {
        CategoryDto cat = categoryService.createCategory(CategoryRequest.builder().categoryName("Seasonal").build());
        CategoryDto updated = categoryService.updateCategoryStatus(cat.getId(), false);

        assertThat(updated.isActive()).isFalse();
    }

    @Test
    @DisplayName("Prevent deletion if category has food items")
    void testPreventDeletionWithFoodItems() {
        CategoryDto cat = categoryService.createCategory(CategoryRequest.builder().categoryName("Cakes").build());
        activeFoodCountMap.put(cat.getId(), 2L);

        assertThatThrownBy(() -> categoryService.deleteCategory(cat.getId()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("contains 2 food items");
    }

    @Test
    @DisplayName("Find category by non-existent ID throws ResourceNotFoundException")
    void testCategoryNotFound() {
        assertThatThrownBy(() -> categoryService.getCategoryById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found with ID: 999");
    }
}

