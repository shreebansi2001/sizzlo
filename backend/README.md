# Sizzlo Backend (Java 8 / Spring Boot 2.7.x)

Production-ready REST API for the Sizzlo & Yanki Hospitality platform.

## Requirements
- **Java**: 8 (1.8.0)
- **Maven**: 3.6+

## Architecture
- **Layered Architecture**: Controller -> Service -> Repository -> Entity
- **In-Memory & Production DB**: Configured for H2 (in-memory for rapid dev) and PostgreSQL compatible.
- **REST APIs**:
  - `POST /api/auth/login` - OTP login request
  - `POST /api/auth/verify-otp` - Verify OTP & obtain token + profile
  - `GET /api/members/me` - Current member profile & savings
  - `GET /api/members/{membershipId}` - Member 360 profile
  - `GET /api/members/{membershipId}/loyalty` - Loyalty points & transactions
  - `GET /api/coupons` - List all coupons
  - `GET /api/coupons/available` - Filter available vouchers
  - `POST /api/coupons/{code}/redeem` - Redeem coupon voucher
  - `GET /api/reservations` - List all reservations
  - `POST /api/reservations` - Book a new table / banquet
  - `PATCH /api/reservations/{id}/status` - Update reservation status
  - `GET /api/admin/dashboard` - CEO analytics, revenue series, outlet performance, AI insights

## Running the Application
```bash
mvn clean spring-boot:run
```
API runs on `http://localhost:8080`.
H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:sizzlodb`, user: `sa`, password: blank).
