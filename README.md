# 🍱 Digital Canteen

Welcome to the **Digital Canteen**! This is a premium, full-stack web application built to modernize cafeteria and canteen ordering systems. Featuring a stunning Glassmorphism UI, real-time order tracking, comprehensive admin controls, payment integration, and Google OAuth.

---

## ✨ Features

### 🍔 For Users
* **Dynamic Menu & Cart:** Browse categorized menus (Breakfast, Lunch, Snacks, Dinner) with quick "Add to Cart" functionality.
* **Your Plate Builder:** Custom-build your meals (e.g., Rice + 2 Curries + Sweet) with enforced selection limits.
* **Smart Meal Timings:** The cart automatically enforces meal timing rules (e.g., preventing checkout of Lunch items during Breakfast hours), while still allowing seamless browsing.
* **Razorpay Payment Integration:** Secure and integrated checkout flow with Razorpay digital payments.
* **User Profile Registration:** Enhanced profile flow collecting Roll Number, Semester, Department, and User Type (Student vs. Faculty).
* **Live Order Tracking:** See your order status update in real-time (`PENDING` ➡️ `COOKING` ➡️ `READY` ➡️ `COMPLETED`).
* **Order Cancellation:** Cancel pending orders directly from your dashboard before preparation starts.
* **Interactive Reviews:** Rate and review completed orders. Users can delete their reviews to write a new one, which resets the state dynamically.
* **Complaints Portal:** Submit issues with description text and optional image attachments, and receive direct replies from canteen administrators.

### 🛡️ For Admins (Management Portal)
* **Live Kanban Board:** Manage incoming orders in real-time. Move cards through stages with a single click.
* **Linked Order Modals in Complaints:** Clicking on a linked order ID inside the Complaints list instantly opens a full Order Details modal (identical to the Analytics view) for rapid issue resolution.
* **Dynamic Plate Category Builder:** Manage custom sub-categories (e.g., Rice, Curry, Sweet) dynamically for the "Your Plate" builder with real-time add, edit, and delete functionality.
* **Inventory & Menu Control:** Instantly toggle item availability, update pricing, select classification via toggle buttons (Veg/Non-Veg), and manage stock levels.
* **Users Directory & Management:** Search, view, and manage all users. Perform soft-deletions of user accounts that safely preserve historical orders for bookkeeping.
* **Dynamic Hero Banners:** Update the user homepage hero banners instantly via a built-in CMS.
* **Meal Timing Overrides:** Set automated schedules for breakfast, lunch, snacks, and dinner, or manually force a category open/closed during emergencies.
* **Revenue Analytics:** Track daily revenue, total orders, and popular items via the Analytics Dashboard.
* **Sidebar Hover Tooltips:** User-friendly navigation with hover tooltips when the admin sidebar is collapsed.

---

## 🛠️ Technology Stack

* **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), Vanilla CSS (Custom Glassmorphism Design System)
* **Backend:** Next.js Server Actions & API Routes
* **Database:** SQLite managed via [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [NextAuth.js v5](https://next-auth.js.org/) (Google Provider + Credentials Provider)
* **Payment Processing:** [Razorpay API](https://razorpay.com/)

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
Create a `.env` file in the root directory and add your Google OAuth credentials, Razorpay credentials, and a standard Auth Secret:
```env
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your_super_secret_string_here"

# Google Cloud OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Razorpay Credentials
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### 4. Database Setup & Seeding
Push the Prisma schema to your local SQLite database:
```bash
npx prisma db push
```

> [!WARNING]
> Do not run `npx prisma db seed` on a database with active order history as it will reset standard menu items.

### 5. Start the Development Server
Since PowerShell script execution policy may block `.ps1` wrapper files, run with `.cmd`:
```bash
npm.cmd run dev
```
*(Or `npm run dev` in command prompts or terminals where execution policy allows script execution).*

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application!

---

## 👤 Test Accounts

If you prefer to test via standard login instead of Google OAuth, the database supports preconfigured login credentials:

**Standard User:**
* **Username:** `student1`
* **Password:** `password123`

**Admin User (Full Access):**
* **Username:** `admin1`
* **Password:** `adminpassword123`

---

*Designed and Built for the Future of Campus Dining.*
