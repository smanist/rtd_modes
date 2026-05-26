import numpy as np


DEFAULT_LAM = (-0.1, -0.2)


def sys2d(delta, lam=DEFAULT_LAM):
    """Return the two-dimensional stable non-normal matrix from the notes."""
    delta = float(delta)
    lam1, lam2 = float(lam[0]), float(lam[1])
    lam_sum = lam1 + lam2
    lam_diff = lam1 - lam2
    cosecant = 1.0 / np.sin(2.0 * delta)
    cotangent = 1.0 / np.tan(2.0 * delta)
    return 0.5 * np.array(
        [
            [lam_sum + lam_diff * cosecant, -lam_diff * cotangent],
            [lam_diff * cotangent, lam_sum - lam_diff * cosecant],
        ]
    )


def linear_trajectory(delta, x0=(1.0, 0.1), time_max=100.0, steps=320):
    """Compute the exact linear trajectory using the eigendecomposition."""
    t = np.linspace(0.0, float(time_max), int(steps) + 1)
    x0 = np.asarray(x0, dtype=float)
    eigvals, eigvecs = np.linalg.eig(sys2d(delta))
    coeffs = np.linalg.solve(eigvecs, x0)
    x = eigvecs @ (np.exp(eigvals[:, None] * t[None, :]) * coeffs[:, None])
    x = np.real_if_close(x.T, tol=1000).real
    radii = np.linalg.norm(x, axis=1)
    peak_index = int(np.argmax(radii))
    return {
        "time": t.tolist(),
        "x1": x[:, 0].tolist(),
        "x2": x[:, 1].tolist(),
        "peak_time": float(t[peak_index]),
        "peak_radius": float(radii[peak_index]),
        "final_radius": float(radii[-1]),
    }


def linear_phase_plane(delta=0.2, delta_min=0.05, delta_max=np.pi / 4):
    """Return selected and reference trajectories for the linear phase plane."""
    selected = float(np.clip(delta, delta_min, delta_max))
    deltas = [
        ("minimum delta", float(delta_min), "min"),
        ("selected delta", selected, "selected"),
        ("maximum delta", float(delta_max), "max"),
    ]
    traces = []
    seen = set()
    for label, value, mode in deltas:
        key = round(value, 10)
        if key in seen:
            continue
        seen.add(key)
        trace = linear_trajectory(value)
        trace.update(
            {
                "label": label,
                "delta": value,
                "mode": mode,
                "eigenvector_angle": 2.0 * value,
            }
        )
        traces.append(trace)

    theta = np.linspace(0.0, np.pi / 2.0, 100)
    return {
        "selected_delta": selected,
        "selected_angle": 2.0 * selected,
        "traces": traces,
        "region_x": (2.0 * np.cos(theta)).tolist(),
        "region_y": (2.0 * np.sin(theta)).tolist(),
    }


def f_linear(y, delta=0.05):
    return sys2d(delta) @ y


def f_nonlinear(y, delta=0.05, lam=DEFAULT_LAM, rr=1.0):
    """Blend a stable non-normal linearization with a radius-two limit cycle."""
    y = np.asarray(y, dtype=float)
    a = sys2d(delta, lam)
    radius = float(np.linalg.norm(y))
    blend = np.exp(-10.0 * (radius - 1.8))
    blend = blend / (1.0 + blend)

    radial = -(radius**2) * (radius - 2.0)
    outer = np.array([-y[1] + y[0] * radial, y[0] + y[1] * radial])
    return float(rr) * outer * (1.0 - blend) + (a @ y) * blend


def rk4_trajectory(kind, x0=(0.4, 0.1), delta=0.05, time_max=50.0, steps=900):
    """Integrate the selected phase-plane model with a fixed-step RK4 method."""
    steps = int(steps)
    time_max = float(time_max)
    h = time_max / steps
    t = np.linspace(0.0, time_max, steps + 1)
    x = np.zeros((steps + 1, 2), dtype=float)
    x[0] = np.asarray(x0, dtype=float)

    if kind == "linear":
        model = f_linear
    elif kind == "nonlinear":
        model = f_nonlinear
    else:
        raise ValueError(f"Unknown trajectory kind: {kind}")

    def rhs(y):
        return model(y, delta)

    for i in range(steps):
        y = x[i]
        k1 = rhs(y)
        k2 = rhs(y + 0.5 * h * k1)
        k3 = rhs(y + 0.5 * h * k2)
        k4 = rhs(y + h * k3)
        x[i + 1] = y + h * (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0

    radii = np.linalg.norm(x, axis=1)
    peak_index = int(np.argmax(radii))
    return {
        "time": t.tolist(),
        "x1": x[:, 0].tolist(),
        "x2": x[:, 1].tolist(),
        "peak_time": float(t[peak_index]),
        "peak_radius": float(radii[peak_index]),
        "final_radius": float(radii[-1]),
    }


def nonlinear_phase_plane(initial_x1=0.4, initial_x2=0.1, delta=0.05):
    """Return nonlinear and linear comparison trajectories for one initial state."""
    x0 = (float(initial_x1), float(initial_x2))
    theta = np.linspace(0.0, 2.0 * np.pi, 180)
    nonlinear = rk4_trajectory("nonlinear", x0=x0, delta=delta)
    linear = rk4_trajectory("linear", x0=x0, delta=delta)
    return {
        "initial_x1": x0[0],
        "initial_x2": x0[1],
        "delta": float(delta),
        "nonlinear": nonlinear,
        "linear": linear,
        "cycle_x": (2.0 * np.cos(theta)).tolist(),
        "cycle_y": (2.0 * np.sin(theta)).tolist(),
    }
