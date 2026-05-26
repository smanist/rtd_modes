import numpy as np


def _propagator(g_value, horizon):
    """Return the exact propagator for the triangular LTV example."""
    decay = float(np.exp(-float(horizon)))
    return decay * np.array([[1.0, float(g_value)], [0.0, 1.0]], dtype=float)


def _trajectory_from_g(time, g_value, x0=(0.0, 1.0)):
    """Return x(t) for the triangular system once g(t, 0) is known."""
    time = np.asarray(time, dtype=float)
    g_value = np.asarray(g_value, dtype=float)
    initial = np.asarray(x0, dtype=float)
    decay = np.exp(-time)
    x2 = decay * initial[1]
    x1 = decay * (initial[0] + g_value * initial[1])
    states = np.column_stack((x1, x2))
    norms = np.linalg.norm(states, axis=1)
    peak_index = int(np.argmax(norms))
    return {
        "x1": x1.tolist(),
        "x2": x2.tolist(),
        "norm": norms.tolist(),
        "peak_time": float(time[peak_index]),
        "peak_norm": float(norms[peak_index]),
        "peak_x1": float(x1[peak_index]),
        "peak_x2": float(x2[peak_index]),
        "final_g": float(g_value[-1]),
        "max_abs_g": float(np.max(np.abs(g_value))),
    }


def trajectory_family(amplitude=2.5, time_max=6.0, steps=320):
    """Compare several hand-derivable coefficient histories for one initial state."""
    amplitude = float(amplitude)
    time = np.linspace(0.0, float(time_max), int(steps) + 1)
    profiles = (
        (
            "constant",
            "constant",
            amplitude * time,
        ),
        (
            "offset-periodic",
            "offset periodic",
            amplitude * (time + 0.6 * (1.0 - np.cos(time))),
        ),
        (
            "zero-mean periodic",
            "zero-mean periodic",
            amplitude * np.sin(time),
        ),
    )

    traces = []
    for key, label, g_value in profiles:
        trace = _trajectory_from_g(time, g_value)
        trace.update(
            {
                "key": key,
                "label": label,
            }
        )
        traces.append(trace)

    return {
        "amplitude": amplitude,
        "time": time.tolist(),
        "traces": traces,
    }


def state_transition_map(
    amplitude=2.5,
    initial_time=0.0,
    horizon=2.0,
    horizon_max=2.0 * np.pi,
    steps=240,
    circle_samples=181,
):
    """Show how Phi(t, t0) depends on start time for s(t)=beta cos(t)."""
    amplitude = float(amplitude)
    initial_time = float(initial_time)
    horizon_max = float(horizon_max)
    horizon = float(np.clip(horizon, 0.0, horizon_max))
    tau = np.linspace(0.0, horizon_max, int(steps) + 1)
    g_curve = amplitude * (np.sin(initial_time + tau) - np.sin(initial_time))

    sigma_curve = []
    for tau_value, g_value in zip(tau, g_curve):
        sigma_curve.append(
            float(np.linalg.svd(_propagator(g_value, tau_value), compute_uv=False)[0])
        )

    g_selected = amplitude * (np.sin(initial_time + horizon) - np.sin(initial_time))
    phi = _propagator(g_selected, horizon)
    _, singular_values, right_vectors_h = np.linalg.svd(phi)

    optimal_initial = right_vectors_h[0].real
    optimal_image = phi @ optimal_initial
    if optimal_initial[0] < 0.0:
        optimal_initial = -optimal_initial
        optimal_image = -optimal_image

    theta = np.linspace(0.0, 2.0 * np.pi, int(circle_samples), endpoint=True)
    unit_circle = np.vstack((np.cos(theta), np.sin(theta)))
    mapped_circle = phi @ unit_circle

    return {
        "amplitude": amplitude,
        "initial_time": initial_time,
        "horizon": horizon,
        "target_time": float(initial_time + horizon),
        "time_curve": tau.tolist(),
        "sigma_curve": sigma_curve,
        "g_selected": float(g_selected),
        "sigma_selected": float(singular_values[0]),
        "sigma_min_selected": float(singular_values[-1]),
        "phi_11": float(phi[0, 0]),
        "phi_12": float(phi[0, 1]),
        "phi_22": float(phi[1, 1]),
        "circle_x": unit_circle[0].tolist(),
        "circle_y": unit_circle[1].tolist(),
        "mapped_x": mapped_circle[0].tolist(),
        "mapped_y": mapped_circle[1].tolist(),
        "e1_image": (phi @ np.array([1.0, 0.0])).tolist(),
        "e2_image": (phi @ np.array([0.0, 1.0])).tolist(),
        "optimal_initial": optimal_initial.tolist(),
        "optimal_image": optimal_image.tolist(),
        "optimal_angle": float(np.arctan2(optimal_initial[1], optimal_initial[0])),
    }
