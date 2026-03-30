from app.core.celery_app import celery_app
from app.core.config import settings
import json
import redis
import time
import sys
import os

r = redis.from_url(settings.REDIS_URL)

def update_job_status(
    job_id:         str,
    status:         str,
    plddt:          float = None,
    energy:         float = None,
    structure_path: str   = None,
    reward_history: list  = None,
):
    from sqlalchemy import create_engine, text
    db_url = settings.DATABASE_URL.replace('+asyncpg', '+psycopg2')
    engine = create_engine(db_url)
    with engine.connect() as conn:
        if plddt is not None:
            conn.execute(
                text("""
                    UPDATE jobs
                    SET status=:status,
                        plddt_score=:plddt,
                        rosetta_energy=:energy,
                        structure_path=:path,
                        reward_history=:history,
                        updated_at=now()
                    WHERE id=:id
                """),
                {
                    'status':  status,
                    'plddt':   plddt,
                    'energy':  energy,
                    'path':    structure_path,
                    'history': json.dumps(reward_history or []),
                    'id':      job_id,
                }
            )
        else:
            conn.execute(
                text('UPDATE jobs SET status=:status, updated_at=now() WHERE id=:id'),
                {'status': status, 'id': job_id}
            )
        conn.commit()
    engine.dispose()

@celery_app.task(bind=True, name='run_rl_job')
def run_rl_job(self, job_id: str, sequence: str, target_property: str):
    """
    Main Celery task for protein design.
    Delegates to the ML pipeline training script.
    """
    update_job_status(job_id, 'running')

    try:
        # Add ml/ directory to Python path
        ml_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml')
        ml_path = os.path.abspath(ml_path)
        if ml_path not in sys.path:
            sys.path.insert(0, ml_path)

        # Import and run training
        from ml.train import train

        result = train(
            sequence        = sequence,
            job_id          = job_id,
            target_property = target_property,
            total_steps     = 50,
            save_path       = settings.STORAGE_PATH,
            verbose         = False,
        )

        # Update DB with final results
        update_job_status(
            job_id         = job_id,
            status         = 'completed',
            plddt          = result['best_plddt'],
            energy         = result['best_energy'],
            structure_path = result['pdb_path'],
            reward_history = result['reward_history'],
        )

        return result

    except Exception as e:
        update_job_status(job_id, 'failed')
        raise e
