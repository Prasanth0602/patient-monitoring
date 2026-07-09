from fastapi import APIRouter, HTTPException
from database.connection import doctors_col
from models.schemas import DoctorCreate, DoctorLogin, DoctorOut
from bson import ObjectId
from datetime import datetime
import hashlib

router = APIRouter()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def doc_to_out(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc["phone"],
    }

@router.post("/register", response_model=DoctorOut)
async def register_doctor(doctor: DoctorCreate):
    existing = await doctors_col.find_one({"email": doctor.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = doctor.dict()
    doc["password"] = hash_password(doc["password"])
    result = await doctors_col.insert_one(doc)
    created = await doctors_col.find_one({"_id": result.inserted_id})
    return doc_to_out(created)

@router.post("/login")
async def login_doctor(credentials: DoctorLogin):
    doc = await doctors_col.find_one({"email": credentials.email})
    if not doc or doc["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"id": str(doc["_id"]), "name": doc["name"], "email": doc["email"]}

@router.get("/{doctor_id}", response_model=DoctorOut)
async def get_doctor(doctor_id: str):
    doc = await doctors_col.find_one({"_id": ObjectId(doctor_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doc_to_out(doc)

@router.get("/", response_model=list[DoctorOut])
async def list_doctors():
    docs = await doctors_col.find().to_list(100)
    return [doc_to_out(d) for d in docs]
