from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema):
        schema.update(type="string")
        return schema


# ─── Doctor ───────────────────────────────────────────────────────────────────
class DoctorCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class DoctorLogin(BaseModel):
    email: str
    password: str

class DoctorOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str


# ─── Patient ──────────────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    address: str
    doctor_id: str

class PatientOut(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: str
    address: str
    doctor_id: str
    created_at: datetime


# ─── Vitals ───────────────────────────────────────────────────────────────────
class VitalsCreate(BaseModel):
    patient_id: str
    heart_rate: float
    temperature: float
    blood_pressure: str   # e.g. "120/80"

class VitalsOut(BaseModel):
    id: str
    patient_id: str
    heart_rate: float
    temperature: float
    blood_pressure: str
    recorded_at: datetime


# ─── Alert ────────────────────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    patient_id: str
    parameter: str
    message: str
    status: str = "active"   # active | resolved

class AlertOut(BaseModel):
    id: str
    patient_id: str
    parameter: str
    message: str
    alert_time: datetime
    status: str


# ─── Report ───────────────────────────────────────────────────────────────────
class ReportCreate(BaseModel):
    patient_id: str
    report_type: str
    file_path: Optional[str] = None

class ReportOut(BaseModel):
    id: str
    patient_id: str
    report_type: str
    report_date: datetime
    file_path: Optional[str]
