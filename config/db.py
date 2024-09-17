from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")

# Seleccionar la base de datos y la colección
conn = client["OCR_Project"]  # Base de datos OCR_Project
