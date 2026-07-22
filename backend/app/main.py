from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routers import useCases, subUseCases, roles, transactions, properties, propertyGroups, users, ontology, standards
from .config import IMAGE_DIR, get_settings
from .exceptions import VersionConflictError

settings = get_settings()
print(settings)
exit()

app = FastAPI(
    title="Construct-X UseCase Management API",
    description="Manage use cases and related information.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

@app.exception_handler(VersionConflictError)
async def version_conflict_handler(request: Request, exc: VersionConflictError):
    return JSONResponse(
        status_code=409,
        content={
            "error": "version_conflict",
            "current_version": exc.current_version,
            "your_version": exc.your_version,
            "updated_by": exc.updated_by,
            "updated_at": exc.updated_at.isoformat() if exc.updated_at else None,
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")

@app.get("/health")
def health() -> Response:
    return Response(content="ok\n", media_type="text/plain")

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
app.include_router(standards.router)