package com.pragati.canteen.entity;

import com.pragati.canteen.enums.MealType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a Food Item offered by Pragati University Canteen.
 */
@Entity
@Table(name = "food_items", indexes = {
        @Index(name = "idx_food_name", columnList = "food_name"),
        @Index(name = "idx_food_category", columnList = "category_id"),
        @Index(name = "idx_food_active", columnList = "active"),
        @Index(name = "idx_food_available_today", columnList = "available_today")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Food name is mandatory")
    @Size(max = 150, message = "Food name must not exceed 150 characters")
    @Column(name = "food_name", nullable = false, length = 150)
    private String foodName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @NotNull(message = "Category reference is mandatory")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private FoodCategory category;

    @NotNull(message = "Price is mandatory")
    @DecimalMin(value = "0.00", inclusive = true, message = "Price must be non-negative")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @NotNull(message = "Available stock is mandatory")
    @Min(value = 0, message = "Stock must never be negative")
    @Column(name = "available_stock", nullable = false)
    private Integer availableStock;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(name = "available_today", nullable = false)
    private boolean availableToday = true;

    @NotNull(message = "Meal type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 30)
    private MealType mealType;

    @Builder.Default
    @Column(name = "is_veg", nullable = false)
    private boolean isVeg = true;

    @Size(max = 50, message = "Preparation time must not exceed 50 characters")
    @Column(name = "prep_time", length = 50)
    private String prepTime;

    @Builder.Default
    @Column(name = "is_popular", nullable = false)
    private boolean isPopular = false;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.price == null) {
            this.price = BigDecimal.ZERO;
        }
        if (this.availableStock == null) {
            this.availableStock = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

