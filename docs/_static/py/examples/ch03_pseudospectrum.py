import numpy as np


def _sigma_min_grid(coupling, real_grid, imag_grid):
    """Return sigma_min(zI-A) for A=[[-1,K],[0,-2]] on a complex grid."""
    z = real_grid + 1j * imag_grid
    a = z + 1.0
    d = z + 2.0
    trace = np.abs(a) ** 2 + np.abs(d) ** 2 + coupling**2
    determinant = np.abs(a) ** 2 * np.abs(d) ** 2
    discriminant = np.maximum(trace**2 - 4.0 * determinant, 0.0)
    sigma_min_squared = 0.5 * (trace - np.sqrt(discriminant))
    return np.sqrt(np.maximum(sigma_min_squared, 0.0))


def _numerical_range_boundary(coupling, samples):
    """Sample the boundary of W(A) using supporting Hermitian parts."""
    a = np.array([[-1.0, coupling], [0.0, -2.0]], dtype=complex)
    theta = np.linspace(0.0, 2.0 * np.pi, int(samples), endpoint=True)
    boundary = np.empty(theta.shape, dtype=complex)

    for index, angle in enumerate(theta):
        rotated = np.exp(-1j * angle) * a
        hermitian = 0.5 * (rotated + rotated.conj().T)
        _, vectors = np.linalg.eigh(hermitian)
        vector = vectors[:, -1]
        boundary[index] = np.vdot(vector, a @ vector)

    return boundary


def pseudospectrum(coupling=8.0, real_min=-4.0, real_max=2.0, imag_max=3.0, points=151):
    """Compute pseudospectral levels and numerical range for the chapter 3 matrix."""
    coupling = float(coupling)
    points = int(points)
    real = np.linspace(float(real_min), float(real_max), points)
    imag = np.linspace(-float(imag_max), float(imag_max), points)
    real_grid, imag_grid = np.meshgrid(real, imag)
    sigma_min = _sigma_min_grid(coupling, real_grid, imag_grid)
    log_sigma_min = np.log10(np.maximum(sigma_min, 1e-12))
    numerical_range = _numerical_range_boundary(coupling, 361)
    hermitian_part = np.array([[-1.0, 0.5 * coupling], [0.5 * coupling, -2.0]])
    numerical_abscissa = float(np.linalg.eigvalsh(hermitian_part)[-1])

    return {
        "coupling": coupling,
        "real": real.tolist(),
        "imag": imag.tolist(),
        "log_sigma_min": log_sigma_min.tolist(),
        "eigen_real": [-1.0, -2.0],
        "eigen_imag": [0.0, 0.0],
        "numerical_range_real": np.real(numerical_range).tolist(),
        "numerical_range_imag": np.imag(numerical_range).tolist(),
        "numerical_abscissa": numerical_abscissa,
        "epsilon_min": float(np.min(sigma_min)),
        "epsilon_max": float(np.max(sigma_min)),
    }
