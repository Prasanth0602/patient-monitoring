from fastapi import APIRouter, HTTPException
from database.connection import vitals_col, alerts_col
from models.schemas import VitalsCreate, VitalsOut
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def doc_to_out(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "patient_id": doc["patient_id"],
        "heart_rate": doc["heart_rate"],
        "temperature": doc["temperature"],
        "blood_pressure": doc["blood_pressure"],
        "recorded_at": doc.get("recorded_at", datetime.utcnow()),
    }

async def check_and_create_alerts(vitals: dict, patient_id: str):
    """Auto-generate alerts when vitals cross thresholds."""
    alerts = []
    hr = vitals["heart_rate"]
    temp = vitals["temperature"]

    if hr < 50 or hr > 120:
        alerts.append({
            "patient_id": patient_id,
            "parameter": "HeartRate",
            "message": f"Abnormal heart rate: {hr} bpm",
            "alert_time": datetime.utcnow(),
            "status": "active",
        })
    if temp < 35.5 or temp > 38.5:
        alerts.append({
            "patient_id": patient_id,
            "parameter": "Temperature",
            "message": f"Abnormal temperature: {temp}°C",
            "alert_time": datetime.utcnow(),
            "status": "active",
        })
    if alerts:
        await alerts_col.insert_many(alerts)

@router.post("/", response_model=VitalsOut)
async def record_vitals(vitals: VitalsCreate):
    doc = vitals.dict()
    doc["recorded_at"] = datetime.utcnow()
    result = await vitals_col.insert_one(doc)
    await check_and_create_alerts(doc, vitals.patient_id)
    created = await vitals_col.find_one({"_id": result.inserted_id})
    return doc_to_out(created)

@router.get("/patient/{patient_id}", response_model=list[VitalsOut])
async def get_vitals_for_patient(patient_id: str):
    docs = await vitals_col.find({"patient_id": patient_id}).sort("recorded_at", -1).to_list(50)
    return [doc_to_out(d) for d in docs]

@router.get("/latest/{patient_id}", response_model=VitalsOut)
async def get_latest_vitals(patient_id: str):
    doc = await vitals_col.find_one(
        {"patient_id": patient_id}, sort=[("recorded_at", -1)]
    )
    if not doc:
        raise HTTPException(status_code=404, detail="No vitals found")
    return doc_to_out(doc)

@router.get("/", response_model=list[VitalsOut])
async def list_all_vitals():
    docs = await vitals_col.find().sort("recorded_at", -1).to_list(100)
    return [doc_to_out(d) for d in docs]
