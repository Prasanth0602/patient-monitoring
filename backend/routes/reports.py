from fastapi import APIRouter, HTTPException
from database.connection import reports_col
from models.schemas import ReportCreate, ReportOut
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def doc_to_out(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "patient_id": doc["patient_id"],
        "report_type": doc["report_type"],
        "report_date": doc.get("report_date", datetime.utcnow()),
        "file_path": doc.get("file_path"),
    }

@router.post("/", response_model=ReportOut)
async def create_report(report: ReportCreate):
    doc = report.dict()
    doc["report_date"] = datetime.utcnow()
    result = await reports_col.insert_one(doc)
    created = await reports_col.find_one({"_id": result.inserted_id})
    return doc_to_out(created)

@router.get("/", response_model=list[ReportOut])
async def list_reports():
    docs = await reports_col.find().sort("report_date", -1).to_list(200)
    return [doc_to_out(d) for d in docs]

@router.get("/patient/{patient_id}", response_model=list[ReportOut])
async def reports_for_patient(patient_id: str):
    docs = await reports_col.find({"patient_id": patient_id}).sort("report_date", -1).to_list(100)
    return [doc_to_out(d) for d in docs]

@router.get("/{report_id}", response_model=ReportOut)
async def get_report(report_id: str):
    doc = await reports_col.find_one({"_id": ObjectId(report_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    return doc_to_out(doc)

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    result = await reports_col.delete_one({"_id": ObjectId(report_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted"}
