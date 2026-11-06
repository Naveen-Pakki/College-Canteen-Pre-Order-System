# Pragati University – College Canteen Pre-Order System

An enterprise-grade campus canteen food pre-ordering, cashless reservation, and digital ticketing system built for **Pragati University**.

---

## 🏛️ Project Overview

The **Pragati University Canteen Pre-Order System** streamlines high-volume campus dining across students, faculty members, and canteen administrative staff. It eliminates cafeteria rush queues through meal-slot ordering windows, live cart management, digital counter tickets, and atomic inventory tracking.

### Architecture
```
College-Canteen-Pre-Order-System/
├── FrontEnd/                # React 19 + Vite + Tailwind CSS SPA
├── Backend/                 # Java 21 + Spring Boot 4.1.2 + MySQL 8.0 REST API
└── uploads/                 # Uploaded canteen dish media assets
```

---

## 💻 Tech Stack

### Frontend (`FrontEnd/`)
- **Framework**: React 19, Vite 6
- **Styling**: Tailwind CSS, PostCSS
- **Routing**: React Router v7
- **Icons & Animation**: Lucide React, Canvas Confetti
- **State Management**: Context API (Auth, Cart, Orders, Time)
- **Theming**: System / Dark / Light theme support

### Backend (`Backend/`)
- **Language & Runtime**: Java 21 (LTS)
- **Framework**: Spring Boot 4.1.2
- **Persistence**: Spring Data JPA, Hibernate, MySQL 8.0
- **Security**: Spring Security, Stateless JWT authentication, BCrypt hashing
- **Build Tool**: Apache Maven 3.9+
- **Validation**: Jakarta Bean Validation (Hibernate Validator)
- **Monitoring**: Spring Boot Actuator

---

## 📦 Implemented Backend Modules

### Module 1: Authentication & User Management
- Role-based authorization (`STUDENT`, `FACULTY`, `ADMIN`).
- Unified authentication endpoint (`POST /api/auth/login`) with BCrypt password verification and JWT token issuance.
- Student/Faculty registration validation and profile lookup (`GET /api/auth/me`).

### Module 2: Food & Category Management
- Categorized menu management (Breakfast, Lunch, Evening Snacks, Beverages, Cakes, Ice Creams).
- Ordering window schedules enforced in `Asia/Kolkata` campus timezone via `CanteenBusinessRuleService`.
- Multi-category food filtering, veg/non-veg flags, and preparation time tracking.

### Module 3: Cart Management
- User-isolated shopping carts in MySQL (`carts` and `cart_items`).
- Real-time price calculation, stock sufficiency verification, and subtotal/tax computation.
- Complete isolation preventing cross-account cart tampering.

### Module 4: Order Lifecycle & Digital Tickets
- Order placement with atomic MySQL inventory reservation (`WHERE available_stock >= :qty`).
- Idempotency key protection (`X-Idempotency-Key`) preventing accidental double orders.
- Complete order lifecycle: `PENDING_PAYMENT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY_FOR_PICKUP` $\rightarrow$ `COMPLETED`.
- Customer cancellation rules (allowed before kitchen preparation; blocked once `PREPARING`).
- Exact-once inventory restoration upon order cancellation or 15-minute unpaid checkout expiration.
- Digital order pickup ticket generation with daily sequence tokens (`TKT-XX`) and SHA-256 verification hashes.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ & npm
- **Java**: JDK 21
- **Maven**: 3.8+
- **MySQL Server**: 8.0+

### Database Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE pragati_canteen;
   ```
2. Verify connection properties in `Backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/pragati_canteen?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

### Running the Backend
```bash
cd Backend
mvn clean spring-boot:run
```
Backend runs at `http://localhost:8080`.  
Health check: `http://localhost:8080/api/health`

### Running the Frontend
```bash
cd FrontEnd
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🧪 Testing & Verification

Run the entire backend test suite (86 unit and integration tests):
```bash
cd Backend
mvn test
```

---

## 📄 License
This project is proprietary and created for Pragati University Campus Canteen Operations.
