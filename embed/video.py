import numpy as np
import matplotlib.pyplot as plt
from moviepy.editor import VideoClip
from moviepy.video.io.bindings import mplfig_to_npimage

x = np.linspace(-3, 3, 100)
fig, ax = plt.subplots()

def step(i, ylow = -2, yhigh = 2):
    ax.clear()
    ax.plot(x, np.cos(x + i), lw = 2)
    ax.set_ylim(ylow, yhigh)
    return mplfig_to_npimage(fig)

video = VideoClip(step, duration = 5) # seconds
video.write_videofile('video.mp4', fps = 30)
