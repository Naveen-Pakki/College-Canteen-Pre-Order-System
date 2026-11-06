package com.pragati.canteen.repository;

import com.pragati.canteen.entity.Order;
import com.pragati.canteen.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    Optional<Order> findByIdempotencyKeyAndUserId(String idempotencyKey, Long userId);

    Page<Order> findByUserIdOrderByOrderDateDesc(Long userId, Pageable pageable);

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.orderStatus = :status) AND " +
           "(:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.tokenNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.user.registrationId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> searchOrdersAdmin(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    List<Order> findByOrderStatusAndPaymentExpiresAtBeforeAndStockReservedTrue(
            OrderStatus status,
            LocalDateTime time
    );

    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    long countByOrderStatus(OrderStatus status);
}

