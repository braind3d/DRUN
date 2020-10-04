"""Custom AirSim gym environment with depth camera observation."""
from __future__ import absolute_import
from typing import List

import numpy as np
import gym
from gym.utils import seeding

from drun_airsim_client import DRUNAirSimClient


class AirSimRegularEnv(gym.Env):
    """Custom AirSim gym environment with regular camera observation."""

    def __init__(self):
        self.observation_space = gym.spaces.Box(
            low=0, high=255, shape=(256, 256, 3))
        self.state = np.zeros((256, 256, 3), dtype=np.uint8)

        # Action space definition
        # [Forward, Left, Backward, Right, Up, Down, CW, CCW]
        self.action_space = gym.spaces.Discrete(8)

        self._seed()
        self.home = [0.0, 0.0, -30.0]
        self.goal = [100.0, -100.0]
        self.position = self.home

        self.current_episode = 0
        self.current_step = 0

        self.default_history = {
            "reward": [0],
            "distance": [0],
            "action": [0]
        }
        self.history = self.default_history.copy()
        self.client = DRUNAirSimClient()

    def step(self, action):
        self.history["action"].append(action)
        self.current_step += 1

        current_move = [0 for _ in range(8)]
        current_move[action] = 1
        self.client.move(*current_move, duration=1)

        collided = self.client.get_collisions().has_collided
        self.position = self.client.get_pose().position
        self.position = self.client.calculate_normalized_point(
            [self.position.x_val, self.position.y_val],
            self.home,
            self.goal
        )

        if collided:
            episode_done = True
            reward = -100.0
            distance = self._calculate_distance(self.goal)
        else:
            episode_done = False
            reward, distance = self._calculate_reward()

        if distance < 30:
            episode_done = True
            reward = 100.0

        self.history["reward"].append(reward)
        self.history["distance"].append(distance)

        self.state = self.client.get_observation_regular()

        print(self.history["reward"])
        return self.state, reward, episode_done, self.position

    def reset(self):
        self.client.simulation_reset()
        self.client.set_pose(position=(0, 0, -30))
        self.client.takeoff()

        self.current_episode += 1
        self.current_step = 0
        self.history = self.default_history.copy()

        return self.client.get_observation_regular()

    def render(self, mode="none") -> None:
        pass

    def set_home(self, new_home: List[int]) -> None:
        """Changes the environment home.

        Args:
            new_home (List[int]): New home coordinates.
        """
        self.home = new_home.copy()

    def set_goal(self, new_goal: List[int]) -> None:
        """Changes the environment goal.

        Args:
            new_goal (List[int]): New goal coordinates.
        """
        self.goal = new_goal.copy()

    def get_state(self):
        return self.client.get_observation_regular()

    def _calculate_reward(self):
        distance_now = self._calculate_distance(self.goal)
        distance_before = self.history["distance"][-1]

        reward = -0.0001
        reward = reward + (distance_before - distance_now)

        return reward, distance_now

    def _calculate_distance(self, goal):
        distance = np.power((goal[0]-self.position[0]), 2)
        distance += np.power((goal[1]-self.position[1]), 2)
        return np.sqrt(distance)

    def _seed(self, seed=None):
        self.np_random, seed = seeding.np_random(seed)
        return [seed]
