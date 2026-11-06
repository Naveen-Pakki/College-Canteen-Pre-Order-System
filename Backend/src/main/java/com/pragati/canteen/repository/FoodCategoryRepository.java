package com.pragati.canteen.repository;

import com.pragati.canteen.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Long> {

    Optional<FoodCategory> findByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCaseAndIdNot(String categoryName, Long id);

    List<FoodCategory> findByActiveTrueOrderByDisplayOrderAscCategoryNameAsc();

    List<FoodCategory> findAllByOrderByDisplayOrderAscCategoryNameAsc();
}

