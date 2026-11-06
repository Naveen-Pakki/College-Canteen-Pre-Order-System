package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.entity.Order;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Complete order response DTO. Compatible with both standard REST clients
 * and existing React frontend components (Checkout, Orders ledger, Tracking).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private String orderNumber;
    private String tokenNumber;
    private Long userId;
    private String userRegistrationId;
    private String userName;
    private String userRole;
    private LocalDateTime orderDate;
    private String formattedDate;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private boolean stockReserved;
    private LocalDateTime paymentExpiresAt;
    private String specialInstructions;
    private String adminNote;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private List<OrderItemDto> items;

    // Frontend compatibility properties
    @JsonProperty("status")
    public String getStatus() {
        return orderStatus != null ? orderStatus.name() : null;
    }

    @JsonProperty("date")
    public String getDate() {
        return formattedDate;
    }

    @JsonProperty("pickupDate")
    public String getPickupDate() {
        return formattedDate;
    }

    public static OrderDto fromEntity(Order order) {
        String formatted = null;
        if (order.getOrderDate() != null) {
            formatted = order.getOrderDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        }

        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (order.getItems() != null) {
            itemDtos = order.getItems().stream()
                    .map(OrderItemDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tokenNumber(order.getTokenNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userRegistrationId(order.getUser() != null ? order.getUser().getRegistrationId() : null)
                .userName(order.getUser() != null ? order.getUser().getFullName() : null)
                .userRole(order.getUser() != null && order.getUser().getRole() != null ? order.getUser().getRole().name() : null)
                .orderDate(order.getOrderDate())
                .formattedDate(formatted)
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .razorpayOrderId(order.getRazorpayOrderId())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .stockReserved(order.isStockReserved())
                .paymentExpiresAt(order.getPaymentExpiresAt())
                .specialInstructions(order.getSpecialInstructions())
                .adminNote(order.getAdminNote())
                .cancellationReason(order.getCancellationReason())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}

