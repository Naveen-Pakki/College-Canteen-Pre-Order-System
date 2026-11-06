package com.pragati.canteen.controller;

import com.pragati.canteen.dto.*;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.service.FoodImageService;
import com.pragati.canteen.service.FoodItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/foods")
@RequiredArgsConstructor
public class AdminFoodController {

    private final FoodItemService foodItemService;
    private final FoodImageService foodImageService;

    @PostMapping
    public ResponseEntity<FoodItemDto> addFood(@Valid @RequestBody FoodItemRequest request) {
        FoodItemDto created = foodItemService.addFoodItem(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<FoodItemDto>> getFoods(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MealType mealType,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "category.displayOrder,foodName") String sort
    ) {
        Sort sortObj = Sort.by(Sort.Direction.ASC, "foodName");
        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ResponseEntity.ok(foodItemService.searchFoodsAdmin(active, categoryId, mealType, query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDto> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItemDto> updateFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<FoodItemDto> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(foodItemService.updateStock(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FoodItemDto> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(foodItemService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFood(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok(ApiResponse.success("Food item removed successfully.", null));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFoodImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = foodImageService.storeImage(file);
        Map<String, String> response = new LinkedHashMap<>();
        response.put("imageUrl", imageUrl);
        response.put("message", "Food image uploaded successfully.");
        return ResponseEntity.ok(response);
    }
}

