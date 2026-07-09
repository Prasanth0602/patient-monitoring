from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "patient_monitoring"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
doctors_col = db["doctors"]
patients_col = db["patients"]
vitals_col = db["vitals"]
alerts_col = db["alerts"]
reports_col = db["reports"]
