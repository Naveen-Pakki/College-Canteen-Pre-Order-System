package com.pragati.canteen.service;

import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.exception.InvalidOperationException;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Validates order lifecycle transitions and cancellation rules to maintain
 * strict workflow consistency and inventory protection across customer and admin actions.
 */
@Component
public class OrderLifecycleValidator {

    // Valid transitions map: Current Status -> Set of permitted next statuses
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING_PAYMENT, EnumSet.of(
                    OrderStatus.CONFIRMED,
                    OrderStatus.PAYMENT_FAILED,
                    OrderStatus.EXPIRED,
                    OrderStatus.CANCELLED
            ),
            OrderStatus.CONFIRMED, EnumSet.of(
                    OrderStatus.PREPARING,
                    OrderStatus.CANCELLED
            ),
            OrderStatus.PREPARING, EnumSet.of(
                    OrderStatus.READY_FOR_PICKUP,
                    OrderStatus.CANCELLED
            ),
            OrderStatus.READY_FOR_PICKUP, EnumSet.of(
                    OrderStatus.COMPLETED
            ),
            OrderStatus.COMPLETED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.PAYMENT_FAILED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.EXPIRED, EnumSet.noneOf(OrderStatus.class)
    );

    /**
     * Verifies if a lifecycle transition from currentStatus to targetStatus is permitted.
     */
    public void validateTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == null || targetStatus == null) {
            throw new InvalidOperationException("Current status and target status must not be null.");
        }

        if (currentStatus == targetStatus) {
            return; // Idempotent no-op
        }

        if (isTerminalState(currentStatus)) {
            throw new InvalidOperationException(
                    "Order is in terminal state '" + currentStatus + "' and cannot be transitioned to '" + targetStatus + "'."
            );
        }

        Set<OrderStatus> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedNext.contains(targetStatus)) {
            throw new InvalidOperationException(
                    "Invalid order transition: Cannot transition from '" + currentStatus + "' to '" + targetStatus + "'."
            );
        }
    }

    /**
     * Verifies if the order can be cancelled by a customer (Student or Faculty).
     * Customers can only cancel while order is PENDING_PAYMENT or CONFIRMED.
     */
    public void validateCustomerCancellation(OrderStatus currentStatus) {
        if (currentStatus == OrderStatus.COMPLETED) {
            throw new InvalidOperationException("Completed orders cannot be cancelled.");
        }
        if (currentStatus == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Order is already cancelled.");
        }
        if (currentStatus == OrderStatus.EXPIRED || currentStatus == OrderStatus.PAYMENT_FAILED) {
            throw new InvalidOperationException("Order is in a terminal failed state: " + currentStatus);
        }
        if (currentStatus == OrderStatus.PREPARING) {
            throw new InvalidOperationException("Cannot cancel order: Canteen kitchen is already preparing your food.");
        }
        if (currentStatus == OrderStatus.READY_FOR_PICKUP) {
            throw new InvalidOperationException("Cannot cancel order: Food is ready for pickup at the counter.");
        }
        if (currentStatus != OrderStatus.PENDING_PAYMENT && currentStatus != OrderStatus.CONFIRMED) {
            throw new InvalidOperationException("Order cannot be cancelled in state: " + currentStatus);
        }
    }

    /**
     * Verifies if an Admin can cancel an order.
     */
    public void validateAdminCancellation(OrderStatus currentStatus) {
        if (currentStatus == OrderStatus.COMPLETED) {
            throw new InvalidOperationException("Completed orders cannot be cancelled.");
        }
        if (currentStatus == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Order is already cancelled.");
        }
        if (isTerminalState(currentStatus)) {
            throw new InvalidOperationException("Cannot cancel order in terminal state: " + currentStatus);
        }
    }

    public boolean isTerminalState(OrderStatus status) {
        return status == OrderStatus.COMPLETED ||
               status == OrderStatus.CANCELLED ||
               status == OrderStatus.PAYMENT_FAILED ||
               status == OrderStatus.EXPIRED;
    }
}

