from bson import ObjectId
from fastapi import APIRouter, status, Response, HTTPException
import pandas as pd
import numpy as np
from pydantic import ValidationError
import asyncio
from motor.motor_asyncio import AsyncIOMotorCursor


from models.passenger import Passenger, PassengerCreate
from config.db import conn
from schemas.passanger import passengerEntity, passengersEntity

passengers = APIRouter()

# Obtener todos los pasajeros
@passengers.get('/passengers', response_model=list[Passenger], tags=["passengers"])
async def find_all_passengers():
    cursor: AsyncIOMotorCursor = conn.Passanger.find()
    passengers = await passengersEntity(cursor)
    return passengers
# Obtener un pasajero por ID
@passengers.get('/passengers/{id}', response_model=Passenger, tags=["passengers"])
async def find_passenger(id: str):
    passenger = conn.Passanger.find_one({"_id": ObjectId(id)})
    if passenger is None:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passengerEntity(passenger)

# Crear un pasajero 
@passengers.post('/passengers', response_model=Passenger, tags=["passengers"], status_code=status.HTTP_201_CREATED)
async def create_passenger(passenger_data: dict):
    try:
        passenger = PassengerCreate(**passenger_data)
        
        try:
            df = pd.read_excel("Aerolineas.xlsx")
            
        except FileNotFoundError:
            print("Archivo de aerolíneas no encontrado. Continuando sin verificar la aerolínea.")
            df = None

        airline_name = passenger_data.get("airline_name")
        if df is not None and airline_name in df["Nombre"].values:
            airline_id = df[df["Nombre"] == airline_name]["Código"].iloc[0]
            passenger_data["airline_id"] = int(airline_id) if isinstance(airline_id, np.integer) else airline_id
        else:
            print(f"Aerolínea '{airline_name}' no encontrada en el archivo Excel. Asignando valor 0 al ID.")
            passenger_data["airline_id"] = 0

        passenger_data = {k: v for k, v in passenger_data.items() if v is not None}

        result = await conn.Passanger.insert_one(passenger_data)
        new_passenger = await conn.Passanger.find_one({"_id": result.inserted_id})
        
        if new_passenger is None:
            print("Error al recuperar el pasajero creado de la base de datos")
            return None

        return passengerEntity(new_passenger)

    except ValidationError as ve:
        print(f"Error de validación: {str(ve)}")
        return None
    except Exception as e:
        print(f"Error inesperado creando el pasajero: {str(e)}")
        return None

# Actualizar un pasajero por ID
@passengers.put('/passengers/{id}', response_model=Passenger, tags=["passengers"])
async def update_passenger(id: str, passenger: Passenger):
    result = conn.Passanger.update_one({"_id": ObjectId(id)}, {"$set": passenger.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger

# Eliminar un pasajero por ID
@passengers.delete('/passengers/{id}', status_code=status.HTTP_204_NO_CONTENT, tags=["passengers"])
async def delete_passenger(id: str):
    result = conn.Passanger.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
