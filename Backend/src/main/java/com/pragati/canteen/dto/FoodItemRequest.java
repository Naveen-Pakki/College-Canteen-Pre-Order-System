package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.pragati.canteen.enums.MealType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemRequest {

    @NotBlank(message = "Food name is mandatory")
    @Size(max = 150, message = "Food name must not exceed 150 characters")
    @JsonAlias({"name"})
    private String foodName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Category ID is mandatory")
    private Long categoryId;

    @NotNull(message = "Price is mandatory")
    @DecimalMin(value = "0.00", inclusive = true, message = "Price must be non-negative")
    private BigDecimal price;

    @NotNull(message = "Available stock is mandatory")
    @Min(value = 0, message = "Stock must never be negative")
    @JsonAlias({"stockQuantity", "stock"})
    private Integer availableStock;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @JsonAlias({"image"})
    private String imageUrl;

    @Builder.Default
    private MealType mealType = MealType.LUNCH;

    @Builder.Default
    private Boolean isVeg = true;

    @Size(max = 50, message = "Prep time must not exceed 50 characters")
    private String prepTime;

    @Builder.Default
    private Boolean isPopular = false;

    @Builder.Default
    @JsonAlias({"isAvailable"})
    private Boolean availableToday = true;

    @Builder.Default
    private Boolean active = true;
}

