package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pragati.canteen.entity.OrderItem;
import lombok.*;

import java.math.BigDecimal;

/**
 * Data transfer object representing an individual item within an order.
 * Preserves the historical name, category, and price snapshots.
 * Provides dual JSON aliases for seamless frontend compatibility.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {

    private Long id;
    private Long foodItemId;
    private String foodName;
    private String categoryName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal itemSubtotal;

    // Frontend compatibility aliases
    @JsonProperty("name")
    public String getName() {
        return foodName;
    }

    @JsonProperty("price")
    public BigDecimal getPrice() {
        return unitPrice;
    }

    public static OrderItemDto fromEntity(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItem() != null ? item.getFoodItem().getId() : null)
                .foodName(item.getFoodNameSnapshot())
                .categoryName(item.getCategoryNameSnapshot())
                .unitPrice(item.getUnitPriceSnapshot())
                .quantity(item.getQuantity())
                .itemSubtotal(item.getItemSubtotal())
                .build();
    }
}

