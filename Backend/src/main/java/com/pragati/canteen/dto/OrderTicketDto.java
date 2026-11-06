package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.entity.Order;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dedicated DTO for rendering and verifying the digital order ticket.
 * Matches FrontEnd/src/components/order/OrderTicket.jsx and ticket verification.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTicketDto {

    private Long id;
    private String orderNumber;
    private String tokenNumber;
    private String userName;
    private String userRegistrationId;
    private String userRole;
    private String date;
    private String orderDate;
    private String status;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private List<OrderItemDto> items;
    private String pickupInstructions;
    private boolean isReadyForPickup;
    private boolean isCompleted;
    private String verificationHash;

    public static OrderTicketDto fromEntity(Order order) {
        String formattedDate = "Today";
        if (order.getOrderDate() != null) {
            formattedDate = order.getOrderDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        }

        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (order.getItems() != null) {
            itemDtos = order.getItems().stream()
                    .map(OrderItemDto::fromEntity)
                    .collect(Collectors.toList());
        }

        boolean ready = order.getOrderStatus() == OrderStatus.READY_FOR_PICKUP;
        boolean completed = order.getOrderStatus() == OrderStatus.COMPLETED;

        // Generate tamper-resistant verification hash
        String raw = order.getOrderNumber() + ":" + order.getTokenNumber() + ":" + order.getTotalAmount();
        String hash = generateSha256(raw);

        return OrderTicketDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tokenNumber(order.getTokenNumber())
                .userName(order.getUser() != null ? order.getUser().getFullName() : "Pragati University Member")
                .userRegistrationId(order.getUser() != null ? order.getUser().getRegistrationId() : "N/A")
                .userRole(order.getUser() != null && order.getUser().getRole() != null ? order.getUser().getRole().name() : "STUDENT")
                .date(formattedDate)
                .orderDate(formattedDate)
                .status(order.getOrderStatus().name())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "Direct Cashless")
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .items(itemDtos)
                .pickupInstructions("Present this digital ticket at the Pragati Canteen counter when your token is called.")
                .isReadyForPickup(ready)
                .isCompleted(completed)
                .verificationHash(hash)
                .build();
    }

    private static String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash).substring(0, 16).toUpperCase();
        } catch (Exception e) {
            return "PU-" + Integer.toHexString(input.hashCode()).toUpperCase();
        }
    }
}

