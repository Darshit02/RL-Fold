from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Job, JobStatus
from app.models.schemas import JobCreate, JobResponse, JobStatusResponse
from typing import List
from uuid import UUID

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=JobResponse)
async def create_job(payload: JobCreate, db: AsyncSession = Depends(get_db)):
    job = Job(
        name=payload.name,
        sequence=payload.sequence,
        target_property=payload.target_property,
        status=JobStatus.pending,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

@router.get("/", response_model=List[JobStatusResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).order_by(Job.created_at.desc()))
    return result.scalars().all()

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
    
@router.delete("/{job_id}")
async def delete_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted"}