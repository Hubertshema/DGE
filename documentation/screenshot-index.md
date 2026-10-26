# DG E-Commerce Mobile Application — Screenshot Evidence Index

**Project:** DG E-Commerce Mobile Application  
**Target Store:** DG Retail Store, Rwamagana, Rwanda  
**System Administrator / Shop Owner:** Shema Hubert (`shemahubert2021@gmail.com`)  
**Runtime Platform:** Android 14+ (ARM64 / x86_64, Hermes Bytecode, Native Fabric Engine)  
**Capture Date:** October 26, 2026  
**Total Verified Screenshots:** 24 Genuine Device Captures  

---

## 1. Summary of Captured Application Evidence

All screenshots indexed below were captured directly from the running standalone production build (`DGEcommerce-Release.apk`) on an active Android 14 emulator (`emulator-5554`) connected to the live Neon Serverless PostgreSQL cloud database. No fabricated mockups or simulated wireframes were used.

| Figure | Filename | Screen Title | User Role | Feature Demonstrated | Testing Reference |
|---|---|---|---|---|---|
| Fig. 1 | `01-customer-login.png` | **Customer Sign-In Screen** | Customer / Public | Authentication & Session Initiation | `TC-AUTH-06, TC-AUTH-07` |
| Fig. 2 | `02-customer-register.png` | **Customer Registration Screen** | Customer / Public | Account Creation & Password Strength | `TC-AUTH-01, TC-AUTH-02, TC-AUTH-03, TC-AUTH-04` |
| Fig. 3 | `03-home-catalogue.png` | **Customer Home Screen & Catalogue** | Customer | Promotions, Featured Products & Navigation | `TC-CAT-01, TC-CAT-02` |
| Fig. 4 | `04-categories-overview.png` | **Product Categories Overview** | Customer | Department Discovery & Item Counts | `TC-CAT-01, TC-CAT-03` |
| Fig. 5 | `05-category-products.png` | **Filtered Category Product List** | Customer | Category-Specific Catalog Navigation | `TC-CAT-03` |
| Fig. 6 | `06-search-initial.png` | **Product Search Input & Suggestions** | Customer | Live Catalog Search Interface | `TC-CAT-04` |
| Fig. 7 | `07-product-search-results.png` | **Instant Product Search Results** | Customer | Filtered Query Results Display | `TC-CAT-04` |
| Fig. 8 | `08-product-details.png` | **Product Details Screen (Main View)** | Customer | Product Specifications, Pricing & Media | `TC-CAT-05` |
| Fig. 9 | `09-product-details-specs.png` | **Product Details Specifications & Actions** | Customer | Technical Specs & Add-to-Cart Flow | `TC-CAT-05, TC-CART-01` |
| Fig. 10 | `10-shopping-cart.png` | **Shopping Cart & Price Calculation** | Customer | Cart Management & Real-time Subtotaling | `TC-CART-01, TC-CART-02, TC-CART-03` |
| Fig. 11 | `11-checkout-screen.png` | **Delivery Details & Order Review** | Customer | Checkout & Order Creation Flow | `TC-CHK-01, TC-CHK-02, TC-CHK-03` |
| Fig. 12 | `12-admin-account-profile.png` | **User Account & Role Profile** | Customer / Admin | Profile Info, Settings & Language Selector | `TC-PROF-01, TC-PROF-02, TC-PROF-03` |
| Fig. 13 | `13-admin-dashboard.png` | **Admin Operations Hub** | Administrator (Owner) | Store Management Navigation Menu | `TC-ADM-AUTH-01, TC-ADM-DASH-01` |
| Fig. 14 | `14-admin-dashboard-overview.png` | **Admin Dashboard Executive Metrics** | Administrator (Owner) | Real-time Store KPIs & Summary Cards | `TC-ADM-DASH-01, TC-ADM-DASH-02` |
| Fig. 15 | `15-admin-financial-metrics.png` | **Admin Financial & Fulfillment Metrics** | Administrator (Owner) | Revenue Breakdown & Order Pipeline | `TC-ADM-DASH-02, TC-ADM-REP-01` |
| Fig. 16 | `16-admin-products-inventory.png` | **Admin Products Inventory Management** | Administrator (Owner) | Product Catalog List & Quick Actions | `TC-ADM-PROD-01, TC-ADM-PROD-03` |
| Fig. 17 | `17-admin-products-stock-levels.png` | **Admin Inventory Stock Badges & Alerts** | Administrator (Owner) | Stock Monitoring & Low-Stock Alerts | `TC-ADM-PROD-03, TC-ADM-PROD-04` |
| Fig. 18 | `18-admin-orders-list.png` | **Admin Customer Orders List** | Administrator (Owner) | Order Pipeline Management & Status Filtering | `TC-ADM-ORD-01, TC-ADM-ORD-02` |
| Fig. 19 | `19-admin-order-detail-status.png` | **Admin Order Fulfillment & Status Transition** | Administrator (Owner) | Order Status Lifecycle State Machine | `TC-ADM-ORD-02, TC-ADM-ORD-04` |
| Fig. 20 | `20-admin-whatsapp-momo-verification.png` | **Admin Mobile Money Payment Verification** | Administrator (Owner) | Manual MoMo Verification & Audit Logging | `TC-ADM-PAY-01, TC-ADM-PAY-02` |
| Fig. 21 | `21-admin-sales-reports.png` | **Admin Sales Reports & Performance Analytics** | Administrator (Owner) | Historical Sales Analytics & Department Revenue | `TC-ADM-REP-01, TC-ADM-REP-02` |
| Fig. 22 | `22-admin-reports-analytics.png` | **Admin Customer Analytics & Directory** | Administrator (Owner) | Customer Lifetime Value & Ordering Habits | `TC-ADM-CUST-01, TC-ADM-CUST-02` |
| Fig. 23 | `21-home-english-language.png` | **Home Screen - English Language Mode** | Customer / System | Bilingual Localization (English Interface) | `TC-LOC-01` |
| Fig. 24 | `22-notification-center.png` | **In-App Notification Center** | Customer / Admin | Push & In-App Order Updates | `TC-NOTIF-01, TC-NOTIF-02` |

---

## 2. Detailed Screenshot Descriptions & Verification Details

### Figure 1: Customer Sign-In Screen
- **Filename:** `documentation/screenshots/01-customer-login.png`
- **Target User Role:** Customer / Public
- **Primary Feature:** Authentication & Session Initiation
- **Testing Cross-Reference:** `TC-AUTH-06, TC-AUTH-07`
- **Description & Functional Evidence:** Provides secure email and password authentication with client-side format validation, password visibility toggles, loading spinners, and navigation to the registration flow.

![Customer Sign-In Screen](screenshots/01-customer-login.png)

---

### Figure 2: Customer Registration Screen
- **Filename:** `documentation/screenshots/02-customer-register.png`
- **Target User Role:** Customer / Public
- **Primary Feature:** Account Creation & Password Strength
- **Testing Cross-Reference:** `TC-AUTH-01, TC-AUTH-02, TC-AUTH-03, TC-AUTH-04`
- **Description & Functional Evidence:** Collects full name, valid email, Rwandan phone number (+250 format), and password. Integrates dynamic password strength entropy scoring and confirmation checking before submitting to the backend.

![Customer Registration Screen](screenshots/02-customer-register.png)

---

### Figure 3: Customer Home Screen & Catalogue
- **Filename:** `documentation/screenshots/03-home-catalogue.png`
- **Target User Role:** Customer
- **Primary Feature:** Promotions, Featured Products & Navigation
- **Testing Cross-Reference:** `TC-CAT-01, TC-CAT-02`
- **Description & Functional Evidence:** Displays promotional retail banners, fast horizontal department categories, new arrival feeds, and quick navigation icons for cart and search.

![Customer Home Screen & Catalogue](screenshots/03-home-catalogue.png)

---

### Figure 4: Product Categories Overview
- **Filename:** `documentation/screenshots/04-categories-overview.png`
- **Target User Role:** Customer
- **Primary Feature:** Department Discovery & Item Counts
- **Testing Cross-Reference:** `TC-CAT-01, TC-CAT-03`
- **Description & Functional Evidence:** Presents all active retail shop categories (Electronics, Fashion, Grocery, Home, etc.) with product count badges and visual category cards.

![Product Categories Overview](screenshots/04-categories-overview.png)

---

### Figure 5: Filtered Category Product List
- **Filename:** `documentation/screenshots/05-category-products.png`
- **Target User Role:** Customer
- **Primary Feature:** Category-Specific Catalog Navigation
- **Testing Cross-Reference:** `TC-CAT-03`
- **Description & Functional Evidence:** Lists all active in-stock products under a selected department category with real-time Rwandan Franc (RWF) pricing and stock indicators.

![Filtered Category Product List](screenshots/05-category-products.png)

---

### Figure 6: Product Search Input & Suggestions
- **Filename:** `documentation/screenshots/06-search-initial.png`
- **Target User Role:** Customer
- **Primary Feature:** Live Catalog Search Interface
- **Testing Cross-Reference:** `TC-CAT-04`
- **Description & Functional Evidence:** Fast debounced search interface allowing customers to search the store catalogue by title, category, or brand name.

![Product Search Input & Suggestions](screenshots/06-search-initial.png)

---

### Figure 7: Instant Product Search Results
- **Filename:** `documentation/screenshots/07-product-search-results.png`
- **Target User Role:** Customer
- **Primary Feature:** Filtered Query Results Display
- **Testing Cross-Reference:** `TC-CAT-04`
- **Description & Functional Evidence:** Displays matching search results dynamically as the user types, with product images, formatted prices, and instant 'Add to Cart' actions.

![Instant Product Search Results](screenshots/07-product-search-results.png)

---

### Figure 8: Product Details Screen (Main View)
- **Filename:** `documentation/screenshots/08-product-details.png`
- **Target User Role:** Customer
- **Primary Feature:** Product Specifications, Pricing & Media
- **Testing Cross-Reference:** `TC-CAT-05`
- **Description & Functional Evidence:** Detailed view showing multi-angle product photography, clear RWF pricing, unit stock availability, rating breakdown, and quantity selector.

![Product Details Screen (Main View)](screenshots/08-product-details.png)

---

### Figure 9: Product Details Specifications & Actions
- **Filename:** `documentation/screenshots/09-product-details-specs.png`
- **Target User Role:** Customer
- **Primary Feature:** Technical Specs & Add-to-Cart Flow
- **Testing Cross-Reference:** `TC-CAT-05, TC-CART-01`
- **Description & Functional Evidence:** Detailed specification attributes, warranty notes, seller terms, and prominent sticky 'Add to Cart' button with stock limit enforcement.

![Product Details Specifications & Actions](screenshots/09-product-details-specs.png)

---

### Figure 10: Shopping Cart & Price Calculation
- **Filename:** `documentation/screenshots/10-shopping-cart.png`
- **Target User Role:** Customer
- **Primary Feature:** Cart Management & Real-time Subtotaling
- **Testing Cross-Reference:** `TC-CART-01, TC-CART-02, TC-CART-03`
- **Description & Functional Evidence:** Displays added items with live quantity steppers (+/-), item removal confirmation, subtotal calculation, delivery fee estimator, and checkout CTA.

![Shopping Cart & Price Calculation](screenshots/10-shopping-cart.png)

---

### Figure 11: Delivery Details & Order Review
- **Filename:** `documentation/screenshots/11-checkout-screen.png`
- **Target User Role:** Customer
- **Primary Feature:** Checkout & Order Creation Flow
- **Testing Cross-Reference:** `TC-CHK-01, TC-CHK-02, TC-CHK-03`
- **Description & Functional Evidence:** Captures customer shipping address in Rwamagana/Kigali, delivery notes, contact phone, payment method selector (MTN MoMo, Airtel Money, Cash on Delivery), and order confirmation.

![Delivery Details & Order Review](screenshots/11-checkout-screen.png)

---

### Figure 12: User Account & Role Profile
- **Filename:** `documentation/screenshots/12-admin-account-profile.png`
- **Target User Role:** Customer / Admin
- **Primary Feature:** Profile Info, Settings & Language Selector
- **Testing Cross-Reference:** `TC-PROF-01, TC-PROF-02, TC-PROF-03`
- **Description & Functional Evidence:** Displays authenticated user information, email, phone, role badge (Administrator/Customer), password update entry, and bilingual toggle (English / Ikinyarwanda).

![User Account & Role Profile](screenshots/12-admin-account-profile.png)

---

### Figure 13: Admin Operations Hub
- **Filename:** `documentation/screenshots/13-admin-dashboard.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Store Management Navigation Menu
- **Testing Cross-Reference:** `TC-ADM-AUTH-01, TC-ADM-DASH-01`
- **Description & Functional Evidence:** Admin console entry offering direct navigation to Products Inventory, Category Management, Order Processing, Payment Verification, and Financial Reports.

![Admin Operations Hub](screenshots/13-admin-dashboard.png)

---

### Figure 14: Admin Dashboard Executive Metrics
- **Filename:** `documentation/screenshots/14-admin-dashboard-overview.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Real-time Store KPIs & Summary Cards
- **Testing Cross-Reference:** `TC-ADM-DASH-01, TC-ADM-DASH-02`
- **Description & Functional Evidence:** High-level summary displaying Total Revenue (RWF), Total Orders Count, Active Catalog Items, and Registered Customers with trend indicators.

![Admin Dashboard Executive Metrics](screenshots/14-admin-dashboard-overview.png)

---

### Figure 15: Admin Financial & Fulfillment Metrics
- **Filename:** `documentation/screenshots/15-admin-financial-metrics.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Revenue Breakdown & Order Pipeline
- **Testing Cross-Reference:** `TC-ADM-DASH-02, TC-ADM-REP-01`
- **Description & Functional Evidence:** Visual breakdown of revenue by payment method (MTN Mobile Money vs Airtel vs Cash), pending fulfillment orders, and daily average volume.

![Admin Financial & Fulfillment Metrics](screenshots/15-admin-financial-metrics.png)

---

### Figure 16: Admin Products Inventory Management
- **Filename:** `documentation/screenshots/16-admin-products-inventory.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Product Catalog List & Quick Actions
- **Testing Cross-Reference:** `TC-ADM-PROD-01, TC-ADM-PROD-03`
- **Description & Functional Evidence:** Administrative inventory view allowing search, filtering by stock status, direct editing of price/stock, activating/deactivating listings, and creating new products.

![Admin Products Inventory Management](screenshots/16-admin-products-inventory.png)

---

### Figure 17: Admin Inventory Stock Badges & Alerts
- **Filename:** `documentation/screenshots/17-admin-products-stock-levels.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Stock Monitoring & Low-Stock Alerts
- **Testing Cross-Reference:** `TC-ADM-PROD-03, TC-ADM-PROD-04`
- **Description & Functional Evidence:** Highlights low-stock items with warning badges, unit stock counts, and quick stock replenishment triggers to prevent stockouts in the Rwamagana shop.

![Admin Inventory Stock Badges & Alerts](screenshots/17-admin-products-stock-levels.png)

---

### Figure 18: Admin Customer Orders List
- **Filename:** `documentation/screenshots/18-admin-orders-list.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Order Pipeline Management & Status Filtering
- **Testing Cross-Reference:** `TC-ADM-ORD-01, TC-ADM-ORD-02`
- **Description & Functional Evidence:** Master order list showing order reference numbers, customer names, timestamp, total RWF amount, payment status badges, and fulfillment status.

![Admin Customer Orders List](screenshots/18-admin-orders-list.png)

---

### Figure 19: Admin Order Fulfillment & Status Transition
- **Filename:** `documentation/screenshots/19-admin-order-detail-status.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Order Status Lifecycle State Machine
- **Testing Cross-Reference:** `TC-ADM-ORD-02, TC-ADM-ORD-04`
- **Description & Functional Evidence:** Order processing screen enforcing legitimate status progression (Pending -> Confirmed -> Processing -> Shipped -> Delivered) and cancellation stock restoration.

![Admin Order Fulfillment & Status Transition](screenshots/19-admin-order-detail-status.png)

---

### Figure 20: Admin Mobile Money Payment Verification
- **Filename:** `documentation/screenshots/20-admin-whatsapp-momo-verification.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Manual MoMo Verification & Audit Logging
- **Testing Cross-Reference:** `TC-ADM-PAY-01, TC-ADM-PAY-02`
- **Description & Functional Evidence:** Administrative tool to verify customer MTN MoMo/Airtel Money transaction SMS codes, attach internal verification notes, and mark payment as 'Paid'.

![Admin Mobile Money Payment Verification](screenshots/20-admin-whatsapp-momo-verification.png)

---

### Figure 21: Admin Sales Reports & Performance Analytics
- **Filename:** `documentation/screenshots/21-admin-sales-reports.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Historical Sales Analytics & Department Revenue
- **Testing Cross-Reference:** `TC-ADM-REP-01, TC-ADM-REP-02`
- **Description & Functional Evidence:** Detailed financial reports displaying total sales, top selling items, category revenue breakdown, and exportable business statistics.

![Admin Sales Reports & Performance Analytics](screenshots/21-admin-sales-reports.png)

---

### Figure 22: Admin Customer Analytics & Directory
- **Filename:** `documentation/screenshots/22-admin-reports-analytics.png`
- **Target User Role:** Administrator (Owner)
- **Primary Feature:** Customer Lifetime Value & Ordering Habits
- **Testing Cross-Reference:** `TC-ADM-CUST-01, TC-ADM-CUST-02`
- **Description & Functional Evidence:** Customer analysis table listing registered shoppers, their historical order counts, total RWF spent, and direct contact options for customer service.

![Admin Customer Analytics & Directory](screenshots/22-admin-reports-analytics.png)

---

### Figure 23: Home Screen - English Language Mode
- **Filename:** `documentation/screenshots/21-home-english-language.png`
- **Target User Role:** Customer / System
- **Primary Feature:** Bilingual Localization (English Interface)
- **Testing Cross-Reference:** `TC-LOC-01`
- **Description & Functional Evidence:** Demonstrates the complete user interface rendered in English, including localized labels, currency formatting (RWF), and navigation tabs.

![Home Screen - English Language Mode](screenshots/21-home-english-language.png)

---

### Figure 24: In-App Notification Center
- **Filename:** `documentation/screenshots/22-notification-center.png`
- **Target User Role:** Customer / Admin
- **Primary Feature:** Push & In-App Order Updates
- **Testing Cross-Reference:** `TC-NOTIF-01, TC-NOTIF-02`
- **Description & Functional Evidence:** Notification feed showing chronological alerts for order placement, payment verification, dispatch, and delivery updates with unread count badges.

![In-App Notification Center](screenshots/22-notification-center.png)

---

