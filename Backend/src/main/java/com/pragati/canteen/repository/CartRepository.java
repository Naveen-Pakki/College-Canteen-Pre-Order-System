package com.pragati.canteen.repository;

import com.pragati.canteen.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {"items", "items.foodItem", "items.foodItem.category"})
    Optional<Cart> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"items", "items.foodItem", "items.foodItem.category"})
    Optional<Cart> findByUserRegistrationIdIgnoreCase(String registrationId);

    boolean existsByUserId(Long userId);
}

