from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path

# Create a directory to store uploaded files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Router for airline-related endpoints
airlines = APIRouter()

@airlines.post("/upload-airline-excel")
async def upload_airline_excel(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
