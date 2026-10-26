# Design and Implementation of the DG E-Commerce Mobile Application

**Academic Final Project Report**

- **Candidate Name:** Shema Hubert
- **Student Contact:** `shemahubert2021@gmail.com` | `+250 790 338 043`
- **Academic Programme:** Bachelor of Science in Information Technology / Software Engineering
- **Institution:** Faculty of Computing and Information Sciences [Institution Name Placeholder]
- **Academic Supervisor:** [Project Supervisor Name Placeholder]
- **Host Enterprise:** DG Retail Store, Commercial District, Rwamagana, Eastern Province, Rwanda
- **Submission Date:** October 26, 2026

---

## Abstract

In recent years, the retail commerce landscape in Rwanda has experienced significant transformation driven by the proliferation of smartphones and ubiquitous mobile money infrastructure such as MTN MoMo and Airtel Money. Despite these technological strides, rural and semi-urban retail establishments outside the capital of Kigali—such as the DG Retail Store situated in Rwamagana—continue to struggle with manual operational bottlenecks. These challenges include unrecorded paper inventory ledgers, lack of real-time product visibility for distant customers, error-prone price calculations, and fragmented payment reconciliation.

This project presents the comprehensive design, implementation, and empirical verification of the **DG E-Commerce Mobile Application**, an enterprise mobile and cloud system engineered specifically for DG Retail Store. The system architecture employs a three-tier model comprising a high-performance cross-platform Android client built on React Native CLI with TypeScript and the New Architecture (Fabric, Hermes), an asynchronous RESTful backend built with Node.js and Express.js, and a scalable cloud persistence layer powered by Neon Serverless PostgreSQL. Key features include real-time catalog search, authoritative server-side pricing and atomic inventory deduction with row-level locks, administrative inventory and category management, manual MTN/Airtel MoMo payment verification with audit logging, and in-app order notification pipelines. Comprehensive software quality assurance involving 73 automated and manual test suites yielded a 100% pass rate, affirming that the software is robust, secure, and production-ready for commercial deployment.

---

## Table of Contents
1. Chapter One: Introduction
2. Chapter Two: System Analysis and Design
3. Chapter Three: System Implementation
4. Chapter Four: Testing and Results
5. Chapter Five: Conclusion and Recommendations
6. References & Appendices

---

## Chapter One: Introduction

### 1.1 Background
Rwanda's National Information and Communication Technology (ICT) Strategy and the Vision 2050 framework emphasize accelerating the digital economy by fostering digital payment integration and e-commerce adoption across small and medium-sized enterprises (SMEs). In provincial trading hubs such as Rwamagana in the Eastern Province, retail merchants form the backbone of local trade. **DG Retail Store** is an established retail enterprise that supplies general merchandise, packaged foodstuffs, household appliances, and personal care products to residents across Rwamagana and neighboring sectors.

### 1.2 Problem Statement
Traditionally, DG Retail Store conducted commerce through physical walk-in transactions and unstructured telephone/WhatsApp inquiries. This manual workflow introduced severe operational deficiencies:
1. **Geographic Invisibility:** Consumers residing beyond walking distance had no reliable mechanism to view current merchandise, brand availability, or promotional pricing.
2. **Overselling & Stockout Vulnerabilities:** Stock tracking occurred on paper ledgers at the end of each day, frequently leading to situations where out-of-stock items were promised to customers.
3. **Informal Payment Hazards:** Customers paying via MTN MoMo sent screenshots via WhatsApp, requiring manual balance checking against merchant SMS messages, resulting in dispatch delays and bookkeeping errors.
4. **Absence of Customer Purchase History:** The store lacked structured analytics to assess recurring customers, average transaction value, or top-selling product categories.

### 1.3 Main and Specific Objectives
**Main Objective:** To design, build, test, and deploy a robust, secure, and user-friendly mobile e-commerce platform that digitizes customer ordering, inventory control, and payment verification for DG Retail Store in Rwamagana.

**Specific Objectives:**
1. To analyze the operational workflow of DG Retail Store and model functional requirements for customers and administrators.
2. To design a scalable three-tier client-server architecture with an ACID-compliant relational PostgreSQL database schema.
3. To implement a native-feel mobile client on Android using React Native CLI, Hermes bytecode, and TypeScript.
4. To construct an Express.js backend providing secure RESTful APIs, JWT authentication, and atomic inventory transactions.
5. To implement administrative back-office tools for category management, real-time stock replenishment, and MoMo payment audit tracking.
6. To empirically test all system components through unit, integration, security, and device runtime tests.

### 1.4 Scope and Significance
- **Scope:** The system covers customer registration, authenticated profile management, bilingual interface (English & Ikinyarwanda), product search, interactive cart, checkout, order state transitions, and administrative analytics. Delivery is targeted at Rwamagana town and Greater Kigali.
- **Significance:** For DG Store, the system eliminates overselling, speeds up order fulfillment, and provides audit trails. For customers, it offers transparent RWF pricing, convenient ordering from home, and real-time status tracking.

---

## Chapter Two: System Analysis and Design

### 2.1 Functional Requirements
- **FR-1: Customer Authentication:** Register, login, manage profile, change password, real-time password entropy meter.
- **FR-2: Product Catalog & Search:** Browse by category, debounced keyword search, view high-res images, pricing in RWF, and stock availability.
- **FR-3: Shopping Cart & Checkout:** Add/remove items, quantity steppers bounded by stock limits, address collection, payment method selection.
- **FR-4: Order Tracking:** View historical orders, live status updates (pending, confirmed, processing, shipped, delivered).
- **FR-5: Admin Product & Category Control:** Create, edit price, replenish stock, toggle availability, manage categories.
- **FR-6: Admin Payment Verification:** Match customer MoMo transaction references, record verifier name (Shema Hubert), update status to 'paid'.
- **FR-7: Business Analytics:** Aggregate gross revenue, orders count, payment method breakdown, and customer lifetime spend.

### 2.2 Non-Functional Requirements
- **Security:** bcrypt password hashing (10 salt rounds), HMAC-SHA256 JWTs, HTTPS transport, role-based access control, SQL injection prevention via parameterized queries.
- **Performance:** Mobile screen transition latency under 100ms, API response time under 250ms, cold-start latency mitigation via GitHub Actions keep-alive workflow.
- **Reliability & Consistency:** Atomic inventory updates using PostgreSQL row locks (`FOR UPDATE`), automatic stock restoration upon cancellation.
- **Usability & Accessibility:** Dual-language localization (English / Ikinyarwanda), responsive layouts, shimmer loading skeletons.

### 2.3 System Architecture
The platform utilizes a modern 3-Tier Enterprise Architecture, separating presentation, business logic, and cloud persistence.

![System Architecture Diagram](architecture-diagram.png)

### 2.4 Database Design
The relational database schema is implemented on Neon Serverless PostgreSQL. It incorporates 8 normalized tables with foreign keys and check constraints.

![Database ER Diagram](database-er-diagram.png)

---

## Chapter Three: System Implementation

### 3.1 Technology Stack & Tools
- **Mobile Client:** React Native CLI 0.74, TypeScript 5.0, Hermes Engine, React Navigation 6.x.
- **Backend API:** Node.js v20+, Express.js 4.19, TypeScript 5.3, pg-pool, jsonwebtoken, bcryptjs.
- **Cloud Persistence:** Neon Serverless PostgreSQL (PostgreSQL 18), AWS US-East region.
- **Cloud Hosting:** Render Web Services & GitHub Actions Keep-Alive Automation.

### 3.2 Visual Implementation & Screenshot Gallery
The figures below depict authentic screens captured from the running application on an Android 14 device (`emulator-5554`) connected to the live Neon cloud database.

#### Fig 3.1: Customer Authentication
![Fig 3.1: Customer Authentication](screenshots/01-customer-login.png)

*Customer login interface providing email/password authentication and secure token acquisition.*

---

#### Fig 3.2: Storefront Catalog & Categories
![Fig 3.2: Storefront Catalog & Categories](screenshots/03-home-catalogue.png)

*Home screen showcasing department categories, promotional banners, and featured products.*

---

#### Fig 3.3: Product Detail & Pricing
![Fig 3.3: Product Detail & Pricing](screenshots/08-product-details.png)

*Product specification screen displaying image gallery, authoritative RWF price, and unit stock count.*

---

#### Fig 3.4: Delivery Details & Checkout
![Fig 3.4: Delivery Details & Checkout](screenshots/11-checkout-screen.png)

*Checkout interface capturing delivery location in Rwamagana, contact telephone, and payment choice.*

---

#### Fig 3.5: Admin Operations Dashboard
![Fig 3.5: Admin Operations Dashboard](screenshots/14-admin-dashboard-overview.png)

*Store owner dashboard showing total revenue, order count, and real-time inventory statistics.*

---

#### Fig 3.6: Admin Inventory Management
![Fig 3.6: Admin Inventory Management](screenshots/16-admin-products-inventory.png)

*Inventory control view allowing direct stock replenishment, price adjustment, and product creation.*

---

#### Fig 3.7: Order State Fulfillment
![Fig 3.7: Order State Fulfillment](screenshots/19-admin-order-detail-status.png)

*Fulfillment console enforcing legitimate order lifecycle progression from pending to delivered.*

---

#### Fig 3.8: Mobile Money Payment Verification
![Fig 3.8: Mobile Money Payment Verification](screenshots/20-admin-whatsapp-momo-verification.png)

*Administrative payment verification tool recording MTN MoMo transaction code and audit logs.*

---

## Chapter Four: Testing and Results

### 4.1 Testing Methodology & Test Results Summary
Testing followed a structured Test-Driven and Verification approach combining unit testing, cloud integration testing, security penetration checks, and device runtime verification. A total of **73 test cases** were executed with a **100% pass rate**.

| Test Suite | Execution Target | Tests | Passed | Failed | Pass Rate |
|---|---|---|---|---|---|
| Client-Side Unit & Components | Jest & React Native Testing | 21 | 21 | 0 | 100.0% |
| Database & API Integration | Live Neon PostgreSQL Cloud | 40 | 40 | 0 | 100.0% |
| Notification Pipeline E2E | Trigger & Isolation Verification | 8 | 8 | 0 | 100.0% |
| Android 14 Device Runtime | Standalone Release APK & Hermes | 4 | 4 | 0 | 100.0% |
| **TOTALS** | **End-to-End System** | **73** | **73** | **0** | **100.0%** |

### 4.2 Security & Financial Integrity Verification
1. **Server-Side Price Validation:** Tampered client requests with altered prices were rejected in favor of authoritative database pricing.
2. **Concurrency Control:** Atomic transactions with `SELECT ... FOR UPDATE` row locks prevented duplicate order creation and negative stock conditions.
3. **Cross-Tenant Isolation:** Verified that Customer B cannot access Customer A's order records (HTTP 403 Forbidden).
4. **Stock Restoration:** Verified that cancelling an order restores the exact reserved merchandise units back to store inventory.

---

## Chapter Five: Conclusion and Recommendations

### 5.1 Summary of Completed Work
The project successfully designed, implemented, and verified a full-stack mobile e-commerce platform tailored for DG Retail Store in Rwamagana, Rwanda. The application delivers high-performance client rendering, rock-solid transactional persistence on Neon Serverless PostgreSQL, authoritative pricing, and intuitive administrative control.

### 5.2 Achievement of Objectives
All specific objectives formulated in Chapter One were accomplished in full:
- Scalable 3-tier architecture implemented.
- Mobile app deployed as standalone signed release APK.
- Express.js RESTful API deployed and connected to cloud PostgreSQL.
- MoMo payment verification and audit trail operational.
- 73 test cases passed with zero defects remaining.

### 5.3 Recommendations for Future Work
1. **Automated MoMo Open API Integration:** Transition from manual admin verification to direct MTN MoMo Open API collection webhooks.
2. **GPS Courier Tracking:** Integrate map SDKs for live courier location tracking during delivery dispatch across Rwamagana.
3. **Offline POS Sync:** Implement local SQLite sync to allow shop cashiers to process in-store walk-in sales offline and synchronize inventory upon reconnecting.

---

## References
1. React Native Documentation (2024). *The New Architecture: Fabric and TurboModules*. Meta Open Source.
2. PostgreSQL Global Development Group (2024). *PostgreSQL 18 Documentation: Concurrency Control and Transactions*.
3. Neon Database Documentation (2024). *Serverless Architecture and Autoscaling on Neon PostgreSQL*.
4. National Bank of Rwanda (BNR) (2023). *Annual Payment Systems Report: Mobile Money Adoption in Rwanda*.
5. Pressman, R. S. & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill Education.
