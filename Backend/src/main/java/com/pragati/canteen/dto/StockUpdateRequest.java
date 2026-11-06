package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {

    @Min(value = 0, message = "Stock value must never be negative")
    @JsonAlias({"stockQuantity", "availableStock"})
    private Integer stock;

    private Integer delta;
}

