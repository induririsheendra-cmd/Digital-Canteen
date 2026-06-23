# 🍱 Digital Canteen

Welcome to the **Digital Canteen**! This is a premium, full-stack web application built to modernize cafeteria and canteen ordering systems. Featuring a stunning Glassmorphism UI, real-time order tracking, comprehensive admin controls, and Google OAuth integration.

---

## ✨ Features

### 🍔 For Users
* **Dynamic Menu & Cart:** Browse categorized menus (Breakfast, Lunch, Snacks, Dinner) with quick "Add to Cart" functionality.
* **Your Plate Builder:** Custom-build your meals (e.g., Rice + 2 Curries + Sweet) with enforced selection limits.
* **Smart Meal Timings:** The cart automatically strictly enforces meal timing rules (e.g., preventing checkout of Lunch items during Breakfast hours), while still allowing seamless browsing.
* **Live Order Tracking:** See your order move from "Pending" ➡️ "Cooking" ➡️ "Ready!" right from your dashboard.
* **Complaints Portal:** Easily submit issues with photo attachments and receive direct admin replies.
* **Google OAuth:** Secure, one-click login using Google accounts.

### 🛡️ For Admins (Management Portal)
* **Live Kanban Board:** Manage incoming orders in real-time. Move cards through stages with a single click.
* **Inventory & Menu Control:** Instantly toggle item availability, update pricing, and manage stock thresholds.
* **Dynamic Hero Banners:** Update the user home page banners instantly via a built-in CMS.
* **Meal Timing Overrides:** Set automated schedules for meals or manually force a category open/closed during emergencies.
* **Revenue Analytics:** Track daily revenue, total orders, and popular items via the Analytics Dashboard.

---

## 🛠️ Technology Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React, Vanilla CSS (Custom Glassmorphism Design System)
* **Backend:** Next.js Server Actions & API Routes
* **Database:** SQLite managed via [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google Provider + Credentials)

---

## 🚀 Getting Started

Follow these steps to run the Digital Canteen locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/induririsheendra-cmd/Digital-Canteen.git
cd Digital-Canteen
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Google OAuth credentials and a standard Auth Secret:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_string_here"

# Get these from the Google Cloud Console
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 4. Database Setup & Seeding
Push the Prisma schema to your local SQLite database and populate it with initial menu items:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application!

---

## 👤 Test Accounts

If you prefer to test via standard login instead of Google OAuth, the database is seeded with two default accounts:

**Standard User:**
* **Username:** `student1`
* **Password:** `password123`

**Admin User (Full Access):**
* **Username:** `admin1`
* **Password:** `adminpassword123`

---

*Designed and Built for the Future of Campus Dining.*
