from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Job, JobStatus
from app.models.schemas import JobCreate, JobResponse, JobStatusResponse
from app.services.tasks import run_rl_job
from typing import List
from uuid import UUID
import redis
import json
from app.core.config import settings

router = APIRouter(prefix="/jobs", tags=["jobs"])
r = redis.from_url(settings.REDIS_URL)


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

    run_rl_job.delay(str(job.id), job.sequence,
                     job.target_property or "thermostability")

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


@router.get("/{job_id}/history")
async def get_job_history(job_id: UUID):
    data = r.get(f"job_history:{job_id}")
    if not data:
        return {"job_id": str(job_id), "history": []}
    return {"job_id": str(job_id), "history": json.loads(data)}


@router.delete("/{job_id}")
async def delete_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted"}
