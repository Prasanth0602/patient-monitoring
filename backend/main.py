from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import doctors, patients, vitals, alerts, reports

app = FastAPI(title="Remote Patient Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(vitals.router, prefix="/api/vitals", tags=["Vitals"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "Remote Patient Monitoring API is running"}
