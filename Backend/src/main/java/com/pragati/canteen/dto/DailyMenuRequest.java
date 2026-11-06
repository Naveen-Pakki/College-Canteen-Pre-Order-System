package com.pragati.canteen.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMenuRequest {

    private LocalDate menuDate;

    @NotEmpty(message = "At least one food item ID must be provided")
    private List<Long> foodItemIds;

    private String specialNote;
}

