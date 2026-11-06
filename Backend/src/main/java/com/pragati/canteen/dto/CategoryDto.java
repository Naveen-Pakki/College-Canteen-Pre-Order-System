package com.pragati.canteen.dto;

import com.pragati.canteen.entity.FoodCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private Long id;
    private String categoryName;
    private String description;
    private boolean active;
    private int displayOrder;
    private Long itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategoryDto fromEntity(FoodCategory category) {
        return fromEntity(category, 0L);
    }

    public static CategoryDto fromEntity(FoodCategory category, Long itemCount) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .active(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .itemCount(itemCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}

