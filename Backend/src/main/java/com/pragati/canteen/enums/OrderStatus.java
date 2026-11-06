package com.pragati.canteen.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Lifecycle states of an order in the Pragati University Canteen System.
 */
public enum OrderStatus {
    PENDING_PAYMENT("Pending Payment"),
    CONFIRMED("Confirmed"),
    PREPARING("Preparing"),
    READY_FOR_PICKUP("Ready for Pickup"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    PAYMENT_FAILED("Payment Failed"),
    EXPIRED("Expired");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static OrderStatus fromValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().replace(" ", "_").toUpperCase();
        for (OrderStatus status : values()) {
            if (status.name().equalsIgnoreCase(normalized) ||
                status.displayName.equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown order status: " + value);
    }
}

