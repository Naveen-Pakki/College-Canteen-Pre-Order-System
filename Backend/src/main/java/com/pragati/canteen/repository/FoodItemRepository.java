package com.pragati.canteen.repository;

import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.enums.MealType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByActiveTrue();

    List<FoodItem> findByActiveTrueAndAvailableTodayTrue();

    List<FoodItem> findByCategoryIdAndActiveTrue(Long categoryId);

    List<FoodItem> findByMealTypeAndActiveTrue(MealType mealType);

    long countByCategoryId(Long categoryId);

    long countByCategoryIdAndActiveTrue(Long categoryId);

    boolean existsByFoodNameIgnoreCaseAndCategoryId(String foodName, Long categoryId);

    boolean existsByFoodNameIgnoreCaseAndCategoryIdAndIdNot(String foodName, Long categoryId, Long id);

    @Query("SELECT f FROM FoodItem f WHERE f.active = true AND " +
            "(:categoryId IS NULL OR f.category.id = :categoryId) AND " +
            "(:mealType IS NULL OR f.mealType = :mealType) AND " +
            "(:query IS NULL OR LOWER(f.foodName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<FoodItem> searchActiveFoodItems(
            @Param("categoryId") Long categoryId,
            @Param("mealType") MealType mealType,
            @Param("query") String query
    );

    @Query("SELECT f FROM FoodItem f WHERE " +
            "(:active IS NULL OR f.active = :active) AND " +
            "(:categoryId IS NULL OR f.category.id = :categoryId) AND " +
            "(:mealType IS NULL OR f.mealType = :mealType) AND " +
            "(:query IS NULL OR LOWER(f.foodName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<FoodItem> searchFoodItemsAdmin(
            @Param("active") Boolean active,
            @Param("categoryId") Long categoryId,
            @Param("mealType") MealType mealType,
            @Param("query") String query,
            Pageable pageable
    );

    /**
     * Atomically decrements the stock of a food item only if availableStock >= quantity.
     * Prevents race conditions and guarantees non-negative inventory under concurrency.
     * Returns 1 if updated successfully, 0 if stock was insufficient.
     */
    @Modifying
    @Query("UPDATE FoodItem f SET f.availableStock = f.availableStock - :quantity WHERE f.id = :foodId AND f.availableStock >= :quantity")
    int reserveStock(@Param("foodId") Long foodId, @Param("quantity") Integer quantity);

    /**
     * Atomically restores inventory for an item upon order cancellation, failure, or expiration.
     */
    @Modifying
    @Query("UPDATE FoodItem f SET f.availableStock = f.availableStock + :quantity WHERE f.id = :foodId")
    int restoreStock(@Param("foodId") Long foodId, @Param("quantity") Integer quantity);
}

