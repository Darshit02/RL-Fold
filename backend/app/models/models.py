from sqlalchemy import Column, String, Float, Integer, DateTime, Enum, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime
import uuid
import enum


class JobStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    sequence = Column(Text, nullable=False)
    target_property = Column(String(100), nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.pending, nullable=False)

    pddt_score = Column(Float, nullable=True)
    rosetta_energy = Column(Float, nullable=True)
    reward_history = Column(JSON, nullable=True)

    structure_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)
    best_plddt = Column(Float, nullable=True)
    total_jobs = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
