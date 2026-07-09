# 🏥 Remote Patient Monitoring Platform

Full-stack web app built with **React + Python FastAPI + MongoDB**.

## 📁 Project Structure

```
patient-monitoring/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   ├── database/
│   │   └── connection.py     # MongoDB (Motor async client)
│   ├── models/
│   │   └── schemas.py        # Pydantic models
│   └── routes/
│       ├── doctors.py
│       ├── patients.py
│       ├── vitals.py
│       ├── alerts.py
│       └── reports.py
└── frontend/
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── api/
        │   ├── axiosConfig.js
        │   └── api.js
        ├── context/
        │   └── AuthContext.js
        ├── components/
        │   └── Layout.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Patients.js
            ├── PatientDetail.js
            ├── Vitals.js
            ├── Alerts.js
            └── Reports.js
```

---

## ⚙️ Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally on port 27017

---

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at: **http://localhost:3000**

---

## 🔑 Environment Variables (optional)

Create `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Doctor Auth | Register / Login with hashed passwords |
| 🧑‍⚕️ Patients | Full CRUD — add, view, search, delete |
| 💓 Vitals | Record Heart Rate, Temperature, Blood Pressure |
| ⚠️ Auto Alerts | Auto-generated when vitals exceed safe thresholds |
| 📈 Charts | Vitals trend line chart per patient |
| 📋 Reports | Create & track patient reports by type |

---

## 📊 ER Diagram Entities

- **DOCTOR** — manages patients (1:N)
- **PATIENT** — has vitals (1:N), alerts (1:N), reports (1:N)
- **VITALS** — HeartRate, Temperature, BloodPressure
- **ALERT** — Parameter, Message, Status (active/resolved)
- **REPORT** — ReportType, Date, FilePath

---

## 🚨 Auto-Alert Thresholds

| Parameter | Trigger |
|-----------|---------|
| Heart Rate | < 50 or > 120 bpm |
| Temperature | < 35.5 or > 38.5 °C |
