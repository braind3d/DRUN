"Output methods for the LocationThread, reading from current_location."

from __future__ import absolute_import
from typing import List


def debug_output(current_location: List[float], fps: float = 1.0) -> None:
    """Prints location data in the stdout at a given rate.

    Args:
        current_location (List[float]): Cross-thread location data.
        fps (float, optional): Rate data to be printed at. Defaults to 1.0.
    """


def network_output(
        current_location: List[float],
        ip_address: str,
        port: int,
        fps: float = 1.0
) -> None:
    """Connects to a given socket and forwards location data at a given rate.

    Args:
        current_location (List[float]): Cross-thread location data.
        ip_address (str): IP address of the server.
        port (int): TCP port on the server for communication.
        fps (float, optional): Rate data to be send at. Defaults to 1.0.
    """