from fastapi import APIRouter, HTTPException
from database.connection import patients_col
from models.schemas import PatientCreate, PatientOut
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def doc_to_out(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "age": doc["age"],
        "gender": doc["gender"],
        "phone": doc["phone"],
        "address": doc["address"],
        "doctor_id": doc["doctor_id"],
        "created_at": doc.get("created_at", datetime.utcnow()),
    }

@router.post("/", response_model=PatientOut)
async def create_patient(patient: PatientCreate):
    doc = patient.dict()
    doc["created_at"] = datetime.utcnow()
    result = await patients_col.insert_one(doc)
    created = await patients_col.find_one({"_id": result.inserted_id})
    return doc_to_out(created)

@router.get("/", response_model=list[PatientOut])
async def list_patients():
    docs = await patients_col.find().to_list(200)
    return [doc_to_out(d) for d in docs]

@router.get("/by-doctor/{doctor_id}", response_model=list[PatientOut])
async def patients_by_doctor(doctor_id: str):
    docs = await patients_col.find({"doctor_id": doctor_id}).to_list(200)
    return [doc_to_out(d) for d in docs]

@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: str):
    doc = await patients_col.find_one({"_id": ObjectId(patient_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    return doc_to_out(doc)

@router.put("/{patient_id}", response_model=PatientOut)
async def update_patient(patient_id: str, patient: PatientCreate):
    await patients_col.update_one(
        {"_id": ObjectId(patient_id)}, {"$set": patient.dict()}
    )
    updated = await patients_col.find_one({"_id": ObjectId(patient_id)})
    return doc_to_out(updated)

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    result = await patients_col.delete_one({"_id": ObjectId(patient_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted"}
