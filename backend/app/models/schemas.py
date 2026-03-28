from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.models import JobStatus


class JobCreate(BaseModel):
    name: str = Field(..., min_legnth=1, max_legnth=225)
    sequence: str = Field(..., min_length=1)
    target_property: Optional[str] = None


class JobResponse(BaseModel):
    id: UUID
    name: str
    sequence: str
    target_property: Optional[str]
    status: JobStatus
    plddt_score: Optional[float]
    rosetta_energy: Optional[float]
    reward_history: Optional[List[float]]
    structure_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobStatusResponse(BaseModel):
    id: UUID
    name: str
    status: JobStatus
    plddt_score: Optional[float]
    rosetta_energy: Optional[float]
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
