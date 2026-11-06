package com.pragati.canteen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Line item of an order preserving immutable snapshots of food name,
 * category name, and unit price at the exact moment of order placement.
 */
@Entity
@Table(
    name = "order_items",
    indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_food", columnList = "food_item_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    @Column(name = "food_name_snapshot", nullable = false, length = 100)
    private String foodNameSnapshot;

    @Column(name = "category_name_snapshot", nullable = false, length = 60)
    private String categoryNameSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceSnapshot;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "item_subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal itemSubtotal;
}

