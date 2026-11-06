# 🎓 Smart Campus Canteen Management System

> **Skip the Queue. Order Before the Break.**  
> A modern, responsive, enterprise-grade digital pre-ordering frontend designed for university campuses. Enables Students, Faculty & Staff, and Canteen Administrators to order, manage, schedule, and track food online with express pickup slots and 100% cashless payments.

---

## 🎨 Design System & Theme

| Token | Color Code | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#2563EB` (Vibrant Blue) | Brand identity, primary CTAs, active highlights |
| **Secondary** | `#0F172A` (Dark Navy) | High-contrast headers, dark panels, navigation backgrounds |
| **Accent** | `#14B8A6` (Teal) | Pickup slots, real-time status badges, success indicators |
| **Success** | `#22C55E` (Emerald Green) | Order ready confirmations, veg indicators, completed states |
| **Warning** | `#F59E0B` (Amber Orange) | Preparation stage badges, rush hour alerts |
| **Background** | `#F8FAFC` (Slate Muted) | Soft, modern backdrop |
| **Cards** | `White (#FFFFFF)` | Glassmorphism, 1px border `border-slate-100`, soft drop shadows |

---

## 🚀 Key Feature Matrix

### 1. 👥 Multi-Role Campus Architecture
- **Student Persona**: Fast snack & lunch ordering, customized cooking notes, scheduled break slots (10:30 AM, 12:30 PM), student wallet, order history with downloadable digital receipts.
- **Faculty / Staff Persona**: Dedicated **Counter 1 Faculty Express Pass**, priority chef queueing, monthly institutional dining allowance, 1-click frequent re-orders.
- **Canteen Administrator Persona**: Comprehensive executive dashboard with live Kanban order board, real-time dish availability & price updates, menu catalog creation, revenue & daily/weekly/monthly audit reports.
- **Interactive Role Switcher**: A sticky top banner allows instantaneous 1-click toggling between **Student**, **Staff**, and **Admin** personas on any device.

---

## 📂 Page Hierarchy & Route Map

| Page | Route | Description |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Hero section, statistical counters, 6-feature grid, 5-step workflow, campus testimonials, footer |
| **Public Menu** | `/menu` | Food ordering catalog with search, category tabs (Snacks, Breakfast, Lunch, Beverages, Fast Food), Pure Veg filter, sorting, and sticky tray drawer |
| **Tray / Cart** | `/cart` | Item list, quantity increment/decrement, cooking instructions notes, discount coupons (`CAMPUSPRO`, `FACULTYVIP`), GST 5% calculation, sticky summary |
| **Checkout** | `/checkout` | Diner ID verification, Express counter selector, pickup slot choice (`10:30 AM`, `11:00 AM`, `12:30 PM`, `01:00 PM`), Cashless payment methods (UPI, Cards, Net Banking, Wallet), instant token generation |
| **Order Tracking** | `/orders/track` | Live animated preparation timeline (`Order Placed` ➔ `Payment Successful` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`), token display, slot time, and simulated progress tester |
| **Order History** | `/orders/history` | Filter by date and status, search by keyword, view items, and trigger printable/downloadable digital tax invoices |
| **Student Dashboard** | `/student/dashboard` | 4 KPI widgets (Today's Orders, Pending, Total Spent, Favorite Food), live active order banner, recent orders ledger, notifications panel |
| **Staff Dashboard** | `/staff/dashboard` | Priority pickup desk badge, monthly spending KPI, average order value, 1-click frequent meal re-orders |
| **Admin Dashboard** | `/admin/dashboard` | Total orders, revenue today, active users, interactive revenue trend chart (Daily/Weekly/Monthly), peak rush hour analysis |
| **Menu Management** | `/admin/menu` | Add dish modal, edit dish modal, delete confirmation, live availability toggle switch, inline prices |
| **Order Management** | `/admin/orders` | Live kitchen Kanban board (Pending, Preparing, Ready, Completed) + Data table view with status updater |
| **Reports & Analytics**| `/admin/reports` | Daily, weekly, and monthly sales reports, cashless transaction settlement breakdown, food waste reduction analytics (34.2% saved), CSV exporter |
| **Users Directory** | `/admin/users` | Student, Faculty, and Admin directory with verified ID badges, department filters, and wallet balances |
| **Operational Settings**| `/admin/settings`| Slot capacity parameters, cut-off windows, tax percentages, and packaging fees |
| **Profile Settings** | `/profile` | Name, institutional ID, contact info, department, avatar picker, and password security management |
| **Authentication** | `/login`, `/register`| Split-screen responsive layout, role tabs, 1-click demo login, password visibility toggles, campus SSO placeholders |

---

## 🛠️ Technology Stack

- **React.js 19**
- **Vite 6** (Blazing fast build & hot reloading)
- **Tailwind CSS 3.4** (Custom design tokens, soft shadows, glassmorphism)
- **Lucide React** (Consistent modern iconography)
- **Framer Motion** (Smooth transitions & modal dialog animations)
- **Canvas Confetti** (Order checkout celebration)
- **React Router DOM 7** (Declarative routing)

---

## ⚡ Quick Start & Development

### 1. Prerequisites
Ensure Node.js (v18+) and npm are installed.

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Generates production-optimized static assets in the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔑 Demo Personas (1-Click Login)

| Role | Name | College / Staff ID | Demo Email |
| :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `STU-2024-8842` | `aarav.sharma@campus.edu` |
| **Faculty / Staff** | Dr. Priya Raman | `FAC-1092` | `priya.raman@campus.edu` |
| **Admin** | Vikram Malhotra | `ADM-CANTEEN-001` | `admin.canteen@campus.edu` |

*Note: You can switch between all 3 personas instantly using the top interactive role switcher bar on any page.*

