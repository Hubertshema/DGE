# MASTER DEVELOPMENT PROMPT — D&G E-COMMERCE MOBILE APPLICATION

## 1. Your role

Act as a senior React Native developer, Node.js backend developer, PostgreSQL database engineer, UI/UX designer, and application security specialist.

Help me build a complete, professional, production-oriented cross-platform e-commerce application for **D&G**, a growing online retail startup located in Rwamagana, Rwanda.

Work directly inside my existing project, inspect the current code before making changes, and implement the application step by step. Do not merely provide instructions or sample code when you can implement the changes directly.

Explain important technical decisions in simple English because I am learning application development.

---

## 2. Existing project and development environment

**IMPORTANT: The project already exists. Do not create another project.**

Project name: `DGEcommerce`

Project location:

`C:\Users\user\Desktop\DGEcommerce`

Current environment:

- Operating system: Windows 11
- Mobile framework: React Native CLI
- React Native version: `0.88.0`
- React Native Community CLI: `20.2.0`
- Language: TypeScript
- Android development: Android Studio and Android SDK
- Node.js and npm are installed
- Backend: Node.js + Express.js + TypeScript
- Database: Neon PostgreSQL

The React Native project's dependencies have been installed successfully using npm, although npm reported security vulnerabilities that must be reviewed carefully.

### Current Android build issue

The Android build previously failed with this error:

`CXX1101: NDK at C:\Users\user\AppData\Local\Android\Sdk\ndk\27.1.12297006 did not have a source.properties file`

This suggests that the Android NDK installation may be incomplete or corrupted.

Before attempting to build the application again:

1. Inspect the current project and environment.
2. Check whether the NDK installation has been repaired.
3. Verify that this file exists:

   `C:\Users\user\AppData\Local\Android\Sdk\ndk\27.1.12297006\source.properties`

4. If it is missing, explain how to reinstall the required NDK version through Android Studio's SDK Manager.
5. Do not randomly upgrade Gradle, Kotlin, Android Gradle Plugin, React Native, Java, or NDK versions.
6. Do not recreate the project to solve this problem.
7. Do not overwrite existing configuration files without examining them first.

Metro previously started successfully on port `8082` because port `8081` was occupied. Check the current Metro process before starting another one.

Keep the existing React Native CLI setup. **Do not migrate this project to Expo or Expo Go.**

Use the project's existing scripts where available, including `npm run android`. Inspect `package.json` before assuming that a script exists.

---

## 3. Project objective

Build a real e-commerce application that allows customers to:

- Register and log in securely.
- Browse products and categories.
- Search for products.
- Filter and sort products.
- View product details and images.
- Select product variations where applicable.
- Add products to a shopping cart.
- Update quantities and remove items.
- Manage delivery addresses.
- Place orders.
- Contact the seller through WhatsApp to arrange payment.
- View order details and order history.
- Track order status.
- Manage their customer profile.

The seller must be able to manage the actual business through a protected seller dashboard or seller screens.

The application must use real backend APIs and a real PostgreSQL database. It must not depend on hardcoded demonstration products or fake authentication.

---

## 4. Technology stack

### Mobile application

- React Native CLI
- TypeScript
- React Navigation
- Axios for API requests
- React Hook Form for forms
- Zod for validation
- Context API or another lightweight state-management solution where appropriate
- A compatible, maintained vector icon library
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler` if required by the chosen navigation configuration
- `i18next` and `react-i18next` for translations if compatible with the existing setup

Use compatible package versions for the existing React Native 0.88.0 project. Verify compatibility before installing libraries.

Do not introduce unnecessary dependencies.

### Backend

- Node.js
- Express.js
- TypeScript
- REST API architecture
- PostgreSQL
- Neon PostgreSQL for hosted database deployment
- Secure password hashing
- Environment variables for secrets
- Server-side request validation
- Centralized error handling
- Database transactions for operations that must succeed or fail together

Keep the mobile application and backend organized separately. If the current repository contains only the mobile application, create a clearly organized backend directory or a separate backend project without damaging the existing mobile application.

### Development and deployment

- Git and GitHub for version control
- Android Studio for Android development
- Render or another suitable service for API hosting
- Neon for hosted PostgreSQL
- Android APK for testing and AAB for Play Store submission

A native iOS build requires macOS and Xcode. Do not claim that an iOS binary has been built on Windows.

---

## 5. Brand identity and UI design

Use a clean, modern, professional design suitable for a Rwandan online retail business.

### Brand colors

Use these colors consistently throughout the application:

- Primary green: `#16834A`
- Orange accent: `#F28C28`
- White: `#FFFFFF`
- Main text: `#222222`
- Secondary text: `#68756C`
- Screen background: `#F5F7F5`
- Border: `#E1E7E2`

### Design rules

1. Use a white and light-neutral background with green as the primary brand color and orange for selected accents.
2. Do not use gradients anywhere in the application.
3. Use consistent spacing, typography, button heights, corner radii, and input styles.
4. Make the application responsive across supported Android and iOS screen sizes.
5. Use safe-area handling and avoid content being hidden behind the status bar, navigation bar, or keyboard.
6. Provide clear loading, empty, error, success, and disabled states.
7. Use readable text and accessible contrast.
8. Avoid overcrowded screens and unnecessary decorative elements.
9. Use reusable components instead of repeating the same UI code.
10. Use real vector icons rather than emojis for navigation, cart, search, profile, settings, notifications, and other interface actions.
11. Keep product photographs as images, not substitutes for interface icons.
12. Use appropriate image placeholders only when a product has no image; do not invent products to fill the interface.

Do not redesign the brand into a different color scheme.

---

## 6. Application structure and navigation

Create a logical, maintainable navigation system using React Navigation.

### Public screens

- Welcome or introductory screen, if useful
- Login
- Customer registration
- Forgot password
- Product catalogue
- Product categories
- Product details
- Search results

### Customer screens

- Home
- Categories
- Search
- Shopping cart
- Checkout
- Delivery addresses
- Order confirmation
- My orders
- Order details
- Customer profile
- Edit profile
- Settings
- Language selection

Use a bottom-tab navigation layout for the main customer experience where appropriate. Keep authentication screens separate from the main shopping navigation.

### Seller screens

Create a protected seller interface with:

- Dashboard
- Product management
- Create product
- Edit product
- Product availability and stock
- Category management
- Order management
- Order details
- Payment verification
- Order-status updates
- Customer order information needed for fulfilment
- Basic sales and order reports
- Seller profile and settings

The seller interface can share the same React Native application, but it must be accessible only to authenticated seller accounts.

Do not allow ordinary customers to access seller functions by changing navigation state or editing a request.

---

## 7. Authentication and authorization

Support exactly two application roles:

- `client`
- `seller`

### Customer registration

Public registration must always create a `client` account.

Never accept a role supplied by a public registration form as authoritative. The backend must assign the customer role itself.

### Seller account

Create seller accounts through a secure administrative bootstrap or another controlled server-side process.

Do not create a publicly available seller registration option.

Do not hardcode a default seller password in the application or repository.

### Security requirements

- Hash passwords using a suitable password-hashing library.
- Use short-lived access tokens and a secure refresh-token strategy if refresh tokens are implemented.
- Protect private API endpoints with authentication middleware.
- Check user roles on the backend.
- Validate inputs on the backend even if the mobile application also validates them.
- Store secrets in environment variables.
- Never put database credentials, private API secrets, or signing secrets in the mobile application.
- Use secure token storage compatible with React Native.
- Implement logout and appropriate token invalidation.
- Add sensible rate limits to authentication and other sensitive endpoints.
- Return useful error messages without exposing stack traces, secrets, or internal database details.
- Implement password recovery only through a properly secured process.

If an authentication or recovery provider is required, explain the setup instead of pretending it is already configured.

---

## 8. Product catalogue

Products must be loaded from the backend and stored in PostgreSQL.

Each product should support appropriate fields such as:

- Product ID
- Product name
- Description
- Category
- Price in Rwandan francs (RWF)
- Product images
- Stock quantity
- Availability status
- Optional SKU
- Optional brand
- Optional product variations, such as size or color
- Creation and update timestamps

Support the following product categories:

- Clothes
- Shoes
- Bags
- Household equipment
- Jewellery
- Cosmetics

The seller must be able to create, update, deactivate, and manage products through protected backend endpoints and the seller interface.

The catalogue must support search, category filtering, pagination, and useful sorting options.

Do not hardcode product lists in the production application. If the database is empty, show a helpful empty state and provide a seller workflow to add products.

Use real product images from approved uploads or configured image URLs. If image hosting is required, explain and implement a suitable storage approach.

---

## 9. Shopping cart and checkout

Allow customers to:

- Add products to the cart.
- Increase and decrease quantities.
- Remove products.
- See item subtotals.
- See the order total.
- Confirm their delivery address.
- Review the order before placing it.

The backend must calculate prices and totals using current database values. Never trust prices, discounts, stock values, or totals submitted by the mobile application.

Store money using PostgreSQL `NUMERIC` or another appropriate exact monetary representation. Use RWF as the currency.

At checkout:

1. Authenticate the customer.
2. Validate the requested products and quantities.
3. Verify stock and product availability.
4. Calculate all totals on the server.
5. Create the order and order items in a database transaction.
6. Reserve or update stock safely according to the chosen inventory policy.
7. Create the initial payment record.
8. Return the saved order information.
9. Only after successful order creation, offer the customer the WhatsApp payment/contact action.

Prevent duplicate orders from repeated checkout requests where appropriate. Use database transactions and idempotency protection where suitable.

If a product becomes unavailable or its price changes before checkout, inform the customer and require review rather than silently charging an outdated amount.

---

## 10. WhatsApp payment arrangement

The business will initially arrange payment through WhatsApp rather than using an integrated payment gateway.

Do not build a fake payment gateway. Do not claim that a customer has paid merely because WhatsApp opened.

### Expected workflow

1. The customer reviews their cart and delivery information.
2. The backend saves the order successfully in PostgreSQL.
3. The application displays the saved order reference and total.
4. The customer chooses to contact the seller through WhatsApp.
5. The application opens WhatsApp using a correctly encoded message.
6. The customer reviews the message and manually sends it.
7. The seller communicates payment instructions to the customer.
8. The customer follows the agreed payment method.
9. The seller checks the actual payment evidence outside the app or through the configured verification process.
10. The seller updates the payment status through a protected seller endpoint.
11. The customer sees the updated payment and order statuses in the application.

Use a configurable official business phone number. Do not invent a number.

Build the WhatsApp URL using the correct international phone-number format and URL-encoded message content. Use React Native `Linking` and handle the case where WhatsApp cannot be opened.

Example message structure:

`Hello D&G, I would like to arrange payment for order [ORDER_REFERENCE]. Total: [TOTAL] RWF. Please share the payment instructions.`

Generate the reference and total from the actual saved order. Do not use placeholder values in the production workflow.

The WhatsApp message should not contain unnecessary sensitive personal information.

### Order statuses

Use a consistent set of statuses, such as:

- `pending_confirmation`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

Define and enforce valid status transitions on the backend.

### Payment statuses

Use a separate payment status field:

- `awaiting_payment`
- `payment_under_review`
- `paid`
- `payment_rejected`
- `refunded` only if a real refund process is supported

The exact status flow must be documented and implemented consistently.

Opening WhatsApp or sending a WhatsApp message must never automatically change payment status to `paid`.

Only authorized seller actions or a genuine verified payment integration may confirm payment. Record who verified the payment and when.

---

## 11. Database design

Design a normalized PostgreSQL database with appropriate constraints, indexes, foreign keys, and timestamps.

Create tables or equivalent structures for:

- `users`
- `categories`
- `products`
- `product_images` if multiple product images are supported
- `addresses`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `refresh_tokens` if refresh tokens are used
- `password_reset_tokens` if password recovery is implemented

Add other tables only when justified by actual requirements.

Important rules:

- Use stable primary keys.
- Add foreign-key relationships.
- Store password hashes, never plaintext passwords.
- Keep an order's purchased item details and prices as a snapshot in `order_items`, so future product edits do not change historical orders.
- Use database transactions for checkout, stock updates, and payment verification operations that require atomicity.
- Prevent negative stock.
- Prevent customers from viewing or changing another customer's private orders.
- Ensure that seller actions are authorized.
- Use migrations or a documented, repeatable schema setup.
- Keep database connection credentials outside source code.
- Provide a safe initial database setup procedure.

Do not store the database schema only in application memory.

---

## 12. Backend API architecture

Create a clear REST API with versioned routes, such as `/api/v1`.

Implement appropriate endpoints for:

### Authentication

- Register client
- Login
- Logout
- Refresh session, if supported
- Get current user
- Password recovery, if supported

### Products and categories

- List products
- Search and filter products
- Get product details
- List categories
- Seller create/update/deactivate product
- Seller manage categories

### Customer

- Get and update own profile
- Manage own addresses
- View own cart
- Update cart items
- View own orders
- View own order details

### Checkout and orders

- Create order
- View order details
- View order history
- Cancel an eligible order
- View payment status

### Seller

- View dashboard statistics
- View and manage orders
- Update valid order statuses
- Review payment records
- Verify or reject payment after actual review
- View relevant sales and order reports

Use authorization middleware and input validation for protected endpoints.

Add centralized error handling, pagination, filtering, and consistent JSON response structures.

Document the API using an appropriate tool such as OpenAPI if practical.

---

## 13. Localization

Support English and Kinyarwanda.

Requirements:

- Keep translations in organized language files.
- Allow users to change the application language.
- Translate navigation labels, forms, validation messages, buttons, order statuses, and major customer-facing messages.
- Avoid duplicating screens just to support different languages.
- Persist the selected language appropriately.
- Use English as the default unless the user selects another language.

Do not machine-translate important payment or legal instructions without review.

---

## 14. User experience and reliability

Implement reusable UI components, including:

- Primary and secondary buttons
- Text inputs
- Search input
- Product cards
- Category cards
- Price display
- Loading indicators
- Empty states
- Error messages
- Confirmation dialogs
- Status badges
- Form validation messages
- Network error handling

Every visible interactive control must perform its intended action.

Implement:

- Loading states for API requests.
- Clear error messages when the network or backend is unavailable.
- Retry actions where appropriate.
- Pull-to-refresh where useful.
- Form validation.
- Prevention of repeated submissions while requests are in progress.
- Keyboard-safe forms.
- Accessible touch targets.
- Correct navigation after login, logout, checkout, and other important actions.

Do not display success messages until the relevant operation has actually succeeded.

---

## 15. Real data only — remove mock data

The application must ultimately work with real backend data.

Inspect the current codebase and identify:

- Hardcoded sample products
- Fake user accounts
- Mock login functions
- Simulated API responses
- Static order histories
- Fake payment confirmations
- Placeholder dashboard statistics
- Hardcoded cart data
- Test-only business rules

Remove or replace these as each real feature is implemented.

Rules:

1. Do not create fake products or fake customers to make the interface look populated.
2. Do not make login appear successful without a valid backend response.
3. Do not simulate successful checkout.
4. Do not mark an order paid without actual verification.
5. Do not calculate final prices only in the mobile application.
6. Do not show invented sales totals or order counts.
7. Do not leave fake API services connected to production screens.
8. If a feature is not implemented yet, show an honest unavailable, loading, or empty state.
9. Test fixtures may exist in dedicated automated test files, but must not be used as production application data.
10. Search the project for TODOs, placeholder handlers, fake responses, and unused demo components before declaring the work complete.

Keep a clear distinction between test data used by automated tests and real production data.

---

## 16. Project organization

Inspect the existing directory structure first. Adapt it rather than forcing a new structure onto working code.

A possible mobile structure is:

`src/`
- `api/`
- `assets/`
- `components/`
- `constants/`
- `features/`
  - `auth/`
  - `products/`
  - `cart/`
  - `checkout/`
  - `orders/`
  - `profile/`
  - `seller/`
- `hooks/`
- `navigation/`
- `localization/`
- `services/`
- `state/`
- `theme/`
- `types/`
- `utils/`

A possible backend structure is:

`backend/src/`
- `config/`
- `controllers/`
- `middleware/`
- `routes/`
- `services/`
- `repositories/` if useful
- `schemas/`
- `types/`
- `utils/`
- `app.ts`
- `server.ts`

Use the structure that best fits the existing codebase. Do not create unnecessary folders or empty files merely to follow this example.

Keep business logic out of large screen components.

---

## 17. Environment configuration

Use environment variables for configuration.

The backend should have an example environment file containing variable names without real secrets, for example:

- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET` if using JWT
- `JWT_REFRESH_SECRET` if using refresh tokens
- `WHATSAPP_BUSINESS_PHONE`
- `CLIENT_ORIGIN` if applicable

Add other variables only when required by the implementation.

Never commit real passwords, tokens, private keys, or database connection strings to GitHub.

Do not put backend secrets in React Native environment variables that are bundled into the application.

Explain which environment variables belong to the mobile app, which belong to the backend, and which belong to deployment configuration.

Configure `.gitignore` correctly and check that sensitive files are not tracked.

---

## 18. Testing and quality assurance

Test the application progressively instead of waiting until every screen has been created.

### Mobile tests

Check:

- App startup
- Navigation
- Login and registration validation
- Product loading
- Search and category filtering
- Cart operations
- Checkout validation
- WhatsApp link creation
- Order history
- Seller route protection
- Loading and error states

### Backend tests

Check:

- Registration and login
- Invalid credentials
- Role-based access
- Product endpoints
- Customer data privacy
- Cart validation
- Checkout calculations
- Stock concurrency
- Duplicate order prevention
- Order status transitions
- Payment verification
- Invalid request handling

### Integration tests

Verify that the mobile application can communicate with the real backend and database.

Test that creating an order saves it in PostgreSQL before WhatsApp is opened.

Do not treat a successful HTTP request as proof that every business rule is correct.

---

## 19. Android build and development workflow

Before changing build configuration:

1. Inspect `package.json`.
2. Inspect the React Native version and installed dependencies.
3. Inspect the Android Gradle files.
4. Check the installed JDK, Android SDK, and NDK.
5. Review the existing build error.
6. Make the smallest necessary correction.

The immediate known issue is the missing NDK `source.properties` file.

Repair the NDK installation using Android Studio's SDK Manager before making speculative Gradle changes.

After verifying the NDK:

1. Start Metro in a separate terminal.
2. Keep the existing Metro process running.
3. Use the project's existing Android run script.
4. Check the actual build output.
5. Fix errors one at a time.
6. Confirm that the app installs and launches on an available emulator or authorized Android device.

Because Metro previously used port `8082`, check which port the running process is using. Do not assume it is always `8081`.

If a clean rebuild becomes necessary, explain the reason first and avoid deleting dependencies or configuration unnecessarily.

Do not use `npm audit fix --force` automatically. Review the reported vulnerabilities, check whether affected packages are direct or transitive dependencies, and apply compatible fixes without blindly upgrading the React Native toolchain.

---

## 20. Development workflow and instructions

Work in small, verifiable phases.

### Phase 1: Inspect and stabilize

- Inspect the existing project.
- Check the dependency installation.
- Review `package.json`.
- Check Android SDK and NDK configuration.
- Repair the existing Android build issue.
- Run the original starter application.
- Record the actual working state.

### Phase 2: Establish the foundation

- Organize the source code.
- Set up the design theme.
- Add compatible icons.
- Configure navigation.
- Build reusable components.
- Establish error handling and API configuration.

### Phase 3: Build the backend

- Configure Express and TypeScript.
- Connect Neon PostgreSQL.
- Create database migrations.
- Implement authentication and authorization.
- Implement product and category APIs.
- Test the APIs before connecting every mobile screen.

### Phase 4: Implement customer shopping

- Authentication
- Home and catalogue
- Categories and search
- Product details
- Shopping cart
- Addresses
- Checkout
- WhatsApp payment contact
- Orders and order history
- Customer profile

### Phase 5: Implement the seller system

- Protected seller access
- Product and category management
- Order management
- Payment review and verification
- Order-status management
- Reports based on real database data

### Phase 6: Complete and test

- English and Kinyarwanda translations
- Loading, empty, and error states
- Security checks
- Automated and integration tests
- Android device testing
- Deployment configuration
- Documentation
- APK/AAB preparation

Do not attempt to implement every phase in one uncontrolled change.

For each phase:

1. Inspect the relevant existing files.
2. Explain the intended changes briefly.
3. Implement the changes.
4. Run suitable checks.
5. Report what passed and what failed.
6. List any manual configuration still required.
7. Proceed to the next phase when the current phase is stable.

Never claim that a feature works unless it has been implemented and appropriately tested.

---

## 21. Final deliverables

The completed project should include:

- A working React Native CLI mobile application
- A Node.js/Express backend
- A connected PostgreSQL database
- Database migrations and setup instructions
- Secure customer authentication
- Protected seller functions
- A real product catalogue
- Cart and checkout
- WhatsApp-based payment coordination
- Verified payment status management
- Order management
- English and Kinyarwanda support
- Consistent green, orange, and white styling
- Real vector icons rather than emoji interface icons
- No production mock data
- API documentation
- Environment configuration examples
- Testing instructions
- Setup and deployment documentation
- Instructions for generating an Android APK and AAB

## 22. Start here

**Begin by inspecting the existing `C:\Users\user\Desktop\DGEcommerce` project. Do not create a new project.**

First, verify the existing setup and help me resolve the known Android NDK problem. Then run the starter application successfully.

After that, continue with Phase 2 and build the D&G e-commerce application progressively.

Preserve working code, use compatible dependencies, maintain the established brand identity, and prioritize security, real data, and reliable functionality over visual demonstrations.

If a decision requires information that is genuinely unavailable, ask one clear question. Otherwise, choose a sensible, secure default and explain it briefly.

Your goal is a real, maintainable e-commerce system, not merely a visual prototype.