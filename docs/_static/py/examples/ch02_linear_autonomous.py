import numpy as np


PHASE_CASES = {
    "stable_node": {
        "label": "stable node",
        "matrix": np.array([[-1.0, 0.0], [0.0, -0.35]], dtype=float),
        "description": "Both eigenvalues are real and negative, so every trajectory decays to the origin along eigendirections.",
        "time_max": 8.0,
    },
    "saddle": {
        "label": "saddle",
        "matrix": np.array([[0.6, 0.0], [0.0, -0.8]], dtype=float),
        "description": "One eigenvalue is positive and one is negative, so one eigendirection grows while the other decays.",
        "time_max": 3.0,
    },
    "center": {
        "label": "center",
        "matrix": np.array([[0.0, -1.0], [1.0, 0.0]], dtype=float),
        "description": "A purely imaginary conjugate pair produces bounded oscillation on closed orbits.",
        "time_max": 10.0,
    },
    "spiral_sink": {
        "label": "spiral sink",
        "matrix": np.array([[-0.2, -1.0], [1.0, -0.2]], dtype=float),
        "description": "A complex conjugate pair with negative real part produces decaying rotation.",
        "time_max": 12.0,
    },
}


def _trajectory(matrix, initial_state, time_max, steps):
    time = np.linspace(0.0, float(time_max), int(steps) + 1)
    eigvals, eigvecs = np.linalg.eig(matrix)
    coeffs = np.linalg.solve(eigvecs, np.asarray(initial_state, dtype=float))
    states = eigvecs @ (np.exp(eigvals[:, None] * time[None, :]) * coeffs[:, None])
    states = np.real_if_close(states.T, tol=1000).real
    return {
        "x1": states[:, 0].tolist(),
        "x2": states[:, 1].tolist(),
    }


def canonical_phase_portrait(case_key="stable_node", angle=0.6, radius=1.0, steps=280):
    case = PHASE_CASES.get(case_key, PHASE_CASES["stable_node"])
    matrix = case["matrix"]
    time_max = case["time_max"]
    eigvals, eigvecs = np.linalg.eig(matrix)

    sample_angles = np.linspace(0.0, 2.0 * np.pi, 9)[:-1]
    trajectories = []
    for index, theta in enumerate(sample_angles):
        initial_state = radius * np.array([np.cos(theta), np.sin(theta)], dtype=float)
        trace = _trajectory(matrix, initial_state, time_max, steps)
        trace.update(
            {
                "label": f"reference {index + 1}",
                "mode": "reference",
            }
        )
        trajectories.append(trace)

    selected_state = radius * np.array([np.cos(angle), np.sin(angle)], dtype=float)
    selected = _trajectory(matrix, selected_state, time_max, steps)
    selected.update(
        {
            "label": "selected",
            "mode": "selected",
            "initial_x1": float(selected_state[0]),
            "initial_x2": float(selected_state[1]),
        }
    )
    trajectories.append(selected)

    eigenvectors = []
    for index, eigval in enumerate(eigvals):
        if abs(float(np.imag(eigval))) > 1.0e-9:
            continue

        vector = np.real_if_close(eigvecs[:, index], tol=1000).real
        norm = np.linalg.norm(vector)
        if norm < 1.0e-12:
            continue

        vector = vector / norm
        eigenvectors.append(
            {
                "label": f"phi_{index + 1}",
                "x1": float(vector[0]),
                "x2": float(vector[1]),
            }
        )

    return {
        "case_key": case_key,
        "case_label": case["label"],
        "description": case["description"],
        "time": np.linspace(0.0, float(time_max), int(steps) + 1).tolist(),
        "time_max": float(time_max),
        "matrix": matrix.tolist(),
        "eigenvalues_real": np.real(eigvals).tolist(),
        "eigenvalues_imag": np.imag(eigvals).tolist(),
        "trajectories": trajectories,
        "eigenvectors": eigenvectors,
    }


def two_dof_modal_superposition(eta1_0=1.0, eta2_0=0.0, time_max=18.0, steps=360):
    omega1 = 1.0
    omega2 = float(np.sqrt(3.0))
    u1 = np.array([1.0, 1.0], dtype=float) / np.sqrt(2.0)
    u2 = np.array([1.0, -1.0], dtype=float) / np.sqrt(2.0)

    time = np.linspace(0.0, float(time_max), int(steps) + 1)
    eta1 = float(eta1_0) * np.cos(omega1 * time)
    eta2 = float(eta2_0) * np.cos(omega2 * time)

    mode1 = eta1[:, None] * u1[None, :]
    mode2 = eta2[:, None] * u2[None, :]
    displacement = mode1 + mode2

    return {
        "time": time.tolist(),
        "omega1": omega1,
        "omega2": omega2,
        "u1": u1.tolist(),
        "u2": u2.tolist(),
        "eta1_0": float(eta1_0),
        "eta2_0": float(eta2_0),
        "eta1": eta1.tolist(),
        "eta2": eta2.tolist(),
        "q1": displacement[:, 0].tolist(),
        "q2": displacement[:, 1].tolist(),
        "q0": displacement[0].tolist(),
        "mode1_q1": mode1[:, 0].tolist(),
        "mode1_q2": mode1[:, 1].tolist(),
        "mode2_q1": mode2[:, 0].tolist(),
        "mode2_q2": mode2[:, 1].tolist(),
    }
