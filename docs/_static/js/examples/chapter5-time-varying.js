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

  let chapter5FunctionsPromise = null;
  const chapter5Source = String.raw`import numpy as np


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
`;

  const trajectoryColors = {
    constant: "#2f6f73",
    "offset-periodic": "#bc4b51",
    "zero-mean periodic": "#8a6d1d",
  };

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch05_linear_time_varying.py");
    if (window.location.protocol === "file:") {
      return chapter5Source;
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

  async function loadChapter5Functions() {
    if (!chapter5FunctionsPromise) {
      chapter5FunctionsPromise = (async () => {
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
            stateTransitionMap: pyodide.globals.get("state_transition_map"),
            trajectoryFamily: pyodide.globals.get("trajectory_family"),
          };
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return chapter5FunctionsPromise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computeTrajectoryFamily(trajectoryFamily, amplitude, timeMax, steps) {
    try {
      return pyProxyToObject(trajectoryFamily(amplitude, timeMax, steps));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function computeStateTransitionMap(
    stateTransitionMap,
    amplitude,
    initialTime,
    horizon,
    horizonMax,
    steps,
    circleSamples
  ) {
    try {
      return pyProxyToObject(
        stateTransitionMap(
          amplitude,
          initialTime,
          horizon,
          horizonMax,
          steps,
          circleSamples
        )
      );
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function vectorTrace(vector, color, name, xaxis, yaxis, dash = "solid") {
    return {
      x: [0, vector[0]],
      y: [0, vector[1]],
      mode: "lines+markers",
      line: { color, width: 3, dash },
      marker: { color, size: 8 },
      name,
      xaxis,
      yaxis,
      hovertemplate: `${name}<br>x=%{x:.3f}<br>y=%{y:.3f}<extra></extra>`,
    };
  }

  async function initChapter5VaryingTrajectories(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadChapter5Functions()]);
    let amplitude = numberFromDataset(element, "beta", 2.5);
    const timeMax = numberFromDataset(element, "timeMax", 6);
    const steps = 320;
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Trajectory Changes Under Different Time-Varying Shear Histories";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeTrajectoryFamily(functions.trajectoryFamily, amplitude, timeMax, steps);
      if (requestId !== drawRequest) {
        return;
      }

      readout.textContent = data.traces
        .map(
          (trace) =>
            `${trace.label} peak ||x(t)||_2 = ${trace.peak_norm.toFixed(3)} at t = ${trace.peak_time.toFixed(2)}`
        )
        .join("; ");

      const phaseTraces = data.traces.flatMap((trace) => {
        const color = trajectoryColors[trace.key];
        return [
          {
            x: trace.x1,
            y: trace.x2,
            mode: "lines",
            line: { color, width: 3 },
            name: trace.label,
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          {
            x: [trace.peak_x1],
            y: [trace.peak_x2],
            mode: "markers",
            marker: { color, size: 9, symbol: "circle" },
            name: `${trace.label} peak`,
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
            hovertemplate:
              `peak ||x||_2=${trace.peak_norm.toFixed(3)}<br>` +
              "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
        ];
      });

      const normTraces = data.traces.flatMap((trace) => {
        const color = trajectoryColors[trace.key];
        return [
          {
            x: data.time,
            y: trace.norm,
            mode: "lines",
            line: { color, width: 3 },
            name: `${trace.label} norm`,
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>||x(t)||_2=%{y:.3f}<extra></extra>",
          },
          {
            x: [trace.peak_time],
            y: [trace.peak_norm],
            mode: "markers",
            marker: { color, size: 9, symbol: "diamond" },
            name: `${trace.label} norm peak`,
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>||x(t)||_2=%{y:.3f}<extra></extra>",
          },
        ];
      });

      const allX = data.traces.flatMap((trace) => trace.x1);
      const allY = data.traces.flatMap((trace) => trace.x2);
      const xExtent = Math.max(1, ...allX.map((value) => Math.abs(value)));
      const yExtent = Math.max(1, ...allY.map((value) => Math.abs(value)));
      const phaseRadius = 1.1 * Math.max(xExtent, yExtent);
      const maxNorm = Math.max(...data.traces.flatMap((trace) => trace.norm));

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: [0],
            y: [1],
            mode: "markers",
            marker: { color: "#222222", size: 9, symbol: "circle-open" },
            name: "shared x(0)",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1(0)=0<br>x_2(0)=1<extra></extra>",
          },
          ...phaseTraces,
          ...normTraces,
        ],
        {
          margin: { t: 28, r: 20, b: 60, l: 60 },
          xaxis: {
            domain: [0, 0.46],
            title: "x_1(t)",
            range: [-phaseRadius, phaseRadius],
            zeroline: true,
          },
          yaxis: {
            title: "x_2(t)",
            range: [-0.05 * phaseRadius, phaseRadius],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            domain: [0.58, 1],
            title: "t",
            range: [0, timeMax],
          },
          yaxis2: {
            title: "||x(t)||_2",
            anchor: "x2",
            range: [0, 1.1 * maxNorm],
          },
          legend: { orientation: "h", x: 0, y: 1.16 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          annotations: [
            {
              xref: "paper",
              yref: "paper",
              x: 0.23,
              y: 1.04,
              text: "Phase plane",
              showarrow: false,
            },
            {
              xref: "paper",
              yref: "paper",
              x: 0.79,
              y: 1.04,
              text: "Norm history",
              showarrow: false,
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Amplitude beta",
        min: 0,
        max: 4,
        step: 0.1,
        value: amplitude,
        onInput: (value) => {
          amplitude = value;
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

  async function initChapter5StateTransitionMap(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadChapter5Functions()]);
    let amplitude = numberFromDataset(element, "beta", 2.5);
    let initialTime = numberFromDataset(element, "t0", 0.5);
    let horizon = numberFromDataset(element, "horizon", 2.0);
    const horizonMax = numberFromDataset(element, "horizonMax", 6.3);
    const steps = 240;
    const circleSamples = 181;
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "State-Transition Map for a Periodic Coefficient";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeStateTransitionMap(
        functions.stateTransitionMap,
        amplitude,
        initialTime,
        horizon,
        horizonMax,
        steps,
        circleSamples
      );
      if (requestId !== drawRequest) {
        return;
      }

      const optimalAngleDegrees = (180 * data.optimal_angle) / Math.PI;
      readout.textContent =
        `For s(t)=beta cos(t) on [t_0, t] = [` +
        `${data.initial_time.toFixed(2)}, ${data.target_time.toFixed(2)}], ` +
        `g(t,t_0) = ${data.g_selected.toFixed(3)}, ` +
        `Phi_12(t,t_0) = ${data.phi_12.toFixed(3)}, and ` +
        `sigma_max(Phi) = ${data.sigma_selected.toFixed(3)}. ` +
        `The maximizing initial direction makes an angle ${optimalAngleDegrees.toFixed(1)} degrees.`;

      const imageExtent = Math.max(
        1,
        ...data.mapped_x.map((value) => Math.abs(value)),
        ...data.mapped_y.map((value) => Math.abs(value))
      );
      const stateRadius = 1.15 * imageExtent;
      const gainMax = Math.max(1, ...data.sigma_curve);

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.circle_x,
            y: data.circle_y,
            mode: "lines",
            line: { color: "#7a7a7a", width: 2, dash: "dash" },
            name: "unit circle at t_0",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: data.mapped_x,
            y: data.mapped_y,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "Phi(t,t_0) unit circle",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          vectorTrace(data.e1_image, "#bc6c25", "Phi e_1", "x", "y"),
          vectorTrace(data.e2_image, "#bc4b51", "Phi e_2", "x", "y"),
          vectorTrace(data.optimal_initial, "#3b5b92", "v_1", "x", "y", "dot"),
          vectorTrace(data.optimal_image, "#3b5b92", "Phi v_1", "x", "y"),
          {
            x: data.time_curve,
            y: data.sigma_curve,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "sigma_max(Phi(t_0+tau,t_0))",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "tau=%{x:.2f}<br>sigma_max=%{y:.3f}<extra></extra>",
          },
          {
            x: [data.horizon],
            y: [data.sigma_selected],
            mode: "markers",
            marker: { color: "#bc4b51", size: 10, symbol: "diamond" },
            name: "selected horizon",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "tau=%{x:.2f}<br>sigma_max=%{y:.3f}<extra></extra>",
          },
        ],
        {
          margin: { t: 28, r: 20, b: 60, l: 60 },
          xaxis: {
            domain: [0, 0.46],
            title: "x_1",
            range: [-stateRadius, stateRadius],
            zeroline: true,
          },
          yaxis: {
            title: "x_2",
            range: [-stateRadius, stateRadius],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            domain: [0.58, 1],
            title: "horizon tau = t - t_0",
            range: [0, horizonMax],
          },
          yaxis2: {
            title: "largest singular value",
            anchor: "x2",
            range: [0, 1.1 * gainMax],
          },
          legend: { orientation: "h", x: 0, y: 1.16 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          shapes: [
            {
              type: "line",
              xref: "x2",
              yref: "y2",
              x0: 0,
              x1: horizonMax,
              y0: 1,
              y1: 1,
              line: { color: "#8d99ae", width: 2, dash: "dot" },
            },
          ],
          annotations: [
            {
              xref: "paper",
              yref: "paper",
              x: 0.23,
              y: 1.04,
              text: "Phi(t,t_0) acting on initial states",
              showarrow: false,
            },
            {
              xref: "paper",
              yref: "paper",
              x: 0.79,
              y: 1.04,
              text: "gain curve for the chosen t_0",
              showarrow: false,
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Amplitude beta",
        min: 0,
        max: 4,
        step: 0.1,
        value: amplitude,
        onInput: (value) => {
          amplitude = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The Python calculation could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Initial time t_0",
        min: 0,
        max: horizonMax,
        step: 0.05,
        value: initialTime,
        onInput: (value) => {
          initialTime = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The Python calculation could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Horizon t - t_0",
        min: 0,
        max: horizonMax,
        step: 0.05,
        value: horizon,
        onInput: (value) => {
          horizon = value;
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

  registerExample("chapter5-state-transition-map", initChapter5StateTransitionMap);
  registerExample("chapter5-varying-trajectories", initChapter5VaryingTrajectories);
})();
