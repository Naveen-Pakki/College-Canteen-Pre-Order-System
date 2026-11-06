package com.pragati.canteen.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Payload submitted by a student or faculty member when converting
 * their active cart into a confirmed order.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPlacementRequest {

    /**
     * Optional client-provided unique key to prevent duplicate orders
     * upon network retries or multiple submit button clicks.
     */
    @Size(max = 64, message = "Idempotency key must not exceed 64 characters")
    private String idempotencyKey;

    /**
     * Preferred payment method (e.g., 'RAZORPAY_ONLINE', 'DIRECT_COUNTER_CASHLESS').
     */
    @Size(max = 64, message = "Payment method must not exceed 64 characters")
    private String paymentMethod;

    /**
     * Optional special instructions (e.g. 'Extra spicy', 'Less sugar').
     */
    @Size(max = 500, message = "Special instructions must not exceed 500 characters")
    private String specialInstructions;
}

