package com.pragati.canteen.service;

import com.pragati.canteen.enums.MealType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class CanteenBusinessRuleServiceTest {

    private CanteenBusinessRuleService businessRuleService;

    @BeforeEach
    void setUp() {
        businessRuleService = new CanteenBusinessRuleService();
    }

    @Test
    @DisplayName("Morning Tiffins window: Open between 6:00 AM and 9:30 AM")
    void testMorningTiffinsWindow() {
        assertThat(businessRuleService.isWindowOpen(MealType.BREAKFAST, LocalTime.of(5, 59))).isFalse();
        assertThat(businessRuleService.isWindowOpen(MealType.BREAKFAST, LocalTime.of(6, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.BREAKFAST, LocalTime.of(8, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.BREAKFAST, LocalTime.of(9, 30))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.BREAKFAST, LocalTime.of(9, 31))).isFalse();
    }

    @Test
    @DisplayName("Lunch Pre-Orders window: Open between 9:00 AM and 12:00 PM")
    void testLunchPreOrdersWindow() {
        assertThat(businessRuleService.isWindowOpen(MealType.LUNCH, LocalTime.of(8, 59))).isFalse();
        assertThat(businessRuleService.isWindowOpen(MealType.LUNCH, LocalTime.of(9, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.LUNCH, LocalTime.of(11, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.LUNCH, LocalTime.of(12, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.LUNCH, LocalTime.of(12, 1))).isFalse();
    }

    @Test
    @DisplayName("Evening Snacks window: Open between 1:00 PM and 3:30 PM (13:00 - 15:30)")
    void testEveningSnacksWindow() {
        assertThat(businessRuleService.isWindowOpen(MealType.SNACKS, LocalTime.of(12, 59))).isFalse();
        assertThat(businessRuleService.isWindowOpen(MealType.SNACKS, LocalTime.of(13, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.SNACKS, LocalTime.of(14, 30))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.SNACKS, LocalTime.of(15, 30))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.SNACKS, LocalTime.of(15, 31))).isFalse();
    }

    @Test
    @DisplayName("Cakes window: Must book before 1:00 PM (13:00)")
    void testCakesBookingWindow() {
        assertThat(businessRuleService.isWindowOpen(MealType.CAKE, LocalTime.of(8, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.CAKE, LocalTime.of(12, 59))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.CAKE, LocalTime.of(13, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.CAKE, LocalTime.of(13, 1))).isFalse();
        assertThat(businessRuleService.isWindowOpen(MealType.CAKE, LocalTime.of(16, 0))).isFalse();
    }

    @Test
    @DisplayName("All-Day items are always open throughout the day")
    void testAllDayItemsWindow() {
        assertThat(businessRuleService.isWindowOpen(MealType.ALL_DAY, LocalTime.of(2, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.ALL_DAY, LocalTime.of(14, 0))).isTrue();
        assertThat(businessRuleService.isWindowOpen(MealType.ALL_DAY, LocalTime.of(23, 59))).isTrue();
    }

    @Test
    @DisplayName("Verify user-friendly schedule messages")
    void testScheduleMessages() {
        String tiffinMsg = businessRuleService.getScheduleMessage(MealType.BREAKFAST, LocalTime.of(7, 30));
        assertThat(tiffinMsg).contains("Window OPEN: Morning Tiffins");

        String tiffinClosed = businessRuleService.getScheduleMessage(MealType.BREAKFAST, LocalTime.of(11, 0));
        assertThat(tiffinClosed).contains("Window CLOSED: Morning Tiffins");

        String cakeMsg = businessRuleService.getScheduleMessage(MealType.CAKE, LocalTime.of(10, 0));
        assertThat(cakeMsg).contains("pickup after 3:00 PM");
    }
}

