package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.entity.CartItem;
import com.pragati.canteen.entity.FoodItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {

    private Long id;
    private Long foodItemId;
    private String foodName;
    private String categoryName;
    private String imageUrl;
    private boolean isVeg;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal itemSubtotal;
    private Integer availableStock;
    private boolean active;
    private boolean availableToday;
    private boolean orderingWindowOpen;
    private String orderingWindowMessage;
    private boolean stockSufficient;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Frontend property aliases
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

    @JsonProperty("price")
    public BigDecimal getPrice() {
        return unitPrice;
    }

    @JsonProperty("subtotal")
    public BigDecimal getSubtotal() {
        return itemSubtotal;
    }

    public static CartItemDto fromEntity(CartItem cartItem, boolean windowOpen, String windowMessage) {
        if (cartItem == null) return null;
        FoodItem food = cartItem.getFoodItem();

        BigDecimal price = food.getPrice() != null ? food.getPrice() : BigDecimal.ZERO;
        int qty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

        int currentStock = food.getAvailableStock() != null ? food.getAvailableStock() : 0;
        boolean stockOk = currentStock >= qty;

        return CartItemDto.builder()
                .id(cartItem.getId())
                .foodItemId(food.getId())
                .foodName(food.getFoodName())
                .categoryName(food.getCategory() != null ? food.getCategory().getCategoryName() : null)
                .imageUrl(food.getImageUrl())
                .isVeg(food.isVeg())
                .unitPrice(price)
                .quantity(qty)
                .itemSubtotal(subtotal)
                .availableStock(currentStock)
                .active(food.isActive())
                .availableToday(food.isAvailableToday())
                .orderingWindowOpen(windowOpen)
                .orderingWindowMessage(windowMessage)
                .stockSufficient(stockOk)
                .createdAt(cartItem.getCreatedAt())
                .updatedAt(cartItem.getUpdatedAt())
                .build();
    }
}

