from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Job
from uuid import UUID
import os

router = APIRouter(prefix="/results", tags=["results"])

@router.get("/{job_id}/download")
async def download_structure(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.structure_path or not os.path.exists(job.structure_path):
        raise HTTPException(status_code=404, detail="Structure file not ready yet")
    return FileResponse(
        path=job.structure_path,
        filename=f"{job.name}.pdb",
        media_type="chemical/x-pdb",
    )

@router.get("/{job_id}/summary")
async def get_summary(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id":        str(job.id),
        "name":          job.name,
        "status":        job.status,
        "plddt_score":   round(job.plddt_score, 2) if job.plddt_score else None,
        "rosetta_energy": round(job.rosetta_energy, 2) if job.rosetta_energy else None,
        "structure_ready": job.structure_path is not None,
        "created_at":    job.created_at,
        "updated_at":    job.updated_at,
    }
