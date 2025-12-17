from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes import useCases, subUseCases, roles, transactions
from app.config import IMAGE_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static/images", StaticFiles(directory=IMAGE_DIR), name="images")

app.include_router(useCases.router)
app.include_router(subUseCases.router)
app.include_router(roles.router)
app.include_router(transactions.router)