import numpy as np


def _propagator(coupling, time):
    """Return exp(A t) for A=[[-1,K],[0,-2]] on scalar or array time."""
    time = np.asarray(time, dtype=float)
    exp1 = np.exp(-time)
    exp2 = np.exp(-2.0 * time)
    result = np.zeros(time.shape + (2, 2), dtype=float)
    result[..., 0, 0] = exp1
    result[..., 0, 1] = coupling * (exp1 - exp2)
    result[..., 1, 1] = exp2
    return result


def initial_gain(coupling=8.0, target_time=1.5, time_max=6.0, steps=320):
    """Compare max- and min-gain initial conditions at one target time."""
    coupling = float(coupling)
    target_time = float(np.clip(target_time, 0.0, float(time_max)))
    time = np.linspace(0.0, float(time_max), int(steps) + 1)
    time = np.unique(np.append(time, target_time))

    target_propagator = _propagator(coupling, target_time)
    _, singular_values, right_vectors_h = np.linalg.svd(target_propagator)
    propagators = _propagator(coupling, time)
    target_index = int(np.argmin(np.abs(time - target_time)))

    trajectories = []
    for label, mode, index in (
        ("maximum gain", "max", 0),
        ("minimum gain", "min", len(singular_values) - 1),
    ):
        initial = right_vectors_h[index].real
        if initial[0] < 0:
            initial = -initial

        states = np.einsum("tij,j->ti", propagators, initial)
        norm = np.linalg.norm(states, axis=1)
        achieved = states[target_index]

        trajectories.append(
            {
                "label": label,
                "mode": mode,
                "gain": float(singular_values[index]),
                "initial_x1": float(initial[0]),
                "initial_x2": float(initial[1]),
                "target_x1": float(achieved[0]),
                "target_x2": float(achieved[1]),
                "x1": states[:, 0].tolist(),
                "x2": states[:, 1].tolist(),
                "norm": norm.tolist(),
            }
        )

    return {
        "coupling": coupling,
        "target_time": target_time,
        "time": time.tolist(),
        "trajectories": trajectories,
        "condition_number": float(singular_values[0] / singular_values[-1]),
    }
