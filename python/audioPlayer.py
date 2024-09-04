from os import environ
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'

import pygame
import sys
import time

paused = False

pygame.mixer.init()

sys.stdout.write("Ready to load audio")
sys.stdout.flush()

def load_audio_file(audio_path):
    pygame.mixer.music.load(audio_path)
    global paused
    paused = False
    sys.stdout.write("Audio loaded")
    sys.stdout.flush()

def play_audio():
    global paused
    if not paused:
        pygame.mixer.music.play()
    else:
        pygame.mixer.music.unpause()
    paused = False
    sys.stdout.write("Playing audio")
    sys.stdout.flush()

def pause_audio():
    global paused
    paused = True
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
        time.sleep(0.05)
except Exception as e:
    sys.stdout.write(f"An error occurred: {e}")
    sys.stdout.flush()
finally:
    pygame.mixer.music.stop()
    pygame.mixer.quit()
