import os
import tempfile
from dataclasses import dataclass
from typing import Optional


@dataclass
class EnergyScore:
    total:    float
    per_residue: float
    sequence: str


class PyRosettaScorer:
    """
    Wrapper around PyRosetta for thermodynamic stability scoring.
    Development mode: simulates energy based on sequence properties.
    Production mode: uses real PyRosetta REF15 scorefunction.
    Set PYROSETTA_REAL=1 + valid license to use real scoring.
    License: https://els2.comotion.uw.edu/product/pyrosetta
    """

    def __init__(self):
        self.use_real = os.environ.get('PYROSETTA_REAL', '0') == '1'
        self.sfxn = None

        if self.use_real:
            self._init_pyrosetta()
        else:
            print(
                '[PyRosetta] Running in simulation mode. Set PYROSETTA_REAL=1 for real scoring.')

    def _init_pyrosetta(self):
        try:
            import pyrosetta
            pyrosetta.init('-mute all')
            self.sfxn = pyrosetta.get_fa_scorefxn()
            print('[PyRosetta] Initialised with REF15 scorefunction.')
        except ImportError:
            print('[PyRosetta] Not installed. Falling back to simulation.')
            self.use_real = False
        except Exception as e:
            print(f'[PyRosetta] Init failed: {e}. Falling back to simulation.')
            self.use_real = False

    def _simulate_score(self, sequence: str, pdb_string: Optional[str] = None) -> EnergyScore:
        """
        Simulate Rosetta energy based on sequence biochemistry.
        Approximates REF15 behaviour without the real software.
        """
        import hashlib
        import random
        import numpy as np

        HYDROPHOBIC = set('VILMFYWCA')
        CHARGED = set('DEKRH')
        HELIX_FORMER = set('AELM')
        PROLINE = 'P'

        seq = sequence.upper()
        n = len(seq)
        base_energy = -n * 3.5
        hydrophobic_frac = sum(1 for aa in seq if aa in HYDROPHOBIC) / n
        packing_bonus = -hydrophobic_frac * n * 4.0
        charged_frac = sum(1 for aa in seq if aa in CHARGED) / n
        charge_penalty = charged_frac * n * 1.5
        proline_count = seq.count(PROLINE)
        proline_penalty = proline_count * 2.0
        helix_frac = sum(1 for aa in seq if aa in HELIX_FORMER) / n
        helix_bonus = -helix_frac * n * 1.2
        seed = int(hashlib.md5(seq.encode()).hexdigest()[:8], 16)
        noise = random.Random(seed).uniform(-n * 0.5, n * 0.5)

        total = base_energy + packing_bonus + charge_penalty + \
            proline_penalty + helix_bonus + noise

        return EnergyScore(
            total=round(total, 2),
            per_residue=round(total / n, 3),
            sequence=sequence,
        )

    def _real_score(self, sequence: str, pdb_string: str) -> EnergyScore:
        """Score using real PyRosetta REF15."""
        import pyrosetta

        with tempfile.NamedTemporaryFile(suffix='.pdb', mode='w', delete=False) as f:
            f.write(pdb_string)
            tmp_path = f.name

        try:
            pose = pyrosetta.pose_from_pdb(tmp_path)
            total = self.sfxn(pose)
            return EnergyScore(
                total=round(total, 2),
                per_residue=round(total / len(sequence), 3),
                sequence=sequence,
            )
        finally:
            os.unlink(tmp_path)

    def score(self, sequence: str, pdb_string: Optional[str] = None) -> EnergyScore:
        """Score a protein sequence/structure."""
        if self.use_real and self.sfxn is not None and pdb_string:
            return self._real_score(sequence, pdb_string)
        return self._simulate_score(sequence, pdb_string)
