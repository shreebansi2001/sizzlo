# Sizzlo Hospitality & Privilege Platform

Sizzlo is an enterprise-grade digital dining and VIP membership ecosystem built for multi-outlet luxury hospitality groups.

---

## Architecture Overview

```
sizzlo/
├── app/          # Flutter Mobile Client (iOS & Android) with GetX Architecture
├── backend/      # Java 8 / Spring Boot 2.7.x Layered REST API Architecture
├── web/          # React + TypeScript + Vite Executive Admin Web Portal
└── demo_code/    # Legacy prototype reference (Untracked in Git)
```

---

### 1. Mobile App (`app/`)
- **Technology**: Flutter 3.44+ (Dart 3.x)
- **State Management**: **GetX** (`Rx`, `Obx`, `GetxController`, `Bindings`, `GetMaterialApp`, `GetPage`)
- **Senior Developer Design System**:
  - `core/theme/`: Curated luxury colors (Deep Royal Navy `#001D4A`, Yanki Gold `#E8B84A`), Google Fonts Playfair Display & Plus Jakarta Sans typography.
  - `widgets/`: Reusable components including:
    - `SizzloVipCard`: Interactive 3D flip card with real-time QR code generation.
    - `CouponTicket`: Perforated voucher ticket with live countdown redemption modal.
    - `StatCard`: Financial savings & loyalty points metric tiles.
    - `CustomBottomNav`: Floating pill navigation bar.
    - `SizzloButton`: Luxury gradient action buttons with loading indicators.
  - `modules/`: Feature-sliced architecture (`splash`, `auth`, `home`, `card`, `coupons`, `reservations`, `loyalty`, `delivery`, `notifications`, `profile`).
  - `data/`: Clean domain models and `ApiService` with backend connection and graceful offline fallbacks.

### 2. Backend (`backend/`)
- **Technology**: **Java 8** (`1.8.0`), Spring Boot 2.7.18
- **Design Pattern**: Multi-tier layered enterprise architecture:
  - `controller/`: REST endpoints for Auth, Member Profiles, Coupons, Table Reservations, Loyalty Points, Admin Analytics.
  - `service/` & `service/impl/`: Business logic interfaces and service implementations.
  - `repository/`: Spring Data JPA repositories with custom query methods.
  - `entity/`: Database entities with JPA annotations (`MemberProfile`, `Coupon`, `Reservation`, `LoyaltyTransaction`, `Outlet`).
  - `dto/`: Type-safe request and response objects (`ApiResponse<T>`, `ReservationRequest`, `AuthResponse`, `AdminDashboardDto`).
  - `config/`: CORS configuration, Data pre-seeding (`DataInitializer`), H2 / PostgreSQL configuration.
  - `exception/`: Centralized `GlobalExceptionHandler` with REST error responses.

### 3. Web Admin Dashboard (`web/`)
- **Technology**: React 18, TypeScript, Vite
- **Styling**: Curated Vanilla CSS design system (`admin.css`) reflecting luxury hospitality aesthetics.
- **Portals**:
  - **Executive Overview**: High-level KPIs, monthly billing series, venue comparison, and live dining floor pipeline.
  - **CEO Strategic Suite**: Profit margins, customer retention rate (88.6%), and expansion forecasts.
  - **Customer 360 CRM**: Filterable member database with spending history, coupon redemptions, and pending payment tracker.
  - **Voucher Manager**: Create, configure, publish, and track dining privilege vouchers.
  - **Host Station & Table Reservations**: Table booking status management (seat guests, confirm, cancel) with VIP notes.
  - **Venues & Dining Concepts**: Outlet performance directory, average bill value (ABV), and customer ratings.
  - **AI Predictive Engine**: Automated intelligence suggesting renewal campaigns, capacity surges, and revenue boosters.
