package com.pragati.canteen.controller;

import com.pragati.canteen.dto.ApiResponse;
import com.pragati.canteen.dto.DailyMenuItemDto;
import com.pragati.canteen.dto.DailyMenuRequest;
import com.pragati.canteen.dto.StatusUpdateRequest;
import com.pragati.canteen.service.DailyMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/daily-menu")
@RequiredArgsConstructor
public class AdminDailyMenuController {

    private final DailyMenuService dailyMenuService;

    @PostMapping
    public ResponseEntity<List<DailyMenuItemDto>> addToDailyMenu(@Valid @RequestBody DailyMenuRequest request) {
        List<DailyMenuItemDto> added = dailyMenuService.addToDailyMenu(request);
        return new ResponseEntity<>(added, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DailyMenuItemDto>> getDailyMenu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dailyMenuService.getDailyMenuForDate(date, false));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeFromDailyMenu(@PathVariable Long id) {
        dailyMenuService.removeFromDailyMenu(id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from daily menu successfully.", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DailyMenuItemDto> updateItemAvailability(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        boolean available = request.getAvailableToday() != null
                ? request.getAvailableToday()
                : (request.getActive() != null ? request.getActive() : true);
        return ResponseEntity.ok(dailyMenuService.updateDailyMenuItemStatus(id, available));
    }
}

