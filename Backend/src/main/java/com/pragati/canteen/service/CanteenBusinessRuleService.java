package com.pragati.canteen.service;

import com.pragati.canteen.enums.MealType;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Service encapsulating Pragati University Canteen ordering window schedules and business rules.
 * Uses college local timezone: Asia/Kolkata.
 */
@Service
public class CanteenBusinessRuleService {

    public static final ZoneId CANTEEN_TIMEZONE = ZoneId.of("Asia/Kolkata");

    // Morning Tiffins: 6:00 AM - 9:30 AM
    public static final LocalTime TIFFINS_START = LocalTime.of(6, 0);
    public static final LocalTime TIFFINS_END = LocalTime.of(9, 30);

    // Lunch Pre-Orders: 9:00 AM - 12:00 PM
    public static final LocalTime LUNCH_START = LocalTime.of(9, 0);
    public static final LocalTime LUNCH_END = LocalTime.of(12, 0);

    // Evening Snacks: 1:00 PM - 3:30 PM (13:00 - 15:30)
    public static final LocalTime SNACKS_START = LocalTime.of(13, 0);
    public static final LocalTime SNACKS_END = LocalTime.of(15, 30);

    // Cakes: Book before 1:00 PM (13:00), pickup after 3:00 PM (15:00)
    public static final LocalTime CAKES_DEADLINE = LocalTime.of(13, 0);

    /**
     * Returns current local time in Pragati University campus timezone.
     */
    public LocalTime getCampusCurrentTime() {
        return ZonedDateTime.now(CANTEEN_TIMEZONE).toLocalTime();
    }

    /**
     * Determines whether the ordering window is currently open for the given MealType.
     */
    public boolean isWindowOpen(MealType mealType, LocalTime time) {
        if (mealType == null || mealType == MealType.ALL_DAY) {
            return true;
        }

        return switch (mealType) {
            case BREAKFAST -> !time.isBefore(TIFFINS_START) && !time.isAfter(TIFFINS_END);
            case LUNCH -> !time.isBefore(LUNCH_START) && !time.isAfter(LUNCH_END);
            case SNACKS -> !time.isBefore(SNACKS_START) && !time.isAfter(SNACKS_END);
            case CAKE -> !time.isAfter(CAKES_DEADLINE);
            case ALL_DAY -> true;
        };
    }

    public boolean isWindowOpen(MealType mealType) {
        return isWindowOpen(mealType, getCampusCurrentTime());
    }

    /**
     * Generates a user-friendly schedule message regarding ordering availability.
     */
    public String getScheduleMessage(MealType mealType, LocalTime time) {
        if (mealType == null || mealType == MealType.ALL_DAY) {
            return "Available all day subject to stock";
        }

        boolean open = isWindowOpen(mealType, time);

        return switch (mealType) {
            case BREAKFAST -> open ? "Window OPEN: Morning Tiffins (6:00 AM – 9:30 AM)"
                    : "Window CLOSED: Morning Tiffins orders accepted only 6:00 AM – 9:30 AM";
            case LUNCH -> open ? "Window OPEN: Lunch Pre-Orders (9:00 AM – 12:00 PM)"
                    : "Window CLOSED: Lunch Pre-Orders accepted only 9:00 AM – 12:00 PM";
            case SNACKS -> open ? "Window OPEN: Evening Snacks (1:00 PM – 3:30 PM)"
                    : "Window CLOSED: Evening Snacks accepted only 1:00 PM – 3:30 PM";
            case CAKE -> open ? "Window OPEN: Cake Bookings (Must book before 1:00 PM; pickup after 3:00 PM)"
                    : "Window CLOSED: Cake bookings for today closed at 1:00 PM (pickup after 3:00 PM)";
            case ALL_DAY -> "Available all day subject to stock";
        };
    }

    public String getScheduleMessage(MealType mealType) {
        return getScheduleMessage(mealType, getCampusCurrentTime());
    }
}

