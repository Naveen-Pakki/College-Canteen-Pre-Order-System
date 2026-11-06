package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request payload for Admin updating an order's lifecycle stage.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus orderStatus;

    private String adminNote;

    private String cancellationReason;

    // Optional setter to support frontend sending 'status'
    @JsonProperty("status")
    public void setStatus(String statusStr) {
        if (statusStr != null) {
            this.orderStatus = OrderStatus.fromValue(statusStr);
        }
    }
}

