from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.models import JobStatus


class JobCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=225)
    sequence: str = Field(..., min_length=1)
    target_property: Optional[str] = None


class JobResponse(BaseModel):
    id: UUID
    name: str
    sequence: str
    target_property: Optional[str] = None
    status: JobStatus
    plddt_score: Optional[float] = None
    rosetta_energy: Optional[float] = None
    reward_history: Optional[List[float]] = None
    structure_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobStatusResponse(BaseModel):
    id: UUID
    name: str
    status: JobStatus
    plddt_score: Optional[float] = None
    rosetta_energy: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExperimentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    config: Optional[dict] = None


class ExperimentResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    config: Optional[dict]
    best_plddt: Optional[float]
    total_jobs: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    username: str
    password: str = Field(..., max_length=72)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
