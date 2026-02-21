# EM Blogs
**A Premium Editorial Publishing Platform**

🔗 Live Demo: [em-blogs.vercel.app](https://em-blogs.vercel.app/)

EM Blogs is a handcrafted digital space designed for personal storytelling and thoughtful insights. Built with a minimalist, high-end "Journal" aesthetic inspired by Medium.com, it provides writers with a cinematic platform to preserve their legacy and share their journeys with the world.

## ✨ Features

### 🎨 Immersive Editorial Design
A platform-first interface featuring boutique typography, generous whitespace, and a spacious layout that lets your words breathe.

### 🖼️ Cinematic Article Cards
Large, widescreen cover images with cinematic hover animations, soft "paper" borders, and high-contrast editorial typography.

### 🧭 Dynamic Discovery
Sticky category navigation allows users to explore the journal through specific lenses like Design, Technology, Philosophy, and More.

### ✍️ Boutique Professional Journals
Personalized profile pages that act as a curated portfolio of your writings, elegantly grouped by topics and filtered keywords.

### 📚 Personalized Library
A dedicated bookmarking system ("Library") that allows readers to save their favorite insights for later reading.

### 🔒 Secure Authentication
User accounts protected with JWT (JSON Web Tokens) and secure password hashing, with dedicated role-based access for Administrators.

### 📱 Fully Responsive UI
A handcrafted experience built with Tailwind CSS (v4), ensuring the journal looks stunning on desktops, tablets, and phones alike.

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Purpose |
| :--- | :--- |
| **React (v19)** | UI Framework |
| **Vite** | Fast Build Tool |
| **Tailwind CSS (v4)** | Modern Styling |
| **React Router** | Client-side Routing |
| **Axios** | API Communication |
| **date-fns** | Elegant Date Formatting |
| **React Icons** | Premium Iconography |
| **React Quill** | Rich Text Editing |
| **React Hot Toast** | Fluid Notifications |

### Backend (Server)
| Technology | Purpose |
| :--- | :--- |
| **Node.js + Express** | Server Engine & API |
| **MongoDB + Mongoose** | Document Database & Modeling |
| **JWT + Bcrypt** | Security & Authentication |
| **Multer** | Media & File Uploads |
| **Slugify** | SEO-friendly URL Generation |

---

## 🚀 Getting Started

### 🔹 Prerequisites
*   **Node.js** (v18+)
*   **MongoDB Atlas** or local MongoDB instance

### 🔹 1. Clone the Repository
```bash
git clone https://github.com/kodurusravani34/EM-Blogs.git
cd EM-Blogs
```

### 🔹 2. Setup Backend (Server)
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Admin Credentials for Initial Seeding
ADMIN_EMAIL=your_email
ADMIN_PASSWORD=your_password
```
Run the backend:
```bash
npm start
```

### 🔹 3. Setup Frontend (Client)
```bash
cd ../client
npm install
```
Create a `.env` file in the `client/` directory:
```text
VITE_API_URL=http://localhost:5000
```
Run the frontend:
```bash
npm run dev
```

### 🔹 4. Open the App
Visit: `http://localhost:5173`

---

## 📂 Project Structure

```text
EM-Blogs/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI & Layout components
│   │   ├── pages/          # Application views
│   │   ├── services/       # API integration
│   │   ├── context/        # Auth states
│   │   ├── config.js       # Global settings
│   │   └── index.css       # Design System
│
└── server/                 # Express backend
    ├── middleware/         # Auth & Upload helpers
    ├── models/             # Mongoose Schemas
    ├── routes/             # API Endpoints
    ├── uploads/            # Local media storage
    ├── seed.js             # Initial Admin setup
    └── server.js           # Main Entry Point
```

---

## 🔌 API Endpoints (Base: `/api`)

### Authentication
*   `POST /auth/register` - Create a new account
*   `POST /auth/login` - Standard login
*   `GET /auth/me` - Get current session user
*   `PUT /auth/profile` - Update profile & avatar

### Articles
*   `GET /articles` - Fetch all published stories (paginated)
*   `GET /articles/slug/:slug` - Get article by URL slug
*   `POST /articles` - Create new story (requires Auth)
*   `PUT /articles/:id` - Edit story
*   `DELETE /articles/:id` - Remove story
*   `POST /articles/:id/like` - Toggle appreciation

### Bookmarks & Comments
*   `GET /bookmarks` - View your library
*   `POST /bookmarks/toggle` - Save/unsave story
*   `GET /comments/article/:id` - Fetch discussion thread
*   `POST /comments` - Submit feedback

---

## 🔐 Security
*   **JWT-based authentication**: Secure sessions for all signed-in users.
*   **Encrypted Storage**: Passwords never stored in plain text.
*   **Protected Routes**: Administrative features and writing tools locked behind middleware.

---

## 🤝 Contributing
Suggestions and improvements are always welcome. Feel free to fork and submit a Pull Request!

## 📄 License
Licensed under the **ISC License**.
