from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import shutil
import os
from utils.ocr_service import process_file
from .passenger import create_passenger  # Import the create_passenger function

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        passenger_data = process_file(file_path)

        if not passenger_data:
            raise HTTPException(status_code=400, detail="No se pudo extraer información del archivo")

        passenger = await create_passenger(passenger_data)
        
        return JSONResponse(content={"message": "Ticket agregado correctamente", "passenger": passenger}, status_code=201)

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en upload_file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando el archivo: {str(e)}")
    finally:
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)