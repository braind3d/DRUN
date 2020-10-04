"Input methods for the ImageThread, modifying current_image."

from __future__ import absolute_import
import socket

import numpy as np

import cv2

def camera_input(current_image: np.ndarray) -> None:
    """Reads data from the drone camera and stores it in the shared buffer.

    Args:
        current_image (np.ndarray): Cross-thread image data.
    """
    from pyardrone import ARDrone
    from pyardrone.video import VideoMixin

    drone = ARDrone()
    current_image = drone.frame

def recvall(sock): # Function to read the whole data recieved before loading to ndarray
    BUFF_SIZE = 4096 # 4 KiB
    data = b''
    while True:
        part = sock.recv(BUFF_SIZE)
        data += part
        if len(part) < BUFF_SIZE:
            # either 0 or end of data
            break
    return data

def network_input(current_image: np.ndarray, port: int) -> None:
    """Creates a socket for listening for received drone image frames.

    Args:
        current_image (np.ndarray): Cross-thread image data.
        port (int): TCP port a socket to be created on for listening.
    """
    print('ImageThread > network_input')
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as rsock:
        rsock.bind(('localhost', port))
        print('Socket binded')
        rsock.listen()
        print('Socket listnening')
        conn, addr = rsock.accept()
        with conn:
            print('Image Input established')
            while True:
                data = recvall(conn)
                current_image = np.loads(data)