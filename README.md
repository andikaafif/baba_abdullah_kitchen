# Dapoer Baba Abdullah
# PWA Requirements Documentation

Version: 1.0
Platform: Progressive Web App (PWA)

---

# 1. Overview

Develop a Progressive Web Application (PWA) for **Dapoer Baba Abdullah**, a dim sum ordering application.

The application should allow customers to:

- Browse the available dim sum menu.
- Select products.
- Adjust quantities.
- View cart.
- Enter customer information.
- Checkout.
- Automatically generate an order receipt.
- Send the order directly to WhatsApp.

The application must follow **Google Material Design 3 (Material You)** guidelines and be fully responsive.

---

# 2. Primary Goals

The ordering process should be as simple as possible.

Target completion:

Home
→ Choose Menu
→ Cart
→ Customer Information
→ Checkout
→ WhatsApp opens
→ Admin receives formatted order.

No login required.

---

# 3. Target Users

- Walk-in customers
- Returning customers
- Mobile users
- Tablet users
- Desktop users

---

# 4. Technology Stack

Frontend

- React 19+
- TypeScript
- Vite

UI

- Material UI (MUI v7)
- Material Design 3
- Material Icons

State

- Zustand

Forms

- React Hook Form

Validation

- Zod

PWA

- vite-plugin-pwa

Storage

- LocalStorage

PDF

- pdf-lib
or
- jsPDF

Image Export

- html-to-image

Deployment

- Vercel
or
- Firebase Hosting

---

# 5. Branding

Business Name

Dapoer Baba Abdullah

Theme

Warm
Premium
Modern

Primary Color

#8B4513

Secondary

#D4A373

Accent

#F6C453

Background

#FFF8F0

Surface

#FFFFFF

Typography

Google Font:

- Poppins

Buttons

Rounded

16px radius

Cards

Large rounded corners

Subtle shadow

---

# 6. Responsive Design

Support:

320px

375px

425px

768px

1024px

1440px

Desktop

Tablet

Mobile

---

# 7. PWA Features

Must support:

✔ Installable

✔ Offline menu cache

✔ Splash Screen

✔ App Icon

✔ Service Worker

✔ Manifest

✔ Add to Home Screen

---

# 8. Navigation

Bottom Navigation (Mobile)

- Home
- Menu
- Cart

Desktop

Top App Bar

---

# 9. Home Page

Contains:

Hero Banner

Business Logo

Short Description

Featured Menu

Benefits

Example:

Fresh Every Day

100% Homemade

No MSG

Kids Friendly

Made With Love

CTA

Order Now

---

# 10. Menu Page

Display every menu as Material Cards.

Each card contains:

Image

Name

Description

Price

Quantity Selector

Add Button

Search Bar

Category Filter

Sticky Cart Button

---

# 11. Menu Data

## Kukus Original

Small (5 pcs)

Rp25.000

Regular (6 pcs)

Rp28.000

Medium (10 pcs)

Rp43.000

Family Pack (12 pcs)

Rp58.000

---

## Mentai Regular

Medium (6 pcs)

Rp34.000

Family Pack (12 pcs)

Rp60.000

---

## Mentai Mix Original

Medium (6 pcs)

Rp45.000

Family Pack (12 pcs)

Rp58.000

---

## Cheese Cheddar

Small (4 pcs)

Rp31.000

Medium (6 pcs)

Rp40.000

Family Pack (12 pcs)

Rp63.000

---

## Cheese Cheddar Mix Mentai

Medium (6 pcs)

Rp45.000

Family Pack (12 pcs)

Rp65.000

---

## Frozen

10 pcs

Rp44.000

20 pcs

Rp80.000

---

# 12. Cart

Material Bottom Sheet

Show:

Product

Qty

Price

Subtotal

Grand Total

Buttons

Continue Shopping

Checkout

Swipe to dismiss

---

# 13. Checkout

Customer Information

Required:

Customer Name

Phone Number

Address

Optional:

Notes

Delivery Method

Pickup

Delivery

Payment

Cash

Transfer

QRIS

---

# 14. Order Summary

Display:

Products

Qty

Price

Subtotal

Total

Customer Information

Payment Method

Notes

---

# 15. Receipt Generation

When customer clicks

"Place Order"

Automatically generate:

Option A

PDF Receipt

Option B

PNG Receipt

Receipt contains:

Dapoer Baba Abdullah

Order Number

Date

Customer

Address

Phone

Ordered Items

Qty

Unit Price

Subtotal

Grand Total

Notes

Thank You Message

QR Code (optional)

Filename:

ORDER-YYYYMMDD-HHMM.pdf

---

# 16. WhatsApp Integration

Admin Number

+62 822-6007-0364

After checkout:

Automatically open WhatsApp using:

https://wa.me/6282260070364?text=

Message example:

--------------------------------

Assalamu'alaikum Dapoer Baba Abdullah

Saya ingin memesan:

• Kukus Original Medium x2
Rp43.000

• Mentai Regular x1
Rp34.000

----------------

Subtotal
Rp120.000

Total
Rp120.000

Nama

John

Alamat

Jl....

Pembayaran

QRIS

Catatan

Pedas sedang

Terima kasih.

--------------------------------

Include:

- Receipt summary
- Total
- Customer data

The generated PDF/PNG should automatically download before WhatsApp opens so the customer can attach it manually if desired.

---

# 17. Order Number

Format

BAK-YYYYMMDD-XXXX

Example

BAK-20260801-0045

Generated locally.

---

# 18. Animations

Material Motion

Card Elevation

Ripple Effect

FAB Animation

Bottom Sheet Animation

Snackbar

Loading Indicator

Skeleton Loading

---

# 19. Accessibility

Support:

Dark Mode

High Contrast

Keyboard Navigation

ARIA Labels

Minimum touch target 48x48dp

WCAG AA compliance

---

# 20. Performance

Lighthouse Score

Performance > 95

Accessibility > 95

Best Practices > 95

SEO > 95

PWA > 100

---

# 21. Error Handling

Offline mode

Empty cart

Network failure

Invalid phone number

Validation messages

Snackbar notifications

---

# 22. Future Features

Favorite Menu

Promo Voucher

Loyalty Points

Order History

Multi-language

Admin Dashboard

Inventory

Payment Gateway

Push Notifications

Customer Reviews

---

# 23. UI Components

Material 3 Components

- Top App Bar
- Bottom Navigation
- Navigation Drawer
- Navigation Rail
- Cards
- Chips
- Buttons
- FAB
- Dialog
- Snackbar
- Bottom Sheet
- Badge
- Progress Indicator
- Search Bar
- Divider
- Tabs
- List
- Avatar
- TextField
- IconButton

---

# 24. Icons

Material Symbols Rounded

Examples

restaurant

shopping_cart

home

favorite

payments

delivery_dining

local_shipping

receipt

phone

location_on

person

---

# 25. Folder Structure

```
src/
    assets/
    components/
        menu/
        cart/
        checkout/
        receipt/
    pages/
        Home/
        Menu/
        Cart/
        Checkout/
    hooks/
    services/
    store/
    utils/
    types/
    data/
    theme/
    routes/
```

---

# 26. Success Criteria

The application is considered complete when:

- Fully installable as a PWA.
- Works offline for browsing the menu.
- Customers can browse all menu items.
- Customers can add, update, and remove items from the cart.
- Checkout validates required customer information.
- Generates a professional PDF or PNG receipt before completing the order.
- Opens WhatsApp with a pre-filled order message addressed to **+62 822-6007-0364**.
- UI fully adheres to Google Material Design 3 guidelines.
- Responsive across mobile, tablet, and desktop devices.
- Achieves Lighthouse scores of 95+ for Performance, Accessibility, Best Practices, and SEO, with a PWA score of 100.
