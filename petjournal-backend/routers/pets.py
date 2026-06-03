from fastapi import APIRouter, HTTPException, Depends
from models.schemas import PetCreate, PetUpdate, PetOut
from services.supabase_client import supabase
from routers.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/pets", tags=["pets"])

@router.get("/", response_model=List[dict])
def get_pets(user_id: str = Depends(get_current_user)):
    result = supabase.table("pets").select("*").eq("user_id", user_id).order("created_at").execute()
    return result.data

@router.post("/", response_model=dict)
def create_pet(body: PetCreate, user_id: str = Depends(get_current_user)):
    result = supabase.table("pets").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": body.name,
        "species": body.species,
        "age": body.age,
        "gender": body.gender,
        "weight": body.weight,
        "alert": body.alert,
        "checkup_date": body.checkup_date,
        "checkup_time": body.checkup_time
    }).execute()
    return result.data[0]

@router.put("/{pet_id}", response_model=dict)
def update_pet(pet_id: str, body: PetUpdate, user_id: str = Depends(get_current_user)):
    existing = supabase.table("pets").select("id").eq("id", pet_id).eq("user_id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Pet not found")
    updates = {k: v for k, v in body.dict().items() if v is not None}
    result = supabase.table("pets").update(updates).eq("id", pet_id).execute()
    return result.data[0]

@router.delete("/{pet_id}")
def delete_pet(pet_id: str, user_id: str = Depends(get_current_user)):
    existing = supabase.table("pets").select("id").eq("id", pet_id).eq("user_id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Pet not found")
    supabase.table("pets").delete().eq("id", pet_id).execute()
    return {"message": "Pet deleted"}
