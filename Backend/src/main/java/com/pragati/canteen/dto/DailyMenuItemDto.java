package com.pragati.canteen.dto;

import com.pragati.canteen.entity.DailyMenuItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMenuItemDto {

    private Long id;
    private LocalDate menuDate;
    private FoodItemDto foodItem;
    private boolean available;
    private String specialNote;
    private LocalDateTime createdAt;

    public static DailyMenuItemDto fromEntity(DailyMenuItem item, FoodItemDto foodItemDto) {
        if (item == null) return null;
        return DailyMenuItemDto.builder()
                .id(item.getId())
                .menuDate(item.getMenuDate())
                .foodItem(foodItemDto)
                .available(item.isAvailable())
                .specialNote(item.getSpecialNote())
                .createdAt(item.getCreatedAt())
                .build();
    }
}

