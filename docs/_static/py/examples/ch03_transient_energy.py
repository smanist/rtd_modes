import numpy as np


def transient_energy(coupling=8.0, time_max=6.0, steps=320):
    """Compute transient energy for the hand-derived 2x2 non-normal system."""
    t = np.linspace(0.0, float(time_max), int(steps) + 1)
    exp1 = np.exp(-t)
    exp2 = np.exp(-2.0 * t)
    x1 = float(coupling) * (exp1 - exp2)
    x2 = exp2
    energy = x1**2 + x2**2
    peak_index = int(np.argmax(energy))

    return {
        "time": t.tolist(),
        "energy": energy.tolist(),
        "peak_time": float(t[peak_index]),
        "peak_energy": float(energy[peak_index]),
    }
