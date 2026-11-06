package com.pragati.canteen.controller;

import com.pragati.canteen.dto.ApiResponse;
import com.pragati.canteen.dto.OrderDto;
import com.pragati.canteen.dto.OrderStatusUpdateRequest;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Admin order management:
 * full orders ledger, stage progression, digital ticket verification,
 * and unpaid order expiration sweep.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * Lists and searches all orders across the campus with optional status and text filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderDto> orders = orderService.getAllOrdersAdmin(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin orders fetched successfully.", orders));
    }

    /**
     * Retrieves full order details by ID for administration and kitchen verification.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long orderId) {
        OrderDto order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order details fetched successfully.", order));
    }

    /**
     * Advances or updates an order's lifecycle stage (e.g. CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> COMPLETED).
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderDto updated = orderService.updateOrderStatusByAdmin(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + updated.getOrderStatus(), updated));
    }

    /**
     * Triggers a sweep to expire all unpaid orders past the 15-minute checkout window and restore inventory.
     */
    @PostMapping("/expire-unpaid")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sweepExpiredOrders() {
        int count = orderService.expireUnpaidOrders();
        return ResponseEntity.ok(ApiResponse.success(
                "Expired orders sweep completed. " + count + " order(s) transitioned to EXPIRED and inventory restored.",
                Map.of("expiredCount", count)
        ));
    }
}

