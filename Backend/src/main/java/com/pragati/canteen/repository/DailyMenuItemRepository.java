package com.pragati.canteen.repository;

import com.pragati.canteen.entity.DailyMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMenuItemRepository extends JpaRepository<DailyMenuItem, Long> {

    List<DailyMenuItem> findByMenuDateOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc(LocalDate menuDate);

    List<DailyMenuItem> findByMenuDateAndAvailableTrueOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc(LocalDate menuDate);

    boolean existsByMenuDateAndFoodItemId(LocalDate menuDate, Long foodItemId);

    Optional<DailyMenuItem> findByMenuDateAndFoodItemId(LocalDate menuDate, Long foodItemId);

    void deleteByMenuDateAndFoodItemId(LocalDate menuDate, Long foodItemId);

    long countByFoodItemId(Long foodItemId);
}

