from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(".env.local")

<<<<<<< HEAD
app = FastAPI(title="Builders Circle API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
=======
app = FastAPI(title="Builders Circle API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # public site
        "http://localhost:3001",  # internal controller
    ],
>>>>>>> origin/feat/amat
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


from routes.ingest import router as ingest_router
from routes.match import router as match_router
from routes.introductions import router as introductions_router
<<<<<<< HEAD

app.include_router(ingest_router)
app.include_router(match_router)
app.include_router(introductions_router)
=======
from routes.applications import router as applications_router

app.include_router(ingest_router)
app.include_router(match_router)
app.include_router(introductions_router)
app.include_router(applications_router)
>>>>>>> origin/feat/amat
