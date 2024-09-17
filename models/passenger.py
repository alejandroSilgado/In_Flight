from typing import Optional, Union, List
from pydantic import BaseModel


class PassengerCreate(BaseModel):
    passenger_name: str
    airline_name: str
    reservation_code: str
    boarding_time: Optional[str]
    group: Optional[str]
    seat_number: Optional[str]
    origin: Optional[str]
    destination: Optional[str]
    date: str

class Passenger(PassengerCreate):
    id: Optional[str] = None
    airline_id: Union[str, int]

    class Config:
        from_attributes = True  