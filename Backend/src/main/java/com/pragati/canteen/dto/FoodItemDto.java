package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.enums.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemDto {

    private Long id;
    private String foodName;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private String imageUrl;
    private Integer availableStock;
    private boolean active;
    private boolean availableToday;
    private MealType mealType;
    private boolean isVeg;
    private String prepTime;
    private boolean isPopular;
    private Long version;
    private boolean orderingWindowOpen;
    private String orderingWindowMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Frontend compatibility accessors
    @JsonProperty("name")
    public String getName() {
        return foodName;
    }

    @JsonProperty("category")
    public String getCategory() {
        return categoryName;
    }

    @JsonProperty("image")
    public String getImage() {
        return imageUrl;
    }

    @JsonProperty("stockQuantity")
    public Integer getStockQuantity() {
        return availableStock;
    }

    @JsonProperty("isAvailable")
    public boolean isAvailable() {
        return active && availableToday && availableStock != null && availableStock > 0;
    }

    public static FoodItemDto fromEntity(FoodItem item) {
        return fromEntity(item, true, "Available");
    }

    public static FoodItemDto fromEntity(FoodItem item, boolean windowOpen, String windowMessage) {
        if (item == null) return null;
        return FoodItemDto.builder()
                .id(item.getId())
                .foodName(item.getFoodName())
                .description(item.getDescription())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getCategoryName() : null)
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .availableStock(item.getAvailableStock())
                .active(item.isActive())
                .availableToday(item.isAvailableToday())
                .mealType(item.getMealType())
                .isVeg(item.isVeg())
                .prepTime(item.getPrepTime())
                .isPopular(item.isPopular())
                .version(item.getVersion())
                .orderingWindowOpen(windowOpen)
                .orderingWindowMessage(windowMessage)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}

