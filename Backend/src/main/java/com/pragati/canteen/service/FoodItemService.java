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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final FoodCategoryRepository categoryRepository;
    private final DailyMenuItemRepository dailyMenuItemRepository;
    private final CanteenBusinessRuleService businessRuleService;

    @Transactional
    public FoodItemDto addFoodItem(FoodItemRequest request) {
        String trimmedName = request.getFoodName().trim();

        FoodCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        if (foodItemRepository.existsByFoodNameIgnoreCaseAndCategoryId(trimmedName, category.getId())) {
            throw new DuplicateResourceException("Food item '" + trimmedName + "' already exists in category '" + category.getCategoryName() + "'.");
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Price must be a valid non-negative amount.");
        }

        if (request.getAvailableStock() == null || request.getAvailableStock() < 0) {
            throw new InvalidOperationException("Stock must be a non-negative integer.");
        }

        FoodItem item = FoodItem.builder()
                .foodName(trimmedName)
                .description(request.getDescription())
                .category(category)
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .availableStock(request.getAvailableStock())
                .active(request.getActive() != null ? request.getActive() : true)
                .availableToday(request.getAvailableToday() != null ? request.getAvailableToday() : true)
                .mealType(request.getMealType() != null ? request.getMealType() : MealType.LUNCH)
                .isVeg(request.getIsVeg() != null ? request.getIsVeg() : true)
                .prepTime(request.getPrepTime())
                .isPopular(request.getIsPopular() != null ? request.getIsPopular() : false)
                .build();

        FoodItem saved = foodItemRepository.save(item);
        log.info("Added food item: id={}, name='{}', category='{}'", saved.getId(), saved.getFoodName(), category.getCategoryName());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public FoodItemDto getFoodItemById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        return mapToDto(item);
    }

    @Transactional
    public FoodItemDto updateFoodItem(Long id, FoodItemRequest request) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        String trimmedName = request.getFoodName().trim();
        FoodCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        if (foodItemRepository.existsByFoodNameIgnoreCaseAndCategoryIdAndIdNot(trimmedName, category.getId(), id)) {
            throw new DuplicateResourceException("Another food item named '" + trimmedName + "' already exists in category '" + category.getCategoryName() + "'.");
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Price must be a valid non-negative amount.");
        }

        if (request.getAvailableStock() == null || request.getAvailableStock() < 0) {
            throw new InvalidOperationException("Stock must be a non-negative integer.");
        }

        item.setFoodName(trimmedName);
        item.setDescription(request.getDescription());
        item.setCategory(category);
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        item.setAvailableStock(request.getAvailableStock());
        if (request.getActive() != null) item.setActive(request.getActive());
        if (request.getAvailableToday() != null) item.setAvailableToday(request.getAvailableToday());
        if (request.getMealType() != null) item.setMealType(request.getMealType());
        if (request.getIsVeg() != null) item.setVeg(request.getIsVeg());
        item.setPrepTime(request.getPrepTime());
        if (request.getIsPopular() != null) item.setPopular(request.getIsPopular());

        FoodItem updated = foodItemRepository.save(item);
        log.info("Updated food item: id={}, name='{}'", updated.getId(), updated.getFoodName());
        return mapToDto(updated);
    }

    @Transactional
    public FoodItemDto updateStock(Long id, StockUpdateRequest request) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        int newStock;
        if (request.getStock() != null) {
            newStock = request.getStock();
        } else if (request.getDelta() != null) {
            newStock = item.getAvailableStock() + request.getDelta();
        } else {
            throw new InvalidOperationException("Either 'stock' or 'delta' must be provided.");
        }

        if (newStock < 0) {
            throw new InvalidOperationException("Stock cannot be negative. Current stock is " + item.getAvailableStock() + ".");
        }

        item.setAvailableStock(newStock);
        FoodItem saved = foodItemRepository.save(item);
        log.info("Updated stock for item id={}: newStock={}", saved.getId(), saved.getAvailableStock());
        return mapToDto(saved);
    }

    @Transactional
    public FoodItemDto updateStatus(Long id, StatusUpdateRequest request) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        if (request.getActive() != null) {
            item.setActive(request.getActive());
        }
        if (request.getAvailableToday() != null) {
            item.setAvailableToday(request.getAvailableToday());
        }

        FoodItem saved = foodItemRepository.save(item);
        log.info("Updated status for food id={}: active={}, availableToday={}", saved.getId(), saved.isActive(), saved.isAvailableToday());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<FoodItemDto> searchActiveFoods(Long categoryId, MealType mealType, String query) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return foodItemRepository.searchActiveFoodItems(categoryId, mealType, cleanQuery).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<FoodItemDto> searchFoodsAdmin(Boolean active, Long categoryId, MealType mealType, String query, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return foodItemRepository.searchFoodItemsAdmin(active, categoryId, mealType, cleanQuery, pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public void deleteFoodItem(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        long dailyMenuCount = dailyMenuItemRepository.countByFoodItemId(id);
        if (dailyMenuCount > 0) {
            // Soft delete / deactivate to preserve historical integrity
            item.setActive(false);
            item.setAvailableToday(false);
            foodItemRepository.save(item);
            log.info("Deactivated food item id={} because it has associated daily menu records", id);
        } else {
            foodItemRepository.delete(item);
            log.info("Deleted food item id={}", id);
        }
    }

    public FoodItemDto mapToDto(FoodItem item) {
        boolean windowOpen = businessRuleService.isWindowOpen(item.getMealType());
        String windowMessage = businessRuleService.getScheduleMessage(item.getMealType());
        return FoodItemDto.fromEntity(item, windowOpen, windowMessage);
    }
}

