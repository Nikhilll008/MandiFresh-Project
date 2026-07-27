# 🌾 MandiFresh - Agri Mandi Price Tracker & Farmer Profit Calculator

MandiFresh is a web-based AgriTech platform that helps farmers, traders, and agricultural businesses monitor mandi prices, compare crop rates, and calculate farming profits. The system provides a simple dashboard for viewing crop information and estimating profit based on production cost and selling price.

---

## 📌 Project Overview

The objective of this project is to digitalize agricultural market information by providing an easy-to-use platform where users can:

- View mandi crop prices
- Track agricultural products
- Calculate estimated farming profit
- Access data through REST APIs
- Manage crop-related information efficiently

---

## ✨ Features

- 🌱 Crop Management
- 📈 Mandi Price Tracking
- 💰 Farmer Profit Calculator
- 📊 Dashboard APIs
- 🔍 RESTful API Architecture
- 📱 Responsive User Interface
- 🗄️ MySQL Database Integration
- ⚡ Fast and Lightweight Backend

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- Responsive Design

### Backend
- PHP 8+
- CodeIgniter 4 (MVC Framework)

### Database
- MySQL

### Tools
- VS Code
- XAMPP
- Composer
- Git
- GitHub

---

## 📂 Project Structure

```
MANDIFRESH
│
├── backend
│   ├── mandifresh-ci4
│   │   ├── app
│   │   ├── public
│   │   ├── tests
│   │   ├── writable
│   │   ├── composer.json
│   │   └── spark
│   │
│   └── database
│
├── css
├── js
├── index.html
├── prices.html
├── calculator.html
├── about.html
└── README.md
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Nikhilll008/MandiFresh-Project.git
```

---

## 2️⃣ Open Project

```bash
cd MandiFresh-Project/backend/mandifresh-ci4
```

---

## 3️⃣ Install Dependencies

```bash
composer install
```

---

## 4️⃣ Configure Environment

Copy

```
env
```

to

```
.env
```

Update database credentials:

```env
database.default.hostname = localhost
database.default.database = mandifresh
database.default.username = root
database.default.password =
database.default.DBDriver = MySQLi
```

---

## 5️⃣ Import Database

Open

```
http://localhost/phpmyadmin
```

Create Database

```
mandifresh
```

Import the SQL file located in

```
backend/database/
```

---

## 6️⃣ Run Backend

```bash
php spark serve
```

Backend URL

```
http://localhost:8080
```

---

## 7️⃣ Run Frontend

Open

```
index.html
```

using Live Server.

Example

```
http://127.0.0.1:5500
```

---

# 📡 REST APIs

| Method | Endpoint | Description |
|----------|---------------------------|----------------------------|
| GET | /api/dashboard | Dashboard Information |
| GET | /api/crops | List All Crops |
| GET | /api/prices | Get Mandi Prices |
| GET | /api/mandis | List Available Mandis |
| POST | /api/profit/calculate | Calculate Farmer Profit |

---

# 🗄 Database Tables

- crops
- mandi_prices
- profit_calculations

---

# 📸 Screenshots

### Home Page

(Add Screenshot Here)

---

### Crop Prices

(Add Screenshot Here)

---

### Profit Calculator

(Add Screenshot Here)

---

## Future Enhancements

- 🔴 Live Government Mandi API Integration
- 📱 Android Application
- 🤖 AI-based Crop Price Prediction
- ☁ Cloud Deployment
- 🔔 Price Alert Notifications
- 📍 Nearby Mandi Locator
- 📊 Price Analytics Dashboard

---

# 👨‍💻 Developed By

**Nikhil Patil**

MCA Student

Frontend Developer | PHP Developer | CodeIgniter Developer

---

# 📜 License

This project is developed for educational and learning purposes.

---

## ⭐ Support

If you like this project, don't forget to ⭐ star the repository.
