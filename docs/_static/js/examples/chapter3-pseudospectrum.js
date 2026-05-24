(function () {
  "use strict";

  const {
    loadPlotly,
    loadPyodideRuntime,
    makeRangeControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
    staticAssetUrl,
  } = window.CourseInteractives;

  let pseudospectrumPromise = null;
  const pseudospectrumSource = String.raw`import numpy as np


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
        "numerical_range_real": numerical_range.real.tolist(),
        "numerical_range_imag": numerical_range.imag.tolist(),
        "numerical_abscissa": numerical_abscissa,
        "epsilon_min": float(np.min(sigma_min)),
        "epsilon_max": float(np.max(sigma_min)),
    }
`;

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch03_pseudospectrum.py");
    if (window.location.protocol === "file:") {
      return pseudospectrumSource;
    }

    let response;
    try {
      response = await fetch(sourceUrl);
    } catch (error) {
      throw loadError(`Python source fetch failed (${sourceUrl})`, error);
    }
    if (!response.ok) {
      throw loadError(
        "Python source fetch failed",
        new Error(`${response.status} ${response.statusText}: ${sourceUrl}`)
      );
    }

    return response.text();
  }

  async function loadPseudospectrumFunction() {
    if (!pseudospectrumPromise) {
      pseudospectrumPromise = (async () => {
        let pyodide;
        try {
          pyodide = await loadPyodideRuntime();
        } catch (error) {
          throw loadError("Pyodide runtime failed to load", error);
        }

        try {
          await pyodide.loadPackage("numpy");
        } catch (error) {
          throw loadError("NumPy package failed to load", error);
        }

        try {
          pyodide.runPython(await loadPythonSource());
          return pyodide.globals.get("pseudospectrum");
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return pseudospectrumPromise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computePseudospectrum(pseudospectrum, coupling, realMin, realMax, imagMax, points) {
    try {
      return pyProxyToObject(pseudospectrum(coupling, realMin, realMax, imagMax, points));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  async function initChapter3Pseudospectrum(element) {
    const [plotly, pseudospectrum] = await Promise.all([
      loadPlotly(),
      loadPseudospectrumFunction(),
    ]);
    let coupling = numberFromDataset(element, "k", 8);
    const baseRealMin = numberFromDataset(element, "realMin", -4);
    const baseRealMax = numberFromDataset(element, "realMax", 2);
    const baseImagMax = numberFromDataset(element, "imagMax", 3);
    const points = numberFromDataset(element, "points", 151);
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Pseudospectrum and Numerical Range";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const requestId = drawRequest += 1;
      const currentRealMax = Math.max(
        baseRealMax,
        (-3 + Math.sqrt(1 + coupling * coupling)) / 2 + 0.75
      );
      const currentImagMax = Math.max(baseImagMax, 0.55 * Math.max(coupling, 1));
      const data = computePseudospectrum(
        pseudospectrum,
        coupling,
        baseRealMin,
        currentRealMax,
        currentImagMax,
        points
      );
      if (requestId !== drawRequest) {
        return;
      }

      readout.textContent =
        `K = ${data.coupling.toFixed(1)}; right edge of W(A) at Re z = ` +
        `${data.numerical_abscissa.toFixed(3)}; contours show log10 epsilon.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            type: "contour",
            x: data.real,
            y: data.imag,
            z: data.log_sigma_min,
            contours: {
              coloring: "lines",
              start: -4,
              end: 0,
              size: 1,
              showlabels: true,
              labelformat: ".0f",
            },
            line: { width: 2 },
            colorscale: [
              [0, "#7b4f9d"],
              [0.33, "#2f6f73"],
              [0.66, "#bc4b51"],
              [1, "#111827"],
            ],
            hovertemplate: "Re z=%{x:.2f}<br>Im z=%{y:.2f}<br>log10 epsilon=%{z:.2f}<extra></extra>",
            name: "log10 epsilon contours",
            showscale: false,
          },
          {
            x: data.numerical_range_real,
            y: data.numerical_range_imag,
            mode: "lines",
            line: { color: "#111827", width: 3, dash: "dash" },
            name: "W(A) boundary",
          },
          {
            x: data.eigen_real,
            y: data.eigen_imag,
            mode: "markers",
            marker: { color: "#bc4b51", size: 10, symbol: "x" },
            name: "eigenvalues",
          },
          {
            x: [0, 0],
            y: [-currentImagMax, currentImagMax],
            mode: "lines",
            line: { color: "#6b7280", width: 1.5, dash: "dot" },
            hoverinfo: "skip",
            name: "imaginary axis",
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 60 },
          xaxis: {
            title: "Re z",
            range: [baseRealMin, currentRealMax],
            zeroline: false,
          },
          yaxis: {
            title: "Im z",
            range: [-currentImagMax, currentImagMax],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: false,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.1 },
          annotations: [
            {
              x: data.numerical_abscissa,
              y: 0,
              text: "right edge of W(A)",
              showarrow: true,
              arrowhead: 2,
              ax: 35,
              ay: -35,
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Coupling K",
        min: 0,
        max: 20,
        step: 0.5,
        value: coupling,
        onInput: (value) => {
          coupling = value;
          if (!isMounted) {
            return;
          }

          draw().catch((error) => {
            readout.textContent = "The Python calculation could not be updated.";
            console.error(error);
          });
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter3-pseudospectrum", initChapter3Pseudospectrum);
})();
