from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, pets, memories, health

app = FastAPI(title="PetJournal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(memories.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {"message": "PetJournal API is running"}
