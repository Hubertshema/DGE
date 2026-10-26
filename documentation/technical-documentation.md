# DG E-Commerce Mobile Application — Technical System Documentation

**System Architecture, Implementation Specifications, API Reference & Database Guide**

**Document Identifier:** DG-TECH-DOC-2026-V1  
**Target Store:** DG Retail Store, Commercial District, Rwamagana, Eastern Province, Rwanda  
**System Administrator & Store Owner:** Shema Hubert (`shemahubert2021@gmail.com` / `+250 790 338 043`)  
**Production Deployment Date:** October 2026  

---

## 1. System Introduction & Problem Context

### 1.1 Purpose and Objectives
The DG E-Commerce Mobile Application is an enterprise-grade retail platform engineered to digitize the retail operations of **DG Retail Store**, a thriving brick-and-mortar general merchandising and consumer goods business situated in Rwamagana, Rwanda. The primary objective is to empower customers across the Eastern Province and Greater Kigali with seamless digital catalogue browsing, shopping cart assembly, instant Rwandan Franc (RWF) price quotations, and localized order placement backed by manual MTN Mobile Money and Airtel Money settlement coordination.

### 1.2 The Problem Being Addressed
Prior to the implementation of this mobile platform, DG Retail Store relied exclusively on in-person counter sales, informal phone inquiries, and unrecorded WhatsApp message threads. This traditional operational model presented several critical bottlenecks:
- **Catalog Invisibility:** Shoppers outside Rwamagana town center could not view real-time inventory or price changes.
- **Inventory Inaccuracy & Overselling:** Stock records were manually tallied in paper ledgers, causing frequent stockouts and overselling.
- **Financial Reconciliation Delays:** Mobile money transactions required manual screenshot matching, creating audit vulnerabilities.
- **Customer Retention Barriers:** Absence of order history and notification pipelines inhibited repeated customer engagement.

### 1.3 Scope and Limitations
- **Scope:** Android mobile storefront, administrative inventory management, real-time catalog search, order lifecycle state machine, automated notification triggers, and audit logging.
- **Limitations:** Payment verification operates on an administrative manual verification model (MoMo reference matching) rather than automated MTN Open API webhooks, adhering to local retail merchant preferences.

---

## 2. System Architecture & Component Interaction

The platform follows a modern, decoupled **3-Tier Mobile Architecture** consisting of:
1. **Mobile Presentation Layer:** React Native CLI with TypeScript, utilizing the React Native New Architecture (Fabric Rendering Engine, TurboModules) and precompiled Hermes Ahead-of-Time (AOT) bytecode.
2. **Application Server Layer:** Node.js v20+ with Express.js v4.19 running TypeScript, structured into Controllers, Services, Repositories, and Middleware.
3. **Cloud Data Persistence Layer:** Neon Serverless PostgreSQL v18 with pg-pool connection pooling, SSL transport security, and transactional ACID guarantees.

### 2.1 Architecture Diagram

![DG E-Commerce Architecture Diagram](architecture-diagram.png)

### 2.2 End-to-End Order Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Android App)
    participant API as Express.js Backend API
    participant DB as Neon PostgreSQL DB
    actor Admin as Shema Hubert (Shop Owner)

    Customer->>API: POST /api/orders (Item IDs, Quantities, Delivery Info)
    activate API
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT price, stock_quantity FROM products WHERE id IN (...) FOR UPDATE
    Note over API,DB: Authoritative Price Calculated; Stock Checked
    API->>DB: UPDATE products SET stock_quantity = stock_quantity - qty
    API->>DB: INSERT INTO orders (order_status='pending', payment_status='awaiting_payment')
    API->>DB: INSERT INTO order_items (...)
    API->>DB: INSERT INTO notifications (customer & admin)
    API->>DB: COMMIT TRANSACTION
    API-->>Customer: HTTP 201 Created (Order Ref: DG-20261026-XXXX)
    deactivate API

    Customer->>Admin: Send Payment via MTN MoMo / Airtel Money (*182#)
    Admin->>API: PUT /api/orders/:id/payment (status='paid', audit_notes='MoMo TX #98234 Verified')
    activate API
    API->>DB: UPDATE orders SET payment_status='paid'
    API->>DB: INSERT INTO payment_audits (admin_id, verified_by_name='Shema Hubert')
    API-->>Admin: HTTP 200 OK (Payment Verified)
    deactivate API

    Admin->>API: PUT /api/orders/:id/status (status='shipped')
    Admin->>API: PUT /api/orders/:id/status (status='delivered')
    Note over Admin,Customer: Order Delivered to Customer in Rwamagana
```

---

## 3. Technology Stack & Verified Versions

| Subsystem | Technology | Version | Purpose / Architecture Role |
|---|---|---|---|
| **Frontend Mobile Client** | React Native | 0.74.5 | Cross-platform native mobile runtime |
| | TypeScript | 5.0.4 | Static type safety across all mobile screens |
| | React | 18.2.0 | Declarative UI component tree |
| | Hermes Engine | Bundled 0.74 | High-performance Ahead-of-Time JS Bytecode VM |
| | React Navigation | 6.x | Native Stack and Bottom Tab Navigation |
| | Async Storage | 1.23.1 | Encrypted offline token and preference storage |
| | Lucide React Native | 0.378.0 | Clean vector icons |
| **Backend API Server** | Node.js | v20+ LTS | Asynchronous non-blocking runtime environment |
| | Express.js | 4.19.2 | High-throughput HTTP routing and middleware |
| | TypeScript | 5.3.3 | Typed backend logic, interfaces and models |
| | pg / pg-pool | 8.11.5 | Native PostgreSQL driver with connection pooling |
| | jsonwebtoken | 9.0.2 | Cryptographic HMAC-SHA256 bearer tokens |
| | bcryptjs | 2.4.3 | Salted password hashing (10 salt rounds) |
| | cors / helmet | 2.8.5 / 7.1.0 | Cross-Origin resource sharing & HTTP security headers |
| **Database & Cloud** | Neon PostgreSQL | PostgreSQL 18 | Cloud serverless database with autoscaling & branching |
| | Render Cloud | Native Web Service | Cloud container hosting for Express API |
| | GitHub Actions | Workflows v4 | CI/CD testing and automated 14-min keep-alive ping |

---

## 4. Database Schema Documentation

The relational database schema is deployed on **Neon Serverless PostgreSQL** and enforces strict ACID transactional guarantees, foreign key cascade behaviors, and row-level locking.

### 4.1 Entity Relationship (ER) Diagram

![DG E-Commerce Database ER Diagram](database-er-diagram.png)

### 4.2 Tables, Fields, Keys & Constraints

#### Table: `users`
*User accounts (customers and administrators)*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique auto-incrementing user ID |
| `full_name` | `VARCHAR(255)` | NOT NULL | Full legal name of customer or owner |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Unique email address for authentication |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt hashed password with 10 salt rounds |
| `phone` | `VARCHAR(50)` | NULLABLE | Rwandan telephone number (+2507...) |
| `role` | `VARCHAR(20)` | DEFAULT 'customer' | Security role: 'customer' or 'admin' |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Profile last modified timestamp |

#### Table: `categories`
*Product department classifications*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique category identifier |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | Department name (Electronics, Grocery, etc.) |
| `description` | `TEXT` | NULLABLE | Department details and customer guidance |
| `image_url` | `VARCHAR(500)` | NULLABLE | Header display photography URL |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Timestamp record created |

#### Table: `products`
*Store merchandise inventory and pricing*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique product identifier |
| `category_id` | `INTEGER` | FK -> categories(id) ON DELETE RESTRICT | Parent department category |
| `title` | `VARCHAR(255)` | NOT NULL | Product trade title |
| `description` | `TEXT` | NULLABLE | Product technical specifications and notes |
| `price` | `NUMERIC(12,2)` | NOT NULL, CHECK (price >= 0) | Authoritative price in Rwandan Francs (RWF) |
| `stock_quantity` | `INTEGER` | NOT NULL, CHECK (stock_quantity >= 0) | Available units in Rwamagana retail store |
| `image_url` | `VARCHAR(500)` | NULLABLE | High-resolution product image |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Storefront visibility switch |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Creation timestamp |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Last inventory update timestamp |

#### Table: `orders`
*Customer sales orders and delivery records*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique order internal identifier |
| `user_id` | `INTEGER` | FK -> users(id) ON DELETE CASCADE | Customer account owning the order |
| `order_reference` | `VARCHAR(50)` | NOT NULL, UNIQUE | Customer tracking code (e.g., DG-20261026-0042) |
| `total_amount` | `NUMERIC(12,2)` | NOT NULL | Authoritative calculated total in RWF |
| `order_status` | `VARCHAR(30)` | DEFAULT 'pending' | State: pending -> confirmed -> processing -> shipped -> delivered / cancelled |
| `payment_status` | `VARCHAR(30)` | DEFAULT 'awaiting_payment' | Payment state: awaiting_payment -> paid -> refunded |
| `payment_method` | `VARCHAR(50)` | NOT NULL | mtn_momo, airtel_money, or cash_on_delivery |
| `shipping_address` | `TEXT` | NOT NULL | Detailed delivery destination in Rwamagana/Kigali |
| `shipping_phone` | `VARCHAR(50)` | NOT NULL | Recipient telephone number for courier |
| `notes` | `TEXT` | NULLABLE | Customer instructions for delivery |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Order placement timestamp |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Status progression timestamp |

#### Table: `order_items`
*Line item breakdown for each order*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique line item identifier |
| `order_id` | `INTEGER` | FK -> orders(id) ON DELETE CASCADE | Parent sales order |
| `product_id` | `INTEGER` | FK -> products(id) ON DELETE RESTRICT | Ordered merchandise item |
| `quantity` | `INTEGER` | NOT NULL, CHECK (quantity > 0) | Number of units purchased |
| `unit_price` | `NUMERIC(12,2)` | NOT NULL | Historical snapshot of unit price in RWF at checkout |
| `subtotal` | `NUMERIC(12,2)` | NOT NULL | Calculated as quantity * unit_price |

#### Table: `payment_audits`
*Verification logs for manual MoMo payments*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique audit log identifier |
| `order_id` | `INTEGER` | FK -> orders(id) ON DELETE CASCADE | Target verified order |
| `verified_by_id` | `INTEGER` | FK -> users(id) | User ID of administrator who verified payment |
| `verified_by_name` | `VARCHAR(255)` | NOT NULL | Full name of verifier (e.g., Shema Hubert) |
| `previous_payment_status` | `VARCHAR(30)` | NOT NULL | Status before verification |
| `new_payment_status` | `VARCHAR(30)` | NOT NULL | New status (e.g., paid) |
| `audit_notes` | `TEXT` | NULLABLE | MTN MoMo SMS reference, transaction code, or remarks |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Audit log timestamp |

#### Table: `device_push_tokens`
*FCM push notification tokens*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique token record identifier |
| `user_id` | `INTEGER` | FK -> users(id) ON DELETE CASCADE | Associated user account |
| `token` | `VARCHAR(500)` | NOT NULL, UNIQUE | Firebase Cloud Messaging device token |
| `platform` | `VARCHAR(20)` | DEFAULT 'android' | Mobile OS platform |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Token refresh timestamp |

#### Table: `notifications`
*In-app notification records and badges*

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Unique notification identifier |
| `user_id` | `INTEGER` | FK -> users(id) ON DELETE CASCADE | Recipient user |
| `title` | `VARCHAR(255)` | NOT NULL | Notification header |
| `message` | `TEXT` | NOT NULL | Body copy describing order update or alert |
| `type` | `VARCHAR(50)` | NOT NULL | Event: order_placed, payment_verified, status_change |
| `is_read` | `BOOLEAN` | DEFAULT FALSE | Read state for badge counters |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Dispatch timestamp |

---

## 5. API Endpoint Specifications

### `POST /api/auth/register`
- **Access Control:** Public
- **Description:** Register new customer account

**Sample Request:**
```json
{
  "full_name": "Jean Paul",
  "email": "jean@example.rw",
  "password": "Password123!",
  "phone": "+250788123456"
}
```

**Sample Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 14,
    "full_name": "Jean Paul",
    "email": "jean@example.rw",
    "role": "customer"
  }
}
```

---

### `POST /api/auth/login`
- **Access Control:** Public
- **Description:** Authenticate customer or admin

**Sample Request:**
```json
{
  "email": "shemahubert2021@gmail.com",
  "password": "shema123"
}
```

**Sample Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "full_name": "Shema Hubert",
    "email": "shemahubert2021@gmail.com",
    "role": "admin"
  }
}
```

---

### `GET /api/products`
- **Access Control:** Public
- **Description:** Query active products catalogue

**Sample Request:**
```json
Query Params: ?category_id=2&search=rice
```

**Sample Response:**
```json
{
  "success": true,
  "count": 1,
  "products": [
    {
      "id": 5,
      "title": "Bakhresa Basmati Rice 5kg",
      "price": 14500,
      "stock_quantity": 42,
      "category_id": 2,
      "image_url": "https://..."
    }
  ]
}
```

---

### `POST /api/orders`
- **Access Control:** Customer
- **Description:** Create new sales order with stock check

**Sample Request:**
```json
{
  "items": [{ "product_id": 5, "quantity": 2 }],
  "shipping_address": "Rwamana Market, Stall 12",
  "shipping_phone": "+250788123456",
  "payment_method": "mtn_momo"
}
```

**Sample Response:**
```json
{
  "success": true,
  "order": {
    "id": 88,
    "order_reference": "DG-20261026-0088",
    "total_amount": 29000,
    "order_status": "pending",
    "payment_status": "awaiting_payment"
  }
}
```

---

### `PUT /api/orders/:id/payment`
- **Access Control:** Admin Only
- **Description:** Verify manual MoMo payment and log audit

**Sample Request:**
```json
{
  "payment_status": "paid",
  "audit_notes": "Verified against MTN MoMo SMS Code #TX982314"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "audit": {
    "order_id": 88,
    "verified_by_name": "Shema Hubert",
    "new_payment_status": "paid"
  }
}
```

---

### `GET /api/orders/admin/reports`
- **Access Control:** Admin Only
- **Description:** Retrieve financial KPIs and summaries

**Sample Request:**
```json
None (Bearer Token with role=admin required)
```

**Sample Response:**
```json
{
  "success": true,
  "reports": {
    "total_revenue": 14250000,
    "total_orders": 312,
    "pending_fulfillment": 8,
    "revenue_by_payment_method": {
      "mtn_momo": 11800000,
      "airtel_money": 1950000,
      "cash_on_delivery": 500000
    }
  }
}
```

---

## 6. Installation, Setup & Deployment Guide

### 6.1 Prerequisites
- **Node.js:** v20.x or higher LTS
- **JDK:** OpenJDK 17 (Java Development Kit 17 LTS)
- **Android SDK:** API Level 34 (Android 14) with Build Tools 34.0.0
- **Cloud Database:** Neon PostgreSQL Serverless Account

### 6.2 Environment Configuration (`backend/.env`)
Create `backend/.env` using the following sanitized template:
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL=postgres://[user]:[password]@[neon-host]-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_cryptographically_secure_random_256bit_key_here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=shemahubert2021@gmail.com
ADMIN_INITIAL_PASSWORD=shema123
ADMIN_FULL_NAME=Shema Hubert
ADMIN_PHONE=+250790338043
```

### 6.3 Compilation and Execution Commands
1. **Install Dependencies:**
   ```bash
   npm install
   cd backend && npm install
   ```
2. **Build Backend TypeScript:**
   ```bash
   npm run build
   ```
3. **Start Production Backend:**
   ```bash
   npm start
   ```
4. **Execute Full Automated QA Suite:**
   ```bash
   node dist/test-full-qa.js
   node dist/test-notifications-e2e.js
   ```
5. **Build Android Signed Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *The generated APK is located at: `android/app/build/outputs/apk/release/app-release.apk` (78.61 MB standalone).*

---

## 7. Security, Business Rules & Maintenance

### 7.1 Security Architecture
- **Password Security:** Client-side real-time entropy scoring + backend bcrypt salt hashing (10 rounds).
- **Authorization Tokens:** Cryptographically signed JSON Web Tokens (HMAC-SHA256) with 7-day expiration.
- **Cross-Site Attack Defenses:** Helmet headers (HSTS, X-Content-Type-Options, Frameguard) + restricted CORS origin policies.
- **Rate Limiting:** Protects `/api/auth/login` and `/api/auth/register` against brute-force attacks.

### 7.2 Database Maintenance & Cloud Keep-Alive Strategy
- **Render Free-Tier Optimization:** A dedicated GitHub Actions workflow (`.github/workflows/keep-alive.yml`) executes every 14 minutes against `/ping` to keep the Express container active.
- **Neon Compute Conservation:** The `/ping` endpoint intentionally returns immediate static JSON without querying PostgreSQL, ensuring that Neon serverless compute units (CU) scale to zero when no genuine retail transactions occur.
