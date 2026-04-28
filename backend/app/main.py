from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routers import useCases, subUseCases, roles, transactions, properties, propertyGroups, users, ontology
from .config import IMAGE_DIR
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static/images", StaticFiles(directory=IMAGE_DIR), name="images")

app.include_router(users.auth_router)
app.include_router(users.user_router)
app.include_router(users.api_router)
app.include_router(useCases.router)
app.include_router(subUseCases.router)
app.include_router(roles.router)
app.include_router(transactions.router)
app.include_router(properties.router)
app.include_router(propertyGroups.router)
app.include_router(ontology.router)