# 🚀 Shopwave – E-commerce Intelligence Platform

**Team Name:** Klyzer

---

## 📌 Overview

Shopwave is a full-stack data analytics and machine learning platform designed to help e-commerce businesses understand their sales performance, identify trends, and predict future revenue.

The system transforms raw transaction data into meaningful insights using data science, interactive dashboards, and predictive analytics.

---

## 🎯 Problem Statement

E-commerce companies often face fluctuations in sales but lack clarity on:

* Which product categories generate the most revenue
* Which time periods drive higher sales
* Seasonal buying patterns
* Reasons behind revenue changes

---

## 💡 Solution

Shopwave provides:

* 📊 Sales trend analysis
* 🛒 Category performance insights
* 📈 Machine learning-based sales forecasting
* 🤖 AI-generated insights
* 📉 Interactive dashboard with filters

---

## 🛠 Tech Stack

### Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Recharts

### Backend

* Next.js API Routes
* Node.js

### Data Science

* Python
* Pandas
* NumPy
* Scikit-learn
* Matplotlib

### Deployment

* Docker (Dockerfile + docker-compose)
* AWS / Azure ready

---

## 📊 Features

### 🔹 Dashboard

* KPI cards (Revenue, Orders, AOV)
* Sales trend chart
* Category performance
* Filters (date + category)
* CSV download
* AI Insights (auto-generated)

### 🔹 Categories Page

* Revenue by category (bar chart)
* Revenue share (pie chart)
* Category insights

### 🔹 Products Page

* Top products table
* Search functionality
* Sorting by revenue

### 🔹 Predictions Page

* 30-day sales forecast
* ML-based prediction (Random Forest)
* Summary metrics

---

## 🤖 Machine Learning

* Model: Random Forest Regressor
* Input: Historical daily revenue
* Output: Next 30 days revenue prediction

---

## 📂 Project Structure

```
shopwave/
│
├── frontend/
├── backend/
├── ml/
├── scripts/
├── data/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone <repo-url>
cd shopwave
```

### 2. Install Frontend

```
cd frontend
npm install
npm run dev
```

### 3. Run Python Scripts

```
pip install -r requirements.txt
python scripts/generate_dataset.py
python ml/train_model.py
python ml/predict_sales.py
```

---

## 🌐 API Endpoints

* `/api/sales-summary`
* `/api/category-performance`
* `/api/sales-trends`
* `/api/top-products`
* `/api/predictions`

---

## 🚀 Deployment

* Docker supported
* Can be deployed on:

  * AWS
  * Azure
  * Vercel

---

## 📈 Key Highlights

* End-to-end full-stack project
* Data science + ML integration
* Real-time analytics dashboard
* AI-generated insights
* Clean UI (SaaS style)

---

## 👨‍💻 Team Klyzer

* Kishore – Full Stack & Deployment
* Dinesh – Data Engineering
* Kartheek – ML & Analytics

---

## 🏁 Conclusion

Shopwave converts raw e-commerce data into actionable insights, helping businesses make smarter, data-driven decisions.

---
