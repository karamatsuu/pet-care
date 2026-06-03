from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SymptomCheck
from services.supabase_client import supabase
from routers.auth import get_current_user

router = APIRouter(prefix="/health", tags=["health"])

@router.post("/symptom-check")
def symptom_check(body: SymptomCheck, user_id: str = Depends(get_current_user)):
    pet = supabase.table("pets").select("*").eq("id", body.pet_id).eq("user_id", user_id).execute()
    if not pet.data:
        raise HTTPException(status_code=404, detail="Pet not found")
    pet_data = pet.data[0]

    # TODO: replace this with real Claude API call later
    result = {
        "pet_name": pet_data["name"],
        "symptom": body.symptom_text,
        "urgency": "low",
        "what_it_might_be": f"For {pet_data['name']}, this may be normal soreness after activity or mild stiffness.",
        "urgency_detail": "Low urgency if appetite, energy, and mood are normal.",
        "when_to_see_vet": "Call a vet if limping, swelling, or stiffness continues beyond a day.",
        "home_care": "Offer rest, gentle walks only, and water nearby."
    }
    return result
