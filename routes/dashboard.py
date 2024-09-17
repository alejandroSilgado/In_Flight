from fastapi import HTTPException, APIRouter
from datetime import datetime
from collections import Counter
from typing import Dict
from config.db import conn
from schemas.passanger import passengerEntity

dashboard = APIRouter()

@dashboard.get("/dashboard-data")
async def get_dashboard_data() -> Dict:
    
    try:
        passengers = await conn.Passanger.find().to_list(length=None)

        if not passengers:
            raise HTTPException(status_code=404, detail="No passenger data found")

        passengers = [passengerEntity(p) for p in passengers]

        # Contar el número de aerolíneas
        all_airlines = Counter(p['airline_name'] for p in passengers)

        # Número total de pasajeros
        total_passengers = len(passengers)

        # Información del vuelo y estado de la fecha
        today = datetime.now().date()
        flight_info = []

        for p in passengers:
            flight_date = datetime.strptime(p['date'], "%Y-%m-%d").date()
            status = "Disponible" if flight_date >= today else "Fecha pasada"
            flight_info.append({
                'passenger_name': p['passenger_name'],
                'reservation_code': p['reservation_code'],
                'flight_date': p['date'],
                'status': status
            })

        # Top 3 ciudades de origen y destino
        origin_counts = Counter(p['origin'] for p in passengers if p.get('origin'))
        destination_counts = Counter(p['destination'] for p in passengers if p.get('destination'))
        top_cities = dict(Counter(origin_counts + destination_counts).most_common(3))

        return {
            "total_passengers": total_passengers,
            "total_airlines": len(all_airlines),
            "all_airlines": dict(all_airlines),  # Para el gráfico de aerolíneas
            "top_cities": top_cities,            # Para el gráfico de top ciudades
            "flight_info": flight_info,          # Información para el histograma de vuelos
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
