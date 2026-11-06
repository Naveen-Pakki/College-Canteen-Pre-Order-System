package com.pragati.canteen.service;

import com.pragati.canteen.dto.DailyMenuItemDto;
import com.pragati.canteen.dto.DailyMenuRequest;
import com.pragati.canteen.dto.FoodItemDto;
import com.pragati.canteen.entity.DailyMenuItem;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.exception.DuplicateResourceException;
import com.pragati.canteen.exception.ResourceNotFoundException;
import com.pragati.canteen.repository.DailyMenuItemRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyMenuService {

    private final DailyMenuItemRepository dailyMenuItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final FoodItemService foodItemService;

    @Transactional
    public List<DailyMenuItemDto> addToDailyMenu(DailyMenuRequest request) {
        LocalDate targetDate = request.getMenuDate() != null
                ? request.getMenuDate()
                : LocalDate.now(CanteenBusinessRuleService.CANTEEN_TIMEZONE);

        List<DailyMenuItemDto> result = new ArrayList<>();

        for (Long foodId : request.getFoodItemIds()) {
            FoodItem foodItem = foodItemRepository.findById(foodId)
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));

            if (dailyMenuItemRepository.existsByMenuDateAndFoodItemId(targetDate, foodId)) {
                if (request.getFoodItemIds().size() == 1) {
                    throw new DuplicateResourceException("Food item '" + foodItem.getFoodName() + "' is already on the menu for date: " + targetDate);
                }
                log.info("Food item '{}' already present in daily menu for {}, skipping duplicate", foodItem.getFoodName(), targetDate);
                continue;
            }

            DailyMenuItem menuItem = DailyMenuItem.builder()
                    .menuDate(targetDate)
                    .foodItem(foodItem)
                    .available(true)
                    .specialNote(request.getSpecialNote())
                    .build();

            DailyMenuItem saved = dailyMenuItemRepository.save(menuItem);
            FoodItemDto itemDto = foodItemService.mapToDto(saved.getFoodItem());
            result.add(DailyMenuItemDto.fromEntity(saved, itemDto));
            log.info("Added food item '{}' to daily menu for date: {}", foodItem.getFoodName(), targetDate);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<DailyMenuItemDto> getDailyMenuForDate(LocalDate date, boolean activeOnly) {
        LocalDate targetDate = date != null
                ? date
                : LocalDate.now(CanteenBusinessRuleService.CANTEEN_TIMEZONE);

        List<DailyMenuItem> items = activeOnly
                ? dailyMenuItemRepository.findByMenuDateAndAvailableTrueOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc(targetDate)
                : dailyMenuItemRepository.findByMenuDateOrderByFoodItemCategoryDisplayOrderAscFoodItemFoodNameAsc(targetDate);

        return items.stream()
                .map(item -> DailyMenuItemDto.fromEntity(item, foodItemService.mapToDto(item.getFoodItem())))
                .toList();
    }

    @Transactional
    public void removeFromDailyMenu(Long id) {
        DailyMenuItem item = dailyMenuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Daily menu item not found with ID: " + id));

        dailyMenuItemRepository.delete(item);
        log.info("Removed item id={} from daily menu for date: {}", id, item.getMenuDate());
    }

    @Transactional
    public DailyMenuItemDto updateDailyMenuItemStatus(Long id, boolean available) {
        DailyMenuItem item = dailyMenuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Daily menu item not found with ID: " + id));

        item.setAvailable(available);
        DailyMenuItem saved = dailyMenuItemRepository.save(item);
        log.info("Updated daily menu item id={} availability to {}", id, available);
        return DailyMenuItemDto.fromEntity(saved, foodItemService.mapToDto(saved.getFoodItem()));
    }
}

