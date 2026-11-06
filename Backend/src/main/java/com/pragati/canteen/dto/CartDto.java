package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {

    private Long id;
    private Long userId;
    private String userRegistrationId;
    private String userFullName;

    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();

    private int totalItemCount;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal grandTotal;
    private boolean hasInvalidItems;
    private int invalidItemsCount;
    private LocalDateTime updatedAt;

    // Frontend compatibility accessors
    @JsonProperty("cartItems")
    public List<CartItemDto> getCartItems() {
        return items;
    }

    @JsonProperty("itemCount")
    public int getItemCount() {
        return totalItemCount;
    }

    @JsonProperty("totalAmount")
    public BigDecimal getTotalAmount() {
        return grandTotal;
    }

    public static CartDto create(Long id, Long userId, String regId, String fullName, List<CartItemDto> itemDtos) {
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalCount = 0;
        int invalidCount = 0;

        for (CartItemDto item : itemDtos) {
            subtotal = subtotal.add(item.getItemSubtotal());
            totalCount += item.getQuantity();
            if (!item.isActive() || !item.isAvailableToday() || !item.isStockSufficient() || !item.isOrderingWindowOpen()) {
                invalidCount++;
            }
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        // 5% Canteen GST
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        return CartDto.builder()
                .id(id)
                .userId(userId)
                .userRegistrationId(regId)
                .userFullName(fullName)
                .items(itemDtos)
                .totalItemCount(totalCount)
                .subtotal(subtotal)
                .tax(tax)
                .grandTotal(grandTotal)
                .hasInvalidItems(invalidCount > 0)
                .invalidItemsCount(invalidCount)
                .updatedAt(LocalDateTime.now())
                .build();
    }
}

