package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @JsonAlias({"status"})
    private Boolean active;

    @JsonAlias({"isAvailable"})
    private Boolean availableToday;
}

