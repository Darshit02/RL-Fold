"""
RL-Fold Training Script

Usage:
    python ml/train.py --sequence MKTAYIAKQRQISFVK --job_id abc123
    python ml/train.py --sequence MKTAYIAKQRQISFVK --job_id abc123 --steps 50
    python ml/train.py --help
"""

import os
import sys
import argparse
import json
import time
import redis

# Add parent directory to sys.path so 'ml' package is found when run directly
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)

from ml.agents.gnn_policy import make_policy_kwargs
from ml.rewards.rewards_fn import RewardFunction
from ml.utils.pyrosetta_scorer import PyRosettaScorer
from ml.utils.esmfold import ESMFoldWrapper
from ml.envs.protein_env import ProteinDesignEnv
from stable_baselines3.common.callbacks import BaseCallback
from stable_baselines3 import PPO


REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')


class MetricsCallback(BaseCallback):
    """
    Publishes live training metrics to Redis pub/sub
    so the WebSocket server can stream them to the browser.
    """

    def __init__(self, job_id: str, redis_client, verbose: int = 0):
        super().__init__(verbose)
        self.job_id = job_id
        self.redis = redis_client
        self.step = 0
        self.summary = {}

    def _on_step(self) -> bool:
        infos = self.locals.get('infos', [{}])
        if not infos:
            return True

        info = infos[0]
        payload = json.dumps({
            'job_id':    self.job_id,
            'step':      self.step,
            'reward':    round(float(self.locals.get('rewards', [0])[0]), 4),
            'plddt':     round(info.get('plddt', 0), 4),
            'energy':    round(info.get('energy', 0), 4),
            'mutation':  info.get('mutation', ''),
            'timestamp': time.time(),
        })

        self.redis.publish(f'metrics:{self.job_id}', payload)
        self.redis.set(
            f'job_history:{self.job_id}',
            json.dumps(self.locals.get('rewards', []).tolist())
        )
        self.step += 1
        self.summary = self.training_env.env_method("get_summary")[0]
        return True


def train(
    sequence:        str,
    job_id:          str,
    target_property: str = 'thermostability',
    total_steps:     int = 50,
    save_path:       str = './storage',
    verbose:         bool = False,
) -> dict:
    """
    Run the full RL training loop for a protein design job.
    Returns summary dict with best pLDDT, energy, and final sequence.
    """

    print(f'[RL-Fold] Starting job {job_id}')
    print(f'[RL-Fold] Sequence: {sequence[:30]}... ({len(sequence)} residues)')
    print(f'[RL-Fold] Target: {target_property}')
    print(f'[RL-Fold] Steps: {total_steps}')
    r = redis.from_url(REDIS_URL)
    esmfold = ESMFoldWrapper()
    scorer = PyRosettaScorer()
    reward_fn = RewardFunction()

    env = ProteinDesignEnv(
        initial_sequence=sequence,
        target_property=target_property,
        max_steps=total_steps,
        esmfold=esmfold,
        scorer=scorer,
        reward_fn=reward_fn,
        verbose=verbose,
    )

    policy_kwargs = make_policy_kwargs(env.observation_space)

    model = PPO(
        policy='MlpPolicy',
        env=env,
        learning_rate=3e-4,
        n_steps=min(total_steps, 512),
        batch_size=32,
        n_epochs=5,
        clip_range=0.2,
        ent_coef=0.01,
        vf_coef=0.5,
        gamma=0.99,
        gae_lambda=0.95,
        verbose=0,
        device='cpu',
    )

    callback = MetricsCallback(job_id=job_id, redis_client=r)

    model.learn(
        total_timesteps=total_steps,
        callback=callback,
        progress_bar=False,
    )

    summary = callback.summary

    structures_dir = os.path.join(save_path, 'structures')
    checkpoints_dir = os.path.join(save_path, 'checkpoints')
    os.makedirs(structures_dir, exist_ok=True)
    os.makedirs(checkpoints_dir, exist_ok=True)

    final_pred = esmfold.predict(summary['final_sequence'])
    pdb_path = os.path.join(structures_dir, f'{job_id}.pdb')

    with open(pdb_path, 'w') as f:
        f.write(final_pred.pdb_string)

    model.save(os.path.join(checkpoints_dir, job_id))

    print(f'[RL-Fold] Job {job_id} complete!')
    print(f'[RL-Fold] Best pLDDT:  {summary["best_plddt"]:.2f}')
    print(f'[RL-Fold] Best energy: {summary["best_energy"]:.2f}')
    print(f'[RL-Fold] PDB saved:   {pdb_path}')

    return {
        'job_id':          job_id,
        'best_plddt':      summary['best_plddt'],
        'best_energy':     summary['best_energy'],
        'final_sequence':  summary['final_sequence'],
        'reward_history':  summary['reward_history'],
        'pdb_path':        pdb_path,
        'n_mutations':     summary['n_mutations'],
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='RL-Fold protein design training')
    parser.add_argument('--sequence',        type=str,  required=True)
    parser.add_argument('--job_id',          type=str,  required=True)
    parser.add_argument('--target_property', type=str,
                        default='thermostability')
    parser.add_argument('--steps',           type=int,  default=50)
    parser.add_argument('--save_path',       type=str,  default='./storage')
    parser.add_argument('--verbose',         action='store_true')
    args = parser.parse_args()

    result = train(
        sequence=args.sequence,
        job_id=args.job_id,
        target_property=args.target_property,
        total_steps=args.steps,
        save_path=args.save_path,
        verbose=args.verbose,
    )
    print(json.dumps(result, indent=2))
