import torch
import torch.nn as nn
import numpy as np
from stable_baselines3.common.policies import ActorCriticPolicy
from stable_baselines3.common.torch_layers import BaseFeaturesExtractor
import gymnasium as gym


class SequenceEncoder(BaseFeaturesExtractor):
    """
    Feature extractor for protein sequences.

    Takes one-hot encoded sequence (seq_len x 20) and produces
    a fixed-size feature vector using a 1D CNN + attention.

    In production this will be replaced by a GNN that operates
    on the 3D structure graph. For the initial version we use
    a sequence-based encoder that captures local patterns.
    """

    def __init__(
        self,
        observation_space: gym.Space,
        features_dim:      int = 256,
    ):
        super().__init__(observation_space, features_dim)
        seq_len, n_aa = observation_space.shape
        self.conv_layers = nn.Sequential(
            nn.Conv1d(n_aa, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Conv1d(64, 128, kernel_size=7, padding=3),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Conv1d(128, 256, kernel_size=15, padding=7),
            nn.ReLU(),
            nn.BatchNorm1d(256),
        )
        self.attention = nn.MultiheadAttention(
            embed_dim=256,
            num_heads=8,
            batch_first=True,
            dropout=0.1,
        )
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.proj = nn.Sequential(
            nn.Linear(256, features_dim),
            nn.ReLU(),
            nn.LayerNorm(features_dim),
        )

    def forward(self, observations: torch.Tensor) -> torch.Tensor:
        x = observations.permute(0, 2, 1)
        x = self.conv_layers(x)
        x = x.permute(0, 2, 1)
        x, _ = self.attention(x, x, x)
        x = x.permute(0, 2, 1)
        x = self.pool(x).squeeze(-1)
        x = self.proj(x)
        return x


def make_policy_kwargs(observation_space: gym.Space) -> dict:
    """Return policy_kwargs for PPO with our custom feature extractor."""
    return {
        'features_extractor_class':  SequenceEncoder,
        'features_extractor_kwargs': {'features_dim': 256},
        'net_arch': {
            'pi': [256, 128],
            'vf': [256, 128],
        },
        'activation_fn': nn.ReLU,
    }
