import gymnasium as gym
import numpy as np
from gymnasium import spaces
from typing import Optional, Tuple, Dict, Any
from ml.utils.esmfold import ESMFoldWrapper
from ml.utils.pyrosetta_scorer import PyRosettaScorer
from ml.rewards.rewards_fn import RewardFunction

AA_CHARS  = 'ACDEFGHIKLMNPQRSTVWY'
AA_TO_IDX = {aa: i for i, aa in enumerate(AA_CHARS)}
N_AA      = len(AA_CHARS)

class ProteinDesignEnv(gym.Env):
    """
    Gymnasium environment for RL-guided protein design.

    State:  Encoded protein sequence as a 2D array (seq_len x N_AA)
            Each position is a one-hot vector over the 20 amino acids.

    Action: Integer in [0, seq_len * N_AA)
            Decoded as (position, amino_acid) — mutate residue at
            position to the chosen amino acid.

    Reward: Composite score from ESMFold pLDDT + PyRosetta energy
            + RMSD from target + solubility proxy.

    Episode: Terminates after max_steps mutations or when a
             convergence criterion is met.
    """

    metadata = {'render_modes': []}

    def __init__(
        self,
        initial_sequence: str,
        target_property:  str  = 'thermostability',
        max_steps:        int  = 50,
        esmfold:          Optional[ESMFoldWrapper]   = None,
        scorer:           Optional[PyRosettaScorer]  = None,
        reward_fn:        Optional[RewardFunction]   = None,
        target_pdb:       Optional[str] = None,
        verbose:          bool = False,
    ):
        super().__init__()

        self.initial_sequence = initial_sequence.upper()
        self.sequence         = list(self.initial_sequence)
        self.target_property  = target_property
        self.max_steps        = max_steps
        self.target_pdb       = target_pdb
        self.verbose          = verbose
        self.step_count       = 0

        self.seq_len = len(self.sequence)

        # Tools
        self.esmfold   = esmfold or ESMFoldWrapper()
        self.scorer    = scorer  or PyRosettaScorer()
        self.reward_fn = reward_fn or RewardFunction()

        # Spaces
        # Observation: one-hot encoded sequence (seq_len x 20)
        self.observation_space = spaces.Box(
            low   = 0.0,
            high  = 1.0,
            shape = (self.seq_len, N_AA),
            dtype = np.float32,
        )

        # Action: which (position, amino_acid) to mutate to
        self.action_space = spaces.Discrete(self.seq_len * N_AA)

        # Tracking
        self.best_plddt    = 0.0
        self.best_energy   = float('inf')
        self.reward_history= []
        self.mutation_log  = []
        self.final_summary = {}

    def _encode_sequence(self, sequence: list) -> np.ndarray:
        """One-hot encode the sequence."""
        obs = np.zeros((self.seq_len, N_AA), dtype=np.float32)
        for i, aa in enumerate(sequence):
            idx = AA_TO_IDX.get(aa, 0)
            obs[i, idx] = 1.0
        return obs

    def _decode_action(self, action: int) -> Tuple[int, str]:
        """Decode integer action to (position, amino_acid)."""
        position  = action // N_AA
        aa_idx    = action %  N_AA
        amino_acid= AA_CHARS[aa_idx]
        return position, amino_acid

    def _get_sequence_str(self) -> str:
        return ''.join(self.sequence)

    def reset(
        self,
        seed: Optional[int] = None,
        options: Optional[Dict] = None,
    ) -> Tuple[np.ndarray, Dict]:
        super().reset(seed=seed)

        self.sequence      = list(self.initial_sequence)
        self.step_count    = 0
        self.best_plddt    = 0.0
        self.best_energy   = float('inf')
        self.reward_history= []
        self.mutation_log  = []

        obs  = self._encode_sequence(self.sequence)
        info = {'sequence': self._get_sequence_str(), 'step': 0}
        return obs, info

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        self.step_count += 1
        position, new_aa = self._decode_action(action)
        old_aa = self.sequence[position]
        self.sequence[position] = new_aa

        seq_str = self._get_sequence_str()
        prediction = self.esmfold.predict(seq_str)
        energy_score = self.scorer.score(seq_str, prediction.pdb_string)
        reward_components = self.reward_fn.compute(
            sequence = seq_str,
            plddt    = prediction.plddt,
            energy   = energy_score.total,
        )
        self.best_plddt  = max(self.best_plddt,  prediction.plddt)
        self.best_energy = min(self.best_energy,  energy_score.total)
        self.reward_history.append(reward_components.total)
        self.mutation_log.append({
            'step':     self.step_count,
            'position': position,
            'from':     old_aa,
            'to':       new_aa,
            'plddt':    prediction.plddt,
            'energy':   energy_score.total,
            'reward':   reward_components.total,
        })

        if self.verbose:
            print(
                f'Step {self.step_count:3d} | '
                f'Mut: {old_aa}{position}{new_aa} | '
                f'pLDDT: {prediction.plddt:5.1f} | '
                f'Energy: {energy_score.total:8.1f} | '
                f'Reward: {reward_components.total:.4f}'
            )
        obs = self._encode_sequence(self.sequence)

        terminated = self.step_count >= self.max_steps
        if terminated:
            self.final_summary = self.get_summary()
        truncated  = False

        info = {
            'sequence':    seq_str,
            'plddt':       prediction.plddt,
            'energy':      energy_score.total,
            'reward':      reward_components.total,
            'pdb_string':  prediction.pdb_string,
            'best_plddt':  self.best_plddt,
            'best_energy': self.best_energy,
            'step':        self.step_count,
            'mutation':    f'{old_aa}{position}{new_aa}',
            'components': {
                'plddt':      reward_components.plddt,
                'energy':     reward_components.energy,
                'rmsd':       reward_components.rmsd,
                'solubility': reward_components.solubility,
            }
        }

        return obs, reward_components.total, terminated, truncated, info

    def render(self):
        seq = self._get_sequence_str()
        print(f'Step {self.step_count}/{self.max_steps} | Seq: {seq[:30]}...')

    def get_best_sequence(self) -> str:
        if not self.mutation_log:
            return self._get_sequence_str()
        best = max(self.mutation_log, key=lambda x: x['reward'])
        return self._get_sequence_str()

    def get_summary(self) -> Dict:
        if self.final_summary:
            return self.final_summary
        return {
            'total_steps':   self.step_count,
            'best_plddt':    self.best_plddt,
            'best_energy':   self.best_energy,
            'final_sequence':self._get_sequence_str(),
            'reward_history':self.reward_history,
            'n_mutations':   len(self.mutation_log),
        }
