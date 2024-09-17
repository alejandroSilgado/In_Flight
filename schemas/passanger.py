def passengerEntity(item) -> dict:
    return {
        "id": str(item["_id"]),
        "passenger_name": item.get("passenger_name", ""),
        "airline_name": item.get("airline_name", ""),
        "airline_id": str(item.get("airline_id", 0)), 
        "reservation_code": item.get("reservation_code", ""),
        "boarding_time": item.get("boarding_time", ""),
        "group": item.get("group", ""),
        "seat_number": item.get("seat_number", ""),
        "origin": item.get("origin", ""),
        "destination": item.get("destination", ""),
        "date": item.get("date", "")
    }

async def passengersEntity(cursor) -> list[dict]:
    return [passengerEntity(item) async for item in cursor]

def serializeDict(a: dict) -> dict:
    return {**{i: str(a[i]) for i in a if i == '_id'}, **{i: a[i] for i in a if i != '_id'}}

def serializeList(entity: list[dict]) -> list[dict]:
    return [serializeDict(a) for a in entity]