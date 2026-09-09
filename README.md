# 🌿 FoodNova (FoodShareAI)

FoodNova is an intelligent, zero-waste food distribution platform that connects farmers, suppliers, and communities with NGOs to efficiently redirect surplus food that would otherwise go to waste. 

Powered by built-in AI risk prediction and route optimization, FoodNova ensures seamless matching across regions.

---

## 🚀 Features

- **🧠 AI Spoilage Prediction:** Automatically evaluates food risk and freshness based on quantity and hours remaining through AI analysis.
- **🤝 Role-Based Dashboards:** Unique, tailored interfaces for Farmers, Suppliers,Hotels,Restaurant and NGOs.
- **📍 Real-time NGO Matching:** Integrates live localized searches to find the most compatible charities and shelters.
- **🗺️ Live Route Maps:** Built-in dynamic routing with Leaflet mapping for visual coordination.
- **⛽ AI Route Optimization:** Calculates distance savings, time improvements, fuel cost reductions, and CO₂ savings.
- **📊 Impact Analytics:** Track live session metrics like Meals Saved and CO₂ prevented.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Vanilla CSS/Glassmorphism design, Leaflet Maps
- **Backend:** Node.js, Express.js
- **Database:** In-Memory (seeded JSON configuration for demo viability)
- **External APIs:** Overpass API for live NGO geographical resolution

---

## 🏃‍♂️ Getting Started

Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

### 1. Clone or Download the Project
Extract the ZIP file or clone the project locally to your computer.

### 2. Start the Backend API Server
Open a terminal inside the project directory and navigate to the `backend` folder:
```bash
cd backend
npm install
npm start
```
*The backend server will run natively on `http://localhost:5000`*

### 3. Start the Frontend Application
Open a new terminal tab and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
*Vite will start the client locally on `http://localhost:5173`*

### 4. Experience the Platform
Visit `http://localhost:5173` in your browser. Choose a role (e.g. Farmer), add a fresh food item indicating its expiry timeframe, and test exactly how the AI engines dynamically direct logic seamlessly!

---

## 🌱 Impact

Every 1kg of saved food translates roughly to **~2.5kg of CO₂ prevented** and **~2.8 meals provided**. By connecting immediate logistics organically, FoodNova bridges the gap towards an accessible zero-waste footprint.
