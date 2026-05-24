import numpy as np


def transient_energy(coupling=8.0, time_max=6.0, steps=320):
    """Compute transient energy for the hand-derived 2x2 non-normal system."""
    coupling = float(coupling)
    t = np.linspace(0.0, float(time_max), int(steps) + 1)
    exp1 = np.exp(-t)
    exp2 = np.exp(-2.0 * t)
    x1 = coupling * (exp1 - exp2)
    x2 = exp2
    energy = x1**2 + x2**2
    peak_index = int(np.argmax(energy))
    hermitian_part = np.array([[-1.0, 0.5 * coupling], [0.5 * coupling, -2.0]])
    numerical_abscissa = float(np.linalg.eigvalsh(hermitian_part)[-1])
    initial_energy = float(energy[0])
    numerical_abscissa_energy_rate = 2.0 * numerical_abscissa * initial_energy
    initial_state = np.array([0.0, 1.0])
    actual_initial_energy_rate = float(
        2.0 * initial_state @ hermitian_part @ initial_state
    )

    return {
        "time": t.tolist(),
        "energy": energy.tolist(),
        "peak_time": float(t[peak_index]),
        "peak_energy": float(energy[peak_index]),
        "numerical_abscissa": numerical_abscissa,
        "numerical_abscissa_energy_rate": float(numerical_abscissa_energy_rate),
        "actual_initial_energy_rate": actual_initial_energy_rate,
    }
