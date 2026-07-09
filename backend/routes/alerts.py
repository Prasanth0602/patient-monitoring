from fastapi import APIRouter, HTTPException
from database.connection import alerts_col
from models.schemas import AlertCreate, AlertOut
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def doc_to_out(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "patient_id": doc["patient_id"],
        "parameter": doc["parameter"],
        "message": doc["message"],
        "alert_time": doc.get("alert_time", datetime.utcnow()),
        "status": doc["status"],
    }

@router.post("/", response_model=AlertOut)
async def create_alert(alert: AlertCreate):
    doc = alert.dict()
    doc["alert_time"] = datetime.utcnow()
    result = await alerts_col.insert_one(doc)
    created = await alerts_col.find_one({"_id": result.inserted_id})
    return doc_to_out(created)

@router.get("/", response_model=list[AlertOut])
async def list_alerts():
    docs = await alerts_col.find().sort("alert_time", -1).to_list(200)
    return [doc_to_out(d) for d in docs]

@router.get("/active", response_model=list[AlertOut])
async def active_alerts():
    docs = await alerts_col.find({"status": "active"}).sort("alert_time", -1).to_list(200)
    return [doc_to_out(d) for d in docs]

@router.get("/patient/{patient_id}", response_model=list[AlertOut])
async def alerts_for_patient(patient_id: str):
    docs = await alerts_col.find({"patient_id": patient_id}).sort("alert_time", -1).to_list(100)
    return [doc_to_out(d) for d in docs]

@router.patch("/{alert_id}/resolve", response_model=AlertOut)
async def resolve_alert(alert_id: str):
    await alerts_col.update_one(
        {"_id": ObjectId(alert_id)}, {"$set": {"status": "resolved"}}
    )
    updated = await alerts_col.find_one({"_id": ObjectId(alert_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
    return doc_to_out(updated)

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    result = await alerts_col.delete_one({"_id": ObjectId(alert_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}
