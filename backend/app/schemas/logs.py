from pydantic import BaseModel
from datetime import datetime

class VersionInfo(BaseModel):
    version: int
    updated_by: str | None = None
    updated_at: datetime | None = None