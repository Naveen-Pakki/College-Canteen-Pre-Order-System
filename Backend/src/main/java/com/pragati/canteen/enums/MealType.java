package com.pragati.canteen.enums;

/**
 * Meal Type classification representing canteen service sessions and ordering windows.
 */
public enum MealType {
    BREAKFAST("Morning Tiffins", "06:00", "09:30"),
    LUNCH("Lunch Pre-Orders", "09:00", "12:00"),
    SNACKS("Evening Snacks", "13:00", "15:30"),
    CAKE("Cakes / Special Orders", "06:00", "13:00"),
    ALL_DAY("All-Day Items", "00:00", "23:59");

    private final String displayName;
    private final String windowStart;
    private final String windowEnd;

    MealType(String displayName, String windowStart, String windowEnd) {
        this.displayName = displayName;
        this.windowStart = windowStart;
        this.windowEnd = windowEnd;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getWindowStart() {
        return windowStart;
    }

    public String getWindowEnd() {
        return windowEnd;
    }
}

