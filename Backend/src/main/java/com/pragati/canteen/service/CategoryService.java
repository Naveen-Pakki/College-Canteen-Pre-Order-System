package com.pragati.canteen.service;

import com.pragati.canteen.dto.CategoryDto;
import com.pragati.canteen.dto.CategoryRequest;
import com.pragati.canteen.entity.FoodCategory;
import com.pragati.canteen.exception.DuplicateResourceException;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.FoodCategoryRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final FoodCategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;

    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        String trimmedName = request.getCategoryName().trim();
        if (categoryRepository.existsByCategoryNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Category '" + trimmedName + "' already exists.");
        }

        FoodCategory category = FoodCategory.builder()
                .categoryName(trimmedName)
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        FoodCategory saved = categoryRepository.save(category);
        log.info("Created food category: id={}, name='{}'", saved.getId(), saved.getCategoryName());
        return CategoryDto.fromEntity(saved, 0L);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscCategoryNameAsc().stream()
                .map(cat -> CategoryDto.fromEntity(cat, foodItemRepository.countByCategoryId(cat.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAscCategoryNameAsc().stream()
                .map(cat -> CategoryDto.fromEntity(cat, foodItemRepository.countByCategoryIdAndActiveTrue(cat.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return CategoryDto.fromEntity(category, foodItemRepository.countByCategoryId(category.getId()));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        String trimmedName = request.getCategoryName().trim();
        if (categoryRepository.existsByCategoryNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new DuplicateResourceException("Another category with name '" + trimmedName + "' already exists.");
        }

        category.setCategoryName(trimmedName);
        category.setDescription(request.getDescription());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        FoodCategory updated = categoryRepository.save(category);
        log.info("Updated food category: id={}, name='{}'", updated.getId(), updated.getCategoryName());
        return CategoryDto.fromEntity(updated, foodItemRepository.countByCategoryId(updated.getId()));
    }

    @Transactional
    public CategoryDto updateCategoryStatus(Long id, boolean active) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!active) {
            long activeFoodCount = foodItemRepository.countByCategoryIdAndActiveTrue(id);
            if (activeFoodCount > 0) {
                throw new InvalidOperationException("Cannot deactivate category '" + category.getCategoryName() +
                        "' because it still contains " + activeFoodCount + " active food items. Please deactivate or reassign those items first.");
            }
        }

        category.setActive(active);
        FoodCategory saved = categoryRepository.save(category);
        log.info("Updated category status: id={}, active={}", saved.getId(), saved.isActive());
        return CategoryDto.fromEntity(saved, foodItemRepository.countByCategoryId(saved.getId()));
    }

    @Transactional
    public void deleteCategory(Long id) {
        FoodCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        long foodCount = foodItemRepository.countByCategoryId(id);
        if (foodCount > 0) {
            throw new InvalidOperationException("Cannot delete category '" + category.getCategoryName() +
                    "' because it contains " + foodCount + " food items. Please delete or reassign food items first.");
        }

        categoryRepository.delete(category);
        log.info("Deleted category: id={}, name='{}'", id, category.getCategoryName());
    }
}

