# 🍳 KitchenSathi

> Your Smart Kitchen Companion - Reduce Food Waste, Plan Better, Eat Healthier

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**KitchenSathi** is a comprehensive kitchen management application designed to help users reduce food waste, plan meals efficiently, and track their nutritional intake. The platform combines smart grocery management with AI-powered recipe suggestions and personalized meal planning to create a seamless cooking experience.

### 🎯 Problem Statement

- **Food Waste**: Millions of tons of food are wasted annually due to poor tracking and planning
- **Meal Planning Chaos**: Lack of organized meal planning leads to unhealthy eating habits
- **Recipe Discovery**: Difficulty finding recipes based on available ingredients
- **Health Tracking**: No easy way to monitor calorie consumption and nutritional goals

### 💡 Solution

KitchenSathi addresses these challenges by providing:
- **Smart Grocery Tracking**: Monitor expiry dates with automated alerts
- **AI Recipe Suggestions**: Get personalized recipes based on your pantry
- **Meal Planning**: Plan your week ahead with an intuitive calendar interface
- **Calorie Analytics**: Track your daily calorie consumption vs. recommendations
- **Savings Calculator**: See how much money you save by reducing waste

### 👥 Target Audience

- Health-conscious individuals
- Busy professionals seeking meal planning efficiency
- Families looking to reduce food waste
- Cooking enthusiasts exploring new recipes
- Budget-conscious shoppers

---

## ✨ Key Features

### 🔐 1. User Authentication & Profile Management
- Secure registration with email verification
- JWT-based authentication
- Password reset functionality
- Customizable user profiles with avatars
- Preference management (notifications, theme, privacy)

### 🛒 2. Smart Grocery Management
- Add, edit, and delete grocery items
- Track item status (Pending → Bought → Consumed)
- Set expiry dates with automated reminders
- Price tracking for savings calculation
- Real-time notifications for expiring items
- Email alerts for items expiring soon

### 🍳 3. AI-Powered Recipe Suggestions
- Integration with Edamam Recipe API
- Search recipes by ingredients, cuisine, or dietary preferences
- Detailed recipe information (ingredients, instructions, nutrition)
- Filter by dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Save favorite recipes

### 📝 4. Personal Recipe Management
- Create and store your own recipes
- Upload recipe images (Cloudinary integration)
- Organize ingredients and cooking steps
- Rate your recipes (1-5 stars)
- Print-friendly recipe view
- Share recipes with other users

### 🤝 5. Recipe Sharing System
- Share recipes with specific users via email
- Accept or reject shared recipes
- View shared recipes from others
- Add shared recipes to your meal planner
- Real-time notifications for sharing activities

### 📅 6. Weekly Meal Planner
- Visual calendar interface (Monday-Sunday)
- Add meals for breakfast, lunch, dinner, and snacks
- Drag-and-drop meal organization
- Integration with personal and shared recipes
- Mark meals as consumed for calorie tracking
- Add ingredients from planned meals to grocery list

### 📊 7. Kitchen Analytics Dashboard
- Total items tracked
- Waste prevention rate
- Most frequently bought items
- Estimated savings calculation (based on actual prices)
- Visual data representation with charts

### 🔥 8. Calorie Consumption Tracker
- BMR-based calorie recommendations (Mifflin-St Jeor formula)
- Weekly calorie consumption tracking
- Visual comparison: Consumed vs. Recommended
- Daily status indicators (Good/Over/Under)
- Recharts-powered interactive graphs
- Automatic tracking from meal planner

### 🔔 9. Real-Time Notification System
- In-app notifications with badge counter
- Email notifications for critical alerts
- Notification types:
  - Grocery expiry alerts
  - Recipe sharing notifications
  - Share acceptance/rejection
  - Meal plan reminders
- Mark as read/delete functionality
- Customizable notification preferences

### 💰 10. Savings Tracker
- Track actual grocery prices
- Calculate savings from items used before expiry
- Visual savings dashboard
- Historical savings data

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **Heroicons** - Icon library
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Zod** - Schema validation

### External Services
- **Edamam Recipe API** - Recipe data and nutrition information
- **Cloudinary** - Image storage and optimization
- **Nodemailer** - Email service (Gmail SMTP)
- **Node-cron** - Scheduled tasks for expiry checks

### Development Tools
- **VSCode / Cursor** - Code editor
- **Git** - Version control
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kitchensathi.git
   cd kitchensathi
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/kitchensathi
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kitchensathi

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

   # Edamam API (Get from https://developer.edamam.com/)
   EDAMAM_APP_ID=your_edamam_app_id
   EDAMAM_APP_KEY=your_edamam_app_key

   # Cloudinary (Get from https://cloudinary.com/)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Service (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   # Note: Use App Password, not regular Gmail password
   # Generate at: https://myaccount.google.com/apppasswords

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:5173
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the Application**

   **Backend** (from `backend` directory):
   ```bash
   npm run dev
   ```

   **Frontend** (from `frontend` directory):
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred static server
```

---

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Analytics.tsx           # Kitchen analytics dashboard
│   │   ├── CalorieAnalytics.tsx    # Calorie tracking page
│   │   ├── AnalyticsHub.tsx        # Analytics selection hub
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── GroceryLists/          # Grocery management components
│   │   ├── MealPlanner.tsx        # Weekly meal planner
│   │   ├── MyRecipes.tsx          # Personal recipes page
│   │   ├── SharedRecipes.tsx      # Shared recipes page
│   │   ├── NotificationBell.tsx   # Notification component
│   │   ├── ProfileModal.tsx       # User profile management
│   │   └── ...
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx        # Authentication state
│   ├── hooks/             # Custom React hooks
│   │   └── useToast.ts           # Toast notifications
│   ├── lib/               # API clients and utilities
│   │   ├── api.ts                # Core API client
│   │   ├── groceriesApi.ts       # Grocery endpoints
│   │   ├── userRecipesApi.ts     # Recipe endpoints
│   │   ├── mealPlanApi.ts        # Meal planner endpoints
│   │   ├── analyticsApi.ts       # Analytics endpoints
│   │   ├── calorieAnalyticsApi.ts # Calorie tracking endpoints
│   │   └── notificationsApi.ts   # Notification endpoints
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind configuration
└── vite.config.ts         # Vite configuration
```

### Backend Structure
```
backend/
├── src/
│   ├── models/            # Mongoose schemas
│   │   ├── User.ts               # User model
│   │   ├── GroceryItem.ts        # Grocery model
│   │   ├── UserRecipe.ts         # Recipe model
│   │   ├── SharedRecipe.ts       # Shared recipe model
│   │   ├── MealPlan.ts           # Meal plan model
│   │   ├── MealConsumption.ts    # Calorie tracking model
│   │   └── Notification.ts       # Notification model
│   ├── routes/            # API routes
│   │   ├── auth.ts               # Authentication routes
│   │   ├── groceries.ts          # Grocery CRUD routes
│   │   ├── userRecipes.ts        # Recipe CRUD routes
│   │   ├── sharedRecipes.ts      # Recipe sharing routes
│   │   ├── mealPlans.ts          # Meal planner routes
│   │   ├── analytics.ts          # Kitchen analytics routes
│   │   ├── calorieAnalytics.ts   # Calorie analytics routes
│   │   ├── notifications.ts      # Notification routes
│   │   ├── profile.ts            # User profile routes
│   │   └── index.ts              # Route aggregator
│   ├── services/          # Business logic
│   │   ├── NotificationService.ts      # Notification creation
│   │   ├── groceryExpiryService.ts     # Expiry checking (cron)
│   │   ├── emailService.ts             # Email sending
│   │   ├── calorieCalculator.ts        # BMR calculations
│   │   └── edamamService.ts            # Recipe API integration
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts               # JWT verification
│   │   └── upload.ts             # Multer file upload
│   ├── utils/             # Utility functions
│   │   └── cloudinary.ts         # Cloudinary config
│   └── index.ts           # Server entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## 📚 API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Reference

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/me` - Get current user

#### Grocery Endpoints
- `GET /api/groceries` - Get all groceries
- `POST /api/groceries` - Create grocery item
- `PATCH /api/groceries/:id` - Update grocery item
- `DELETE /api/groceries/:id` - Delete grocery item
- `POST /api/groceries/:id/mark-completed` - Mark as bought
- `POST /api/groceries/:id/mark-used` - Mark as consumed

#### Recipe Endpoints
- `GET /api/user-recipes` - Get user's recipes
- `POST /api/user-recipes` - Create recipe
- `GET /api/user-recipes/:id` - Get recipe details
- `PUT /api/user-recipes/:id` - Update recipe
- `DELETE /api/user-recipes/:id` - Delete recipe

#### Meal Planner Endpoints
- `GET /api/meal-plans` - Get meal plans for date range
- `POST /api/meal-plans` - Create meal plan entry
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan
- `POST /api/meal-plans/consume` - Record meal consumption

#### Analytics Endpoints
- `GET /api/analytics/summary` - Get kitchen analytics
- `GET /api/analytics/weekly-calories` - Get calorie analytics

#### Notification Endpoints
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/landing-page.png)
*Modern landing page with feature highlights*

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Centralized dashboard with quick actions*

### Grocery List Management
![Grocery List](./screenshots/grocery-list.png)
*Track groceries with expiry dates and prices*

### Recipe Suggestions
![Recipe Suggestions](./screenshots/recipe-suggestions.png)
*AI-powered recipe recommendations*

### Meal Planner
![Meal Planner](./screenshots/meal-planner.png)
*Visual weekly meal planning calendar*

### Calorie Analytics
![Calorie Analytics](./screenshots/calorie-analytics.png)
*Track calorie consumption vs. recommendations*

### Kitchen Analytics
![Kitchen Analytics](./screenshots/kitchen-analytics.png)
*Comprehensive kitchen usage statistics*

---

## 🔮 Future Enhancements

### Features
- [ ] Mobile app (React Native)
- [ ] Barcode scanner for grocery items
- [ ] Voice commands for hands-free operation
- [ ] Social features (follow users, recipe feeds)
- [ ] Meal prep suggestions based on time availability
- [ ] Integration with smart home devices
- [ ] Grocery price comparison across stores
- [ ] Recipe video tutorials
- [ ] Nutritionist consultation booking
- [ ] Family account sharing

### Technical Improvements
- [ ] Implement Redis caching for API responses
- [ ] Add GraphQL API option
- [ ] Implement WebSocket for real-time updates
- [ ] Add comprehensive unit and integration tests
- [ ] Implement CI/CD pipeline
- [ ] Add Docker containerization
- [ ] Implement microservices architecture
- [ ] Add Elasticsearch for advanced recipe search
- [ ] Implement rate limiting and API throttling
- [ ] Add comprehensive logging and monitoring

### UI/UX Enhancements
- [ ] Dark mode support
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Progressive Web App (PWA) features
- [ ] Offline mode support
- [ ] Multi-language support (i18n)
- [ ] Customizable themes
- [ ] Advanced data visualization
- [ ] Onboarding tutorial for new users

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Follow TypeScript best practices
- Use meaningful variable and function names
- Write comments for complex logic
- Ensure all tests pass before submitting PR
- Follow the existing code structure

---

## 📧 Contact

**Developer**: Riya

- Email: riyarajawat212@gmail.com
- LinkedIn: 

---

## 🙏 Acknowledgments

- [Edamam API](https://www.edamam.com/) for recipe data
- [Cloudinary](https://cloudinary.com/) for image hosting
- [Heroicons](https://heroicons.com/) for beautiful icons
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

---

<div align="center">
  <p>Made with ❤️ by Your Riya</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
