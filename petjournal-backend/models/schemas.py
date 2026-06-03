from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Pets
class PetCreate(BaseModel):
    name: str
    species: str
    age: str
    gender: str
    weight: Optional[str] = "—"
    alert: Optional[str] = "Low"
    checkup_date: Optional[str] = "Not scheduled"
    checkup_time: Optional[str] = "TBD"

class PetUpdate(BaseModel):
    name: Optional[str]
    species: Optional[str]
    age: Optional[str]
    gender: Optional[str]
    weight: Optional[str]
    alert: Optional[str]
    checkup_date: Optional[str]
    checkup_time: Optional[str]

class PetOut(BaseModel):
    id: str
    user_id: str
    name: str
    species: str
    age: str
    gender: str
    weight: str
    alert: str
    checkup_date: str
    checkup_time: str
    created_at: datetime

# Memories
class MemoryCreate(BaseModel):
    pet_id: str
    text: str
    title: Optional[str] = "A memory worth keeping"
    ai_narrative: Optional[str] = ""

class MemoryOut(BaseModel):
    id: str
    pet_id: str
    user_id: str
    text: str
    title: str
    ai_narrative: str
    created_at: datetime

# Health
class SymptomCheck(BaseModel):
    pet_id: str
    symptom_text: str
