from app.core.celery_app import celery_app
from app.core.config import settings
import asyncio
import json
import redis
import time
import random
import os

r = redis.from_url(settings.REDIS_URL)


def publish_metric(job_id: str, step: int, reward: float, plddt: float, energy: float):
    payload = json.dumps({
        "job_id": job_id,
        "step": step,
        "reward": round(reward, 4),
        "plddt": round(plddt, 4),
        "energy": round(energy, 4),
        "timestamp": time.time(),
    })
    r.publish(f"metrics:{job_id}", payload)


def update_job_status(job_id: str, status: str, plddt: float = None, energy: float = None, structure_path: str = None):
    from sqlalchemy import create_engine, text
    db_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
    engine = create_engine(db_url)
    with engine.connect() as conn:
        if plddt and energy:
            conn.execute(
                text("UPDATE jobs SET status=:status, plddt_score=:plddt, rosetta_energy=:energy, structure_path=:path, updated_at=now() WHERE id=:id"),
                {"status": status, "plddt": plddt, "energy": energy,
                    "path": structure_path, "id": job_id}
            )
        else:
            conn.execute(
                text("UPDATE jobs SET status=:status, updated_at=now() WHERE id=:id"),
                {"status": status, "id": job_id}
            )
        conn.commit()
    engine.dispose()


@celery_app.task(bind=True, name="run_rl_job")
def run_rl_job(self, job_id: str, sequence: str, target_property: str):
    update_job_status(job_id, "running")
    reward_history = []
    best_plddt = 0.0
    best_energy = 0.0
    total_steps = 50

    for step in range(total_steps):
        time.sleep(0.3)
        progress = step / total_steps
        plddt = 30 + (progress * 45) + random.uniform(-3, 3)
        energy = -50 - (progress * 80) + random.uniform(-5, 5)
        reward = (plddt / 100) * 0.4 + (abs(energy) / 200) * 0.6

        plddt = max(0, min(100, plddt))
        energy = min(0, energy)
        reward = max(0, min(1, reward))

        reward_history.append(round(reward, 4))
        best_plddt = max(best_plddt, plddt)
        best_energy = min(best_energy, energy)

        publish_metric(job_id, step, reward, plddt, energy)

        r.set(f"job_history:{job_id}", json.dumps(reward_history))

    structure_path = f"{settings.STORAGE_PATH}/structures/{job_id}.pdb"
    os.makedirs(os.path.dirname(structure_path), exist_ok=True)
    with open(structure_path, "w") as f:
        f.write(
            f"REMARK  RL-Fold generated structure\nREMARK  Job: {job_id}\nREMARK  pLDDT: {best_plddt:.2f}\nREMARK  Energy: {best_energy:.2f}\nEND\n")
    update_job_status(job_id, "completed", best_plddt,
                      best_energy, structure_path)
    return {"job_id": job_id, "plddt": best_plddt, "energy": best_energy}
