package com.pragati.canteen.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a food item scheduled on a specific day's canteen menu.
 */
@Entity
@Table(name = "daily_menu_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_date_food_item", columnNames = {"menu_date", "food_item_id"})
}, indexes = {
        @Index(name = "idx_menu_date", columnList = "menu_date"),
        @Index(name = "idx_menu_available", columnList = "available")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Menu date is mandatory")
    @Column(name = "menu_date", nullable = false)
    private LocalDate menuDate;

    @NotNull(message = "Food item reference is mandatory")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Builder.Default
    @Column(name = "available", nullable = false)
    private boolean available = true;

    @Size(max = 255, message = "Special note must not exceed 255 characters")
    @Column(name = "special_note", length = 255)
    private String specialNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

