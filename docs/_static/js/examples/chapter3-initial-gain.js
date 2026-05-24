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

  let initialGainPromise = null;
  const initialGainSource = String.raw`import numpy as np


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
`;

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch03_initial_gain.py");
    if (window.location.protocol === "file:") {
      return initialGainSource;
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

  async function loadInitialGainFunction() {
    if (!initialGainPromise) {
      initialGainPromise = (async () => {
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
          return pyodide.globals.get("initial_gain");
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return initialGainPromise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computeInitialGain(initialGain, coupling, targetTime, timeMax, steps) {
    try {
      return pyProxyToObject(initialGain(coupling, targetTime, timeMax, steps));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function trajectoryStyle(mode) {
    if (mode === "max") {
      return { color: "#2f6f73", width: 3, dash: "solid" };
    }
    return { color: "#bc4b51", width: 3, dash: "dash" };
  }

  async function initChapter3InitialGain(element) {
    const [plotly, initialGain] = await Promise.all([
      loadPlotly(),
      loadInitialGainFunction(),
    ]);
    let coupling = numberFromDataset(element, "k", 8);
    let targetTime = numberFromDataset(element, "targetTime", 1.5);
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
    title.textContent = "Initial Conditions for Maximum and Minimum Gain";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeInitialGain(initialGain, coupling, targetTime, timeMax, steps);
      if (requestId !== drawRequest) {
        return;
      }

      const maxTrace = data.trajectories.find((trajectory) => trajectory.mode === "max");
      const minTrace = data.trajectories.find((trajectory) => trajectory.mode === "min");
      readout.textContent =
        `At t* = ${data.target_time.toFixed(2)}, sigma_max = ${maxTrace.gain.toFixed(3)} ` +
        `and sigma_min = ${minTrace.gain.toFixed(3)} ` +
        `(condition number ${data.condition_number.toFixed(2)}).`;

      const phaseTraces = data.trajectories.map((trajectory) => ({
        x: trajectory.x1,
        y: trajectory.x2,
        mode: "lines",
        line: trajectoryStyle(trajectory.mode),
        name: `${trajectory.label} trajectory`,
        xaxis: "x",
        yaxis: "y",
        hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
      }));

      const markerTraces = data.trajectories.flatMap((trajectory) => {
        const style = trajectoryStyle(trajectory.mode);
        return [
          {
            x: [trajectory.initial_x1],
            y: [trajectory.initial_x2],
            mode: "markers",
            marker: { color: style.color, size: 9, symbol: "circle-open", line: { width: 2 } },
            name: `${trajectory.label} x(0)`,
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "initial x_1=%{x:.3f}<br>initial x_2=%{y:.3f}<extra></extra>",
          },
          {
            x: [trajectory.target_x1],
            y: [trajectory.target_x2],
            mode: "markers",
            marker: { color: style.color, size: 10, symbol: "circle" },
            name: `${trajectory.label} x(t*)`,
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
            hovertemplate:
              `gain=${trajectory.gain.toFixed(3)}<br>` +
              "target x_1=%{x:.3f}<br>target x_2=%{y:.3f}<extra></extra>",
          },
        ];
      });

      const normTraces = data.trajectories.map((trajectory) => ({
        x: data.time,
        y: trajectory.norm,
        mode: "lines",
        line: trajectoryStyle(trajectory.mode),
        name: `${trajectory.label} ||x(t)||_2`,
        xaxis: "x2",
        yaxis: "y2",
        hovertemplate: "t=%{x:.2f}<br>||x(t)||_2=%{y:.3f}<extra></extra>",
      }));

      const gainMarkers = data.trajectories.map((trajectory) => {
        const style = trajectoryStyle(trajectory.mode);
        return {
          x: [data.target_time],
          y: [trajectory.gain],
          mode: "markers",
          marker: { color: style.color, size: 9, symbol: "diamond" },
          name: `${trajectory.label} gain`,
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
          hovertemplate: "t*=%{x:.2f}<br>gain=%{y:.3f}<extra></extra>",
        };
      });

      const allX = data.trajectories.flatMap((trajectory) => [
        ...trajectory.x1,
        trajectory.initial_x1,
        trajectory.target_x1,
      ]);
      const allY = data.trajectories.flatMap((trajectory) => [
        ...trajectory.x2,
        trajectory.initial_x2,
        trajectory.target_x2,
      ]);
      const maxAbs = Math.max(1, ...allX.map(Math.abs), ...allY.map(Math.abs));
      const phaseLimit = Math.min(Math.max(maxAbs * 1.12, 1.25), Math.max(6, coupling * 0.55));

      renderPlotly(
        plotly,
        plot,
        [...phaseTraces, ...markerTraces, ...normTraces, ...gainMarkers],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 58, l: 58 },
          xaxis: {
            title: "x_1",
            range: [-phaseLimit, phaseLimit],
            zeroline: true,
          },
          yaxis: {
            title: "x_2",
            range: [-phaseLimit, phaseLimit],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            title: "t",
            range: [0, timeMax],
            zeroline: false,
          },
          yaxis2: {
            title: "||x(t)||_2",
            rangemode: "tozero",
            zeroline: false,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.08 },
          shapes: [
            {
              type: "line",
              xref: "x2",
              yref: "paper",
              x0: data.target_time,
              x1: data.target_time,
              y0: 0,
              y1: 1,
              line: { color: "#6b7280", width: 1.5, dash: "dot" },
            },
          ],
          annotations: [
            {
              xref: "x2",
              yref: "paper",
              x: data.target_time,
              y: 1,
              text: "t*",
              showarrow: false,
              xanchor: "left",
              yanchor: "bottom",
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
      }),
      makeRangeControl({
        label: "Target time t*",
        min: 0,
        max: timeMax,
        step: 0.1,
        value: targetTime,
        onInput: (value) => {
          targetTime = value;
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

  registerExample("chapter3-initial-gain", initChapter3InitialGain);
})();
