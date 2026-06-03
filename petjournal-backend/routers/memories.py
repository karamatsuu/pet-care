from fastapi import APIRouter, HTTPException, Depends
from models.schemas import MemoryCreate, MemoryOut
from services.supabase_client import supabase
from routers.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/memories", tags=["memories"])

@router.get("/", response_model=List[dict])
def get_memories(pet_id: str, user_id: str = Depends(get_current_user)):
    result = supabase.table("memories").select("*").eq("pet_id", pet_id).eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

@router.post("/", response_model=dict)
def create_memory(body: MemoryCreate, user_id: str = Depends(get_current_user)):
    pet = supabase.table("pets").select("id").eq("id", body.pet_id).eq("user_id", user_id).execute()
    if not pet.data:
        raise HTTPException(status_code=404, detail="Pet not found")
    result = supabase.table("memories").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "pet_id": body.pet_id,
        "text": body.text,
        "title": body.title,
        "ai_narrative": body.ai_narrative
    }).execute()
    return result.data[0]

@router.delete("/{memory_id}")
def delete_memory(memory_id: str, user_id: str = Depends(get_current_user)):
    existing = supabase.table("memories").select("id").eq("id", memory_id).eq("user_id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Memory not found")
    supabase.table("memories").delete().eq("id", memory_id).execute()
    return {"message": "Memory deleted"}
