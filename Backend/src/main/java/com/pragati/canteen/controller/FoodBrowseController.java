package com.pragati.canteen.controller;

import com.pragati.canteen.dto.CategoryDto;
import com.pragati.canteen.dto.DailyMenuItemDto;
import com.pragati.canteen.dto.FoodItemDto;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.service.CategoryService;
import com.pragati.canteen.service.DailyMenuService;
import com.pragati.canteen.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for Student and Faculty food browsing, categories, and today's menu.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class FoodBrowseController {

    private final FoodItemService foodItemService;
    private final CategoryService categoryService;
    private final DailyMenuService dailyMenuService;

    @GetMapping("/api/foods")
    public ResponseEntity<List<FoodItemDto>> getActiveFoods(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MealType mealType,
            @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(foodItemService.searchActiveFoods(categoryId, mealType, query));
    }

    @GetMapping("/api/foods/{id}")
    public ResponseEntity<FoodItemDto> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }

    @GetMapping("/api/foods/categories")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @GetMapping("/api/foods/daily-menu")
    public ResponseEntity<List<DailyMenuItemDto>> getDailyMenu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dailyMenuService.getDailyMenuForDate(date, true));
    }

    // Frontend compatibility endpoints
    @GetMapping("/api/menu/today")
    public ResponseEntity<List<DailyMenuItemDto>> getMenuToday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dailyMenuService.getDailyMenuForDate(date, true));
    }

    @GetMapping("/api/menu/items")
    public ResponseEntity<List<FoodItemDto>> getMenuItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MealType mealType,
            @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(foodItemService.searchActiveFoods(categoryId, mealType, query));
    }
}

