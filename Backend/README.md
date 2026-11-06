# Pragati University Canteen Order App - Backend

Backend REST API service built with Java 21, Spring Boot 4.1.2, Spring Security, Spring Data JPA, and MySQL 8.0.

---

## 1. Project Overview

The **Pragati University Canteen Order App Backend** powers food pre-ordering, kitchen queue management, cashless payment verification, and order lifecycle tracking for students, faculty, and canteen administrators.

This project provides a clean, modular foundation structured for upcoming authentication, catalog management, and order fulfillment modules.

---

## 2. Technology Stack

- **Language**: Java 21
- **Framework**: Spring Boot 4.1.2
- **Build Tool**: Apache Maven 3.9+
- **Database**: MySQL 8.0
- **ORM / Persistence**: Spring Data JPA & Hibernate
- **Security**: Spring Security (Stateless REST API)
- **Token Management**: JJWT 0.12.6 (API, Implementation, Jackson)
- **Validation**: Jakarta Validation API (Hibernate Validator)
- **Utility / Productivity**: Project Lombok & Spring Boot DevTools
- **Monitoring**: Spring Boot Actuator
- **Testing**: JUnit 5, AssertJ, Mockito, Spring Security Test

---

## 3. Package Structure

```
src/main/java/com/pragati/canteen/
├── PragatiCanteenApplication.java   # Application entry point
├── config/                          # Security, CORS, and web configurations
├── controller/                      # REST API controllers
├── dto/                             # Request and response data transfer objects
├── entity/                          # JPA database entity definitions
├── enums/                           # Domain enumerations (roles, order status, etc.)
├── exception/                       # Global exception handling & custom errors
├── repository/                      # Spring Data JPA repositories
├── security/                        # JWT authentication filters & provider
├── service/                         # Business logic service contracts & implementations
└── util/                            # Helper utilities, constants, and formatters
```

---

## 4. Prerequisites

1. **Java Development Kit (JDK)**: Java 21 or later
   ```bash
   java -version
   ```
2. **Apache Maven**: Version 3.9 or later
   ```bash
   mvn -version
   ```
3. **MySQL Server**: Version 8.0 or later running on port 3306

---

## 5. MySQL Database Creation

Log in to your MySQL terminal and execute the initialization script located at `database/schema.sql`:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS `pragati_canteen`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `pragati_canteen`;
```

Or run via the MySQL CLI command:

```bash
mysql -u root -p < database/schema.sql
```

---

## 6. Environment Variable Configuration

The application uses externalized environment variables with sensible local development defaults:

| Variable | Description | Default (Local Dev) |
|---|---|---|
| `DB_URL` | MySQL JDBC Connection URL | `jdbc:mysql://localhost:3306/pragati_canteen` |
| `DB_USERNAME` | MySQL Username | `root` |
| `DB_PASSWORD` | MySQL Password | *(empty / prompt)* |
| `SERVER_PORT` | HTTP Server Port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Profile (`dev` / `prod`) | `dev` |

### Setting Environment Variables in Windows PowerShell
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/pragati_canteen"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
```

---

## 7. Maven Build Commands

From the `Backend/` directory:

- **Compile project**:
  ```bash
  mvn clean compile
  ```
- **Execute unit tests**:
  ```bash
  mvn test
  ```
- **Package executable JAR**:
  ```bash
  mvn clean package -DskipTests=false
  ```

---

## 8. How to Run the Application

### Option A: Using Maven Plugin
```bash
mvn spring-boot:run
```

### Option B: Running the Packaged JAR
```bash
java -jar target/pragati-canteen-1.0.0-SNAPSHOT.jar
```

The server will start at `http://localhost:8080/`.

---

## 9. How to Test the Health Endpoint

### Using cURL
```bash
curl -X GET http://localhost:8080/api/health
```

### Using PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
```

### Expected Response
```json
{
  "status": "UP",
  "application": "Pragati University Canteen Order App"
}
```

### Actuator Health Endpoint
```bash
curl -X GET http://localhost:8080/actuator/health
```

