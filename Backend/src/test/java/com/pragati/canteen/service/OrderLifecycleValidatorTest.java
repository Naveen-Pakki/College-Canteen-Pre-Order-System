package com.pragati.canteen.service;

import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.exception.InvalidOperationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Module 4 - Order Lifecycle Validator Unit Tests")
class OrderLifecycleValidatorTest {

    private OrderLifecycleValidator validator;

    @BeforeEach
    void setUp() {
        validator = new OrderLifecycleValidator();
    }

    @Test
    @DisplayName("Allowed transitions succeed without exception")
    void testAllowedTransitions() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.EXPIRED));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_FAILED));

        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.CONFIRMED, OrderStatus.PREPARING));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));

        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED));

        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED));

        // Same status is a valid idempotent no-op
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.CONFIRMED, OrderStatus.CONFIRMED));
    }

    @Test
    @DisplayName("Skipping required stages is prohibited")
    void testSkippingStagesProhibited() {
        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.COMPLETED));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.READY_FOR_PICKUP));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.CONFIRMED, OrderStatus.COMPLETED));
    }

    @Test
    @DisplayName("Terminal states cannot transition to any other status")
    void testTerminalStatesCannotTransition() {
        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.COMPLETED, OrderStatus.PREPARING));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.COMPLETED, OrderStatus.CANCELLED));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateTransition(OrderStatus.EXPIRED, OrderStatus.CONFIRMED));
    }

    @Test
    @DisplayName("Customer cancellation allowed for PENDING_PAYMENT and CONFIRMED")
    void testCustomerCancellationAllowedStages() {
        assertDoesNotThrow(() -> validator.validateCustomerCancellation(OrderStatus.PENDING_PAYMENT));
        assertDoesNotThrow(() -> validator.validateCustomerCancellation(OrderStatus.CONFIRMED));
    }

    @Test
    @DisplayName("Customer cannot cancel once food preparation or pickup has started")
    void testCustomerCannotCancelOnceInPrepOrReady() {
        assertThrows(InvalidOperationException.class, () ->
                validator.validateCustomerCancellation(OrderStatus.PREPARING));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateCustomerCancellation(OrderStatus.READY_FOR_PICKUP));

        assertThrows(InvalidOperationException.class, () ->
                validator.validateCustomerCancellation(OrderStatus.COMPLETED));
    }

    @Test
    @DisplayName("Admin cannot cancel completed orders")
    void testAdminCannotCancelCompletedOrders() {
        assertThrows(InvalidOperationException.class, () ->
                validator.validateAdminCancellation(OrderStatus.COMPLETED));
        assertThrows(InvalidOperationException.class, () ->
                validator.validateAdminCancellation(OrderStatus.CANCELLED));
    }

    @Test
    @DisplayName("Admin can cancel orders during PREPARING")
    void testAdminCanCancelDuringPreparing() {
        assertDoesNotThrow(() -> validator.validateAdminCancellation(OrderStatus.PREPARING));
        assertDoesNotThrow(() -> validator.validateAdminCancellation(OrderStatus.CONFIRMED));
        assertDoesNotThrow(() -> validator.validateAdminCancellation(OrderStatus.PENDING_PAYMENT));
    }
}

