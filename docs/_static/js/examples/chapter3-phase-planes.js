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

  let phasePlanePromise = null;
  const phasePlaneSource = String.raw`import numpy as np


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
        rhs = lambda y: f_linear(y, delta)
    elif kind == "nonlinear":
        rhs = lambda y: f_nonlinear(y, delta)
    else:
        raise ValueError(f"Unknown trajectory kind: {kind}")

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
`;

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch03_phase_planes.py");
    if (window.location.protocol === "file:") {
      return phasePlaneSource;
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

  async function loadPhasePlaneFunctions() {
    if (!phasePlanePromise) {
      phasePlanePromise = (async () => {
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
          return {
            linearPhasePlane: pyodide.globals.get("linear_phase_plane"),
            nonlinearPhasePlane: pyodide.globals.get("nonlinear_phase_plane"),
          };
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return phasePlanePromise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computeLinearPhasePlane(linearPhasePlane, delta, deltaMin, deltaMax) {
    try {
      return pyProxyToObject(linearPhasePlane(delta, deltaMin, deltaMax));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function computeNonlinearPhasePlane(nonlinearPhasePlane, initialX1, initialX2, delta) {
    try {
      return pyProxyToObject(nonlinearPhasePlane(initialX1, initialX2, delta));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function makeShell(titleText) {
    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = titleText;
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot";
    header.append(title);

    return { header, controls, readout, plot };
  }

  async function initLinearPhasePlane(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadPhasePlaneFunctions()]);
    const deltaMin = numberFromDataset(element, "deltaMin", 0.05);
    const deltaMax = numberFromDataset(element, "deltaMax", Math.PI / 4);
    let delta = numberFromDataset(element, "delta", 0.2);
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Linear Phase Plane for Non-normal Eigenvectors"
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeLinearPhasePlane(
        functions.linearPhasePlane,
        delta,
        deltaMin,
        deltaMax
      );
      if (requestId !== drawRequest) {
        return;
      }

      const selected = data.traces.find((trace) => trace.mode === "selected") || data.traces[0];
      readout.textContent =
        `Selected delta ${data.selected_delta.toFixed(3)} rad; ` +
        `eigenvector angle ${(data.selected_angle * 180 / Math.PI).toFixed(1)} deg; ` +
        `peak radius ${selected.peak_radius.toFixed(3)} at t = ${selected.peak_time.toFixed(1)}.`;

      const trajectoryTraces = data.traces.map((trace) => {
        const isSelected = trace.mode === "selected";
        const isMin = trace.mode === "min";
        return {
          x: trace.x1,
          y: trace.x2,
          mode: "lines",
          line: {
            color: isSelected ? "#2f6f73" : isMin ? "#bc4b51" : "#6b7280",
            dash: isSelected ? "solid" : "dash",
            width: isSelected ? 3 : 2,
          },
          name: `${trace.label} (${trace.delta.toFixed(3)})`,
        };
      });

      renderPlotly(
        plotly,
        plot,
        [
          ...trajectoryTraces,
          {
            x: data.region_x,
            y: data.region_y,
            mode: "lines",
            line: { color: "#111827", dash: "dot", width: 1.5 },
            name: "radius 2",
            hoverinfo: "skip",
          },
          {
            x: [1],
            y: [0.1],
            mode: "markers",
            marker: { color: "#111827", size: 8, symbol: "circle-open" },
            name: "initial state",
          },
          {
            x: [0],
            y: [0],
            mode: "markers",
            marker: { color: "#111827", size: 8, symbol: "square" },
            name: "equilibrium",
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 55 },
          xaxis: { title: "x_1", range: [-0.25, 2.25], zeroline: true },
          yaxis: {
            title: "x_2",
            range: [-0.25, 2.25],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.16 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Eigenvector separation delta",
        min: deltaMin,
        max: deltaMax,
        step: 0.01,
        value: delta,
        onInput: (value) => {
          delta = value;
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

  async function initNonlinearPhasePlane(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadPhasePlaneFunctions()]);
    let initialX1 = numberFromDataset(element, "initialX1", 0.4);
    const initialX2 = numberFromDataset(element, "initialX2", 0.1);
    const delta = numberFromDataset(element, "delta", 0.05);
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Nonlinear Phase Plane Near a Non-normal Linearization"
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeNonlinearPhasePlane(
        functions.nonlinearPhasePlane,
        initialX1,
        initialX2,
        delta
      );
      if (requestId !== drawRequest) {
        return;
      }

      readout.textContent =
        `Initial x_1(0) ${data.initial_x1.toFixed(2)}, x_2(0) ${data.initial_x2.toFixed(2)}; ` +
        `max nonlinear radius ${data.nonlinear.peak_radius.toFixed(3)}; ` +
        `final nonlinear radius ${data.nonlinear.final_radius.toFixed(3)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.nonlinear.x1,
            y: data.nonlinear.x2,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "nonlinear",
          },
          {
            x: data.linear.x1,
            y: data.linear.x2,
            mode: "lines",
            line: { color: "#bc4b51", dash: "dash", width: 2 },
            name: "linear",
          },
          {
            x: data.cycle_x,
            y: data.cycle_y,
            mode: "lines",
            line: { color: "#111827", dash: "dot", width: 1.5 },
            name: "radius 2",
            hoverinfo: "skip",
          },
          {
            x: [data.initial_x1],
            y: [data.initial_x2],
            mode: "markers",
            marker: { color: "#111827", size: 8, symbol: "circle-open" },
            name: "initial state",
          },
          {
            x: [0],
            y: [0],
            mode: "markers",
            marker: { color: "#111827", size: 8, symbol: "square" },
            name: "equilibrium",
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 55 },
          xaxis: { title: "x_1", range: [-2.35, 2.35], zeroline: true },
          yaxis: {
            title: "x_2",
            range: [-2.35, 2.35],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.16 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Initial x_1(0)",
        min: -0.2,
        max: 1,
        step: 0.02,
        value: initialX1,
        onInput: (value) => {
          initialX1 = value;
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

  registerExample("chapter3-linear-phase-plane", initLinearPhasePlane, {
    selectors: [".course-interactive-chapter3-linear-phase-plane"],
  });
  registerExample("chapter3-nonlinear-phase-plane", initNonlinearPhasePlane, {
    selectors: [".course-interactive-chapter3-nonlinear-phase-plane"],
  });
})();
