package com.pragati.canteen.config;

import com.pragati.canteen.entity.DailyMenuItem;
import com.pragati.canteen.entity.FoodCategory;
import com.pragati.canteen.entity.FoodItem;
import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.MealType;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.repository.DailyMenuItemRepository;
import com.pragati.canteen.repository.FoodCategoryRepository;
import com.pragati.canteen.repository.FoodItemRepository;
import com.pragati.canteen.repository.UserRepository;
import com.pragati.canteen.service.CanteenBusinessRuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Data Initializer
 * Seeds initial Student, Faculty, and Admin accounts as well as
 * initial Food Categories, Food Items, and Daily Menu records.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FoodCategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;
    private final DailyMenuItemRepository dailyMenuItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        Map<String, FoodCategory> categories = seedCategories();
        seedFoodItemsAndDailyMenu(categories);
    }

    private void seedUsers() {
        seedUserIfNotExists(
                "Sai Vardhan",
                "23A91A0501",
                "23a91a0501@pragati.edu.in",
                "student123",
                Role.STUDENT,
                "Computer Science & Engineering",
                "+91 98480 22334"
        );

        seedUserIfNotExists(
                "Dr. K. Srinivas",
                "FAC1024",
                "srinivas.k@pragati.edu.in",
                "faculty123",
                Role.FACULTY,
                "Electronics & Communication Engg",
                "+91 94401 55667"
        );

        seedUserIfNotExists(
                "Ramesh Babu",
                "ADMIN001",
                "canteen.admin@pragati.edu.in",
                "admin123",
                Role.ADMIN,
                "Canteen Operations & Food Services",
                "+91 98660 77889"
        );
    }

    private void seedUserIfNotExists(String fullName,
                                     String registrationId,
                                     String email,
                                     String rawPassword,
                                     Role role,
                                     String department,
                                     String phone) {

        if (!userRepository.existsByRegistrationIdIgnoreCase(registrationId)) {
            User user = User.builder()
                    .fullName(fullName)
                    .registrationId(registrationId)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .department(department)
                    .phone(phone)
                    .active(true)
                    .build();

            userRepository.save(user);
            log.info("Initialized default {} account: registrationId='{}'", role, registrationId);
        }
    }

    private Map<String, FoodCategory> seedCategories() {
        Map<String, FoodCategory> map = new HashMap<>();

        map.put("Breakfast", seedCategoryIfNotExists("Breakfast", "Morning South Indian tiffins & breakfast specialties", 1));
        map.put("Lunch", seedCategoryIfNotExists("Lunch", "Full meals, biryanis, fried rice, and combos", 2));
        map.put("Evening Snacks", seedCategoryIfNotExists("Evening Snacks", "Hot samosas, bajjis, puffs & quick evening bites", 3));
        map.put("Beverages", seedCategoryIfNotExists("Beverages", "Irani chai, South Indian filter coffee & chilled cool drinks", 4));
        map.put("Cakes", seedCategoryIfNotExists("Cakes", "Fresh campus celebration cakes & customized birthday bakes", 5));
        map.put("Ice Creams", seedCategoryIfNotExists("Ice Creams", "Single scoops, cones, cups, and family tubs", 6));
        map.put("Packaged Snacks", seedCategoryIfNotExists("Packaged Snacks", "Branded biscuits, potato chips, and savory munchies", 7));

        return map;
    }

    private FoodCategory seedCategoryIfNotExists(String name, String desc, int order) {
        return categoryRepository.findByCategoryNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(FoodCategory.builder()
                        .categoryName(name)
                        .description(desc)
                        .active(true)
                        .displayOrder(order)
                        .build()));
    }

    private void seedFoodItemsAndDailyMenu(Map<String, FoodCategory> cats) {
        LocalDate today = LocalDate.now(CanteenBusinessRuleService.CANTEEN_TIMEZONE);

        // 1. Breakfast
        FoodItem idli = seedFoodIfNotExists("Idli (3 pcs)",
                "Soft steamed rice cakes served with hot drumstick sambar and ginger coconut chutney.",
                cats.get("Breakfast"), new BigDecimal("40.00"), 60,
                "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                MealType.BREAKFAST, true, "5 mins", true);

        FoodItem dosa = seedFoodIfNotExists("Crispy Masala Dosa",
                "Golden crisp crepe roasted in pure ghee stuffed with tempered spiced potato masala.",
                cats.get("Breakfast"), new BigDecimal("50.00"), 45,
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
                MealType.BREAKFAST, true, "8 mins", true);

        FoodItem poori = seedFoodIfNotExists("Poori with Potato Masala (2 pcs)",
                "Fluffy golden pooris served with mild spiced onion-potato curry.",
                cats.get("Breakfast"), new BigDecimal("45.00"), 40,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
                MealType.BREAKFAST, true, "8 mins", false);

        // 2. Lunch
        FoodItem vegMeals = seedFoodIfNotExists("Andhra Veg Meals (Full Thali)",
                "Steamed Sona Masoori rice, Dal Tadka, Seasonal Veg Curry, Sambar, Rasam, Curd, and Papad.",
                cats.get("Lunch"), new BigDecimal("90.00"), 50,
                "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
                MealType.LUNCH, true, "10 mins", true);

        FoodItem chickenBiryani = seedFoodIfNotExists("Chicken Dum Biryani",
                "Spicy chicken biryani slow-cooked with basmati rice, aromatic spices, and served with mirchi ka salan and raita.",
                cats.get("Lunch"), new BigDecimal("120.00"), 50,
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                MealType.LUNCH, false, "8 mins", true);

        FoodItem vegFriedRice = seedFoodIfNotExists("Veg Fried Rice",
                "Wok-tossed basmati rice with crunchy carrots, beans, cabbage, and spring onions.",
                cats.get("Lunch"), new BigDecimal("80.00"), 40,
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
                MealType.LUNCH, true, "10 mins", false);

        // 3. Evening Snacks
        FoodItem samosa = seedFoodIfNotExists("Hot Samosa (2 pcs)",
                "Crispy triangular pastry stuffed with spicy potato and green peas, served with mint chutney.",
                cats.get("Evening Snacks"), new BigDecimal("30.00"), 80,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
                MealType.SNACKS, true, "2 mins", true);

        FoodItem bajji = seedFoodIfNotExists("Mirchi Bajji (3 pcs)",
                "Crispy gram flour batter-fried green chilies stuffed with tangy onion-lemon-cumin masala.",
                cats.get("Evening Snacks"), new BigDecimal("30.00"), 65,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
                MealType.SNACKS, true, "5 mins", true);

        // 4. Beverages
        FoodItem chai = seedFoodIfNotExists("Special Irani Chai",
                "Brewed strong milk tea with aromatic cardamoms and ginger, a campus favorite.",
                cats.get("Beverages"), new BigDecimal("15.00"), 100,
                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "2 mins", true);

        FoodItem coolDrink = seedFoodIfNotExists("Cool Drinks (Thums Up / Sprite 250ml)",
                "Chilled Thums Up, Sprite, Maaza, or Coca-Cola 250ml bottles.",
                cats.get("Beverages"), new BigDecimal("25.00"), 60,
                "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "Immediate", true);

        // 5. Cakes
        FoodItem birthdayCake = seedFoodIfNotExists("Birthday Celebration Cake (500g)",
                "Freshly baked Dutch chocolate cream cake for campus birthdays. Book before 1:00 PM for pickup after 3:00 PM.",
                cats.get("Cakes"), new BigDecimal("450.00"), 10,
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
                MealType.CAKE, true, "Bake Order", true);

        // 6. Ice Creams
        FoodItem vanillaIce = seedFoodIfNotExists("Vanilla Ice Cream Cup",
                "Classic creamy Madagascar vanilla ice cream cup.",
                cats.get("Ice Creams"), new BigDecimal("35.00"), 40,
                "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "Immediate", false);

        FoodItem chocScoop = seedFoodIfNotExists("Belgian Chocolate Scoop",
                "Rich dark chocolate ice cream topped with chocolate shavings.",
                cats.get("Ice Creams"), new BigDecimal("50.00"), 35,
                "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "Immediate", true);

        // 7. Packaged Snacks
        FoodItem biscuits = seedFoodIfNotExists("Good Day Butter Cookies (Pack)",
                "Rich butter cookies with a delightful smile on every bite.",
                cats.get("Packaged Snacks"), new BigDecimal("20.00"), 50,
                "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "Immediate", true);

        FoodItem lays = seedFoodIfNotExists("Lays Classic Salted Chips",
                "Thin cut crispy potato chips seasoned with fine salt.",
                cats.get("Packaged Snacks"), new BigDecimal("20.00"), 50,
                "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
                MealType.ALL_DAY, true, "Immediate", true);

        // Seed initial items on Today's Daily Menu
        seedDailyMenuItemIfNotExists(today, idli, "Fresh morning batch");
        seedDailyMenuItemIfNotExists(today, dosa, "Ghee roast special");
        seedDailyMenuItemIfNotExists(today, vegMeals, "Available for 12:00 PM pickup");
        seedDailyMenuItemIfNotExists(today, chickenBiryani, "Chef special slow-dum");
        seedDailyMenuItemIfNotExists(today, samosa, "Crispy 1:00 PM batch");
        seedDailyMenuItemIfNotExists(today, chai, "Fresh brewed hot tea");
        seedDailyMenuItemIfNotExists(today, coolDrink, "Chilled stock available");
        seedDailyMenuItemIfNotExists(today, birthdayCake, "Book before 1:00 PM");
        seedDailyMenuItemIfNotExists(today, chocScoop, "Deep-freezer fresh");
        seedDailyMenuItemIfNotExists(today, lays, "Crispy fresh packet");
    }

    private FoodItem seedFoodIfNotExists(String name, String desc, FoodCategory category,
                                         BigDecimal price, int stock, String imageUrl,
                                         MealType mealType, boolean isVeg, String prepTime, boolean isPopular) {
        if (category == null) return null;

        return foodItemRepository.searchActiveFoodItems(category.getId(), null, name).stream()
                .filter(i -> i.getFoodName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> foodItemRepository.save(FoodItem.builder()
                        .foodName(name)
                        .description(desc)
                        .category(category)
                        .price(price)
                        .availableStock(stock)
                        .imageUrl(imageUrl)
                        .mealType(mealType)
                        .isVeg(isVeg)
                        .prepTime(prepTime)
                        .isPopular(isPopular)
                        .active(true)
                        .availableToday(true)
                        .build()));
    }

    private void seedDailyMenuItemIfNotExists(LocalDate date, FoodItem item, String note) {
        if (item == null || item.getId() == null) return;
        if (!dailyMenuItemRepository.existsByMenuDateAndFoodItemId(date, item.getId())) {
            dailyMenuItemRepository.save(DailyMenuItem.builder()
                    .menuDate(date)
                    .foodItem(item)
                    .available(true)
                    .specialNote(note)
                    .build());
        }
    }
}
