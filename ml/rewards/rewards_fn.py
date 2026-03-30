import numpy as np
from typing import Optional
from dataclasses import dataclass


@dataclass
class RewardComponents:
    plddt: float
    energy: float
    rmsd: float
    solubility: float
    total: float


class RewardFunction:
    """ 
    Composite reward function for protein design.
     Combines:
    - pLDDT confidence score (ESMFold)
    - Rosetta energy score (PyRosetta)
    - RMSD from target structure (BioPython)
    - Solubility proxy (Kyte-Doolittle scale)
    """
    KYTE_DOOLITTLE = {
        'A':  1.8, 'C':  2.5, 'D': -3.5, 'E': -3.5,
        'F':  2.8, 'G': -0.4, 'H': -3.2, 'I':  4.5,
        'K': -3.9, 'L':  3.8, 'M':  1.9, 'N': -3.5,
        'P': -1.6, 'Q': -3.5, 'R': -4.5, 'S': -0.8,
        'T': -0.7, 'V':  4.2, 'W': -0.9, 'Y': -1.3,
    }

    def __init__(
        self,
        plddt_weight: float = 0.40,
        energy_weight: float = 0.30,
        rmsd_weight:       float = 0.20,
        solubility_weight: float = 0.10,
        plddt_threshold:   float = 70.0,
    ):
        self.plddt_weight = plddt_weight
        self.energy_weight = energy_weight
        self.rmsd_weight = rmsd_weight
        self.solubility_weight = solubility_weight
        self.plddt_threshold = plddt_threshold
        total = plddt_weight + energy_weight + rmsd_weight + solubility_weight
        self.plddt_weight /= total
        self.energy_weight /= total
        self.rmsd_weight /= total
        self.solubility_weight /= total

    def compute_plddt_reward(self, plddt: float) -> float:
        """Normalise pLDDT to [0, 1]. Bonus for exceeding threshold."""
        base = np.clip(plddt / 100.0, 0.0, 1.0)
        bonus = 0.1 if plddt >= self.plddt_threshold else 0.0
        return min(1.0, base + bonus)

    def compute_energy_reward(self, energy: float) -> float:
        """ 
        Convert Rosetta energy to reward.
        Lower energy = more stable = higher reward.
        Typical range: 0 to -300 REU.
        """
        normalised = -energy/300.0
        return float(np.clip(normalised, 0.0, 1.0))

    def compute_rmsd_reward(self, rmsd: Optional[float]) -> float:
        """
        Convert RMSD to reward.
        Lower RMSD = closer to target = higher reward.
        If no target, return neutral 0.5.
        """
        if rmsd is None:
            return 0.5
        return float(1.0 / (1.0 + rmsd))

    def compute_solubility_reward(self, sequence: str) -> float:
        """
        Kyte-Doolittle hydrophobicity proxy for solubility.
        More negative = more hydrophilic = more soluble.
        """
        score = [
            self.KYTE_DOOLITTLE.get(aa.upper(), 0.0)
            for aa in sequence
        ]
        if not score:
            return 0.5
        mean_score = np.mean(score)
        normalised = (-mean_score + 4.5) / 9.0
        return float(np.clip(normalised, 0.0, 1.0))

    def compute(
        self,
        sequence: str,
        plddt:    float,
        energy:   float,
        rmsd:     Optional[float] = None,
    ) -> RewardComponents:
        r_plddt = self.compute_plddt_reward(plddt)
        r_energy = self.compute_energy_reward(energy)
        r_rmsd = self.compute_rmsd_reward(rmsd)
        r_solubility = self.compute_solubility_reward(sequence)

        total = (
            self.plddt_weight * r_plddt +
            self.energy_weight * r_energy +
            self.rmsd_weight * r_rmsd +
            self.solubility_weight * r_solubility
        )
        return RewardComponents(
            plddt=r_plddt,
            energy=r_energy,
            rmsd=r_rmsd,
            solubility=r_solubility,
            total=float(np.clip(total, 0.0, 1.0)),
        )
