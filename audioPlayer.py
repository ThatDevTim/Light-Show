from os import environ
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'

import pygame
import sys
import time

pygame.mixer.init()

sys.stdout.write("Ready to load audio")
sys.stdout.flush()

def load_audio_file(audio_path):
    pygame.mixer.music.load(audio_path)
    sys.stdout.write("Audio loaded")
    sys.stdout.flush()

def play_audio():
    pygame.mixer.music.play()
    sys.stdout.write("Playing audio")
    sys.stdout.flush()

def pause_audio():
    pygame.mixer.music.pause()
    sys.stdout.write("Paused audio")
    sys.stdout.flush()

try:
    for line in sys.stdin:
        command = line.strip()
        if command.startswith('load '):
            _, path = command.split(maxsplit=1)
            load_audio_file(path)
        elif command == 'play':
            play_audio()
        elif command == 'pause':
            pause_audio()
        elif command == 'exit':
            break
        time.sleep(0.1)
except Exception as e:
    sys.stdout.write(f"An error occurred: {e}")
    sys.stdout.flush()
finally:
    pygame.mixer.music.stop()
    pygame.mixer.quit()
