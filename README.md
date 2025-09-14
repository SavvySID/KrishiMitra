
# 🌱 Smart Crop Advisory System (SIH Hackathon 2025)

A **data-driven crop advisory platform** designed for **small and marginal farmers in India**, providing **personalized crop recommendations, real-time weather insights, soil health management, and market intelligence**.  
Built as part of **Smart India Hackathon (SIH) 2025**.

---

## 🚀 Features

- **Farmer Profiles** – Land records, resources, and farm details  
- **Smart Crop Recommendations** – AI/ML-based suggestions with yield prediction  
- **Weather Advisory** – Real-time forecasts, irrigation schedules & alerts  
- **Soil Health Management** – Nutrient analysis & fertilizer recommendations  
- **Market Intelligence** – Price trends, demand forecasting, selling opportunities  
- **Pest & Disease Detection** – Image-based detection & treatment advice  
- **Agricultural Calendar** – Sowing, harvesting & crop care schedules  
- **Financial Advisory** – Subsidy, insurance & government scheme alerts  
- **Voice & Multilingual Support** – Hindi, English & regional languages  
- **Offline-first Architecture** – Works in low-connectivity areas  

---

## 🛠️ Tech Stack

**Frontend:** React.js (TypeScript), Tailwind CSS, Material-UI  
**Backend:** Node.js (Express.js), MongoDB, PostgreSQL  
**Machine Learning:** Python (Flask/FastAPI) – crop advisory, yield prediction, disease detection  
**APIs:** IMD, OpenWeatherMap, ISRO Bhuvan, eNAM, APMC  
**Cloud & Deployment:** AWS / Azure, Docker, CI/CD  

---

## 📊 System Architecture

```

Farmer Input → Data Validation → ML Models → Recommendation Engine → Advisory Dashboard → Feedback Loop

```

---

## 📂 Project Structure

```

frontend/        # React + TypeScript app
backend/         # Node.js + Express API
ml\_service/      # Python ML microservices
docs/            # Documentation & design assets

````

---

## 🎯 Impact

- Focused on **small & marginal farmers (<5 acres)**  
- **Data-backed farming decisions** → improved yield & reduced crop loss  
- **Increased farmer income** with real-time market insights  
- Promotes **sustainable agriculture**  

---

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm  
- Python 3.x  
- MongoDB & PostgreSQL  
- Docker (optional for containerized deployment)

### Steps
```bash
# Clone the repository
git clone https://github.com/your-username/smart-crop-advisory.git
cd smart-crop-advisory

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Run ML service
cd ../ml_service
pip install -r requirements.txt
python flask_app.py
````

---

## 📜 License

This project is licensed under the **MIT License**.

---
