package com.pragati.canteen.controller;

import com.pragati.canteen.dto.ApiResponse;
import com.pragati.canteen.dto.OrderDto;
import com.pragati.canteen.dto.OrderPlacementRequest;
import com.pragati.canteen.dto.OrderTicketDto;
import com.pragati.canteen.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Student and Faculty order management:
 * placing orders from cart, tracking lifecycle, viewing digital tickets,
 * and cancelling orders.
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Converts the authenticated user's cart into an active order with inventory reservation.
     * Supports optional X-Idempotency-Key header for duplicate request protection.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String headerIdempotencyKey,
            @Valid @RequestBody(required = false) OrderPlacementRequest request
    ) {
        OrderPlacementRequest req = (request != null) ? request : new OrderPlacementRequest();
        if (headerIdempotencyKey != null && !headerIdempotencyKey.trim().isEmpty() && req.getIdempotencyKey() == null) {
            req.setIdempotencyKey(headerIdempotencyKey.trim());
        }

        OrderDto order = orderService.placeOrder(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Order placed successfully. Pickup token: " + order.getTokenNumber(), order)
        );
    }

    /**
     * Retrieves paginated order history for the authenticated user, sorted newest first.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<OrderDto> orders = orderService.getUserOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Fetched user orders successfully.", orders));
    }

    /**
     * Retrieves an order by its numeric ID with strict account isolation.
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long orderId) {
        OrderDto order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully.", order));
    }

    /**
     * Retrieves the digital pickup ticket for an order.
     */
    @GetMapping("/{orderId}/ticket")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderTicketDto>> getOrderTicket(@PathVariable Long orderId) {
        OrderTicketDto ticket = orderService.getOrderTicket(orderId);
        return ResponseEntity.ok(ApiResponse.success("Digital ticket retrieved successfully.", ticket));
    }

    /**
     * Cancels an order and restores reserved stock exactly once.
     */
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = (body != null) ? body.get("reason") : null;
        OrderDto cancelled = orderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully. Reserved stock has been restored.", cancelled));
    }
}

