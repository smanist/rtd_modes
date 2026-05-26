(function () {
  "use strict";

  const {
    loadPlotly,
    loadPyodideRuntime,
    makeRangeControl,
    makeSelectControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
    staticAssetUrl,
  } = window.CourseInteractives;

  let chapter2Promise = null;
  const chapter2Source = String.raw`import numpy as np


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
`;

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch02_linear_autonomous.py");
    if (window.location.protocol === "file:") {
      return chapter2Source;
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

  async function loadChapter2Functions() {
    if (!chapter2Promise) {
      chapter2Promise = (async () => {
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
            canonicalPhasePortrait: pyodide.globals.get("canonical_phase_portrait"),
            twoDofModalSuperposition: pyodide.globals.get("two_dof_modal_superposition"),
          };
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return chapter2Promise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computeCanonicalPhasePortrait(canonicalPhasePortrait, caseKey, angle, radius, steps) {
    try {
      return pyProxyToObject(canonicalPhasePortrait(caseKey, angle, radius, steps));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function computeTwoDofModalSuperposition(twoDofModalSuperposition, eta10, eta20, timeMax, steps) {
    try {
      return pyProxyToObject(twoDofModalSuperposition(eta10, eta20, timeMax, steps));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  function makeShell(titleText, large = false) {
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
    plot.className = large
      ? "course-interactive__plot course-interactive__plot--large"
      : "course-interactive__plot";
    header.append(title);

    return { controls, header, plot, readout };
  }

  function formatEigenvalue(realPart, imagPart) {
    const realText = realPart.toFixed(2);
    if (Math.abs(imagPart) < 1.0e-9) {
      return realText;
    }

    const sign = imagPart >= 0 ? "+" : "-";
    return `${realText} ${sign} ${Math.abs(imagPart).toFixed(2)}i`;
  }

  async function initChapter2PhasePortrait(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadChapter2Functions()]);
    let caseKey = element.dataset.caseKey || "stable_node";
    let angle = numberFromDataset(element, "angle", 0.6);
    const radius = 1.0;
    const steps = 280;
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Phase Portrait Classes from Eigenvalues",
      true
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeCanonicalPhasePortrait(
        functions.canonicalPhasePortrait,
        caseKey,
        angle,
        radius,
        steps
      );
      if (requestId !== drawRequest) {
        return;
      }

      const selected = data.trajectories.find((trajectory) => trajectory.mode === "selected");
      const eigenvalueText = data.eigenvalues_real
        .map((realPart, index) => formatEigenvalue(realPart, data.eigenvalues_imag[index]))
        .join(", ");
      readout.textContent =
        `${data.case_label}: eigenvalues ${eigenvalueText}. ${data.description}`;

      const allX = data.trajectories.flatMap((trajectory) => trajectory.x1);
      const allY = data.trajectories.flatMap((trajectory) => trajectory.x2);
      const maxAbs = Math.max(1.25, ...allX.map((value) => Math.abs(value)), ...allY.map((value) => Math.abs(value)));
      const phaseLimit = Math.min(Math.max(maxAbs * 1.1, 1.4), 8.0);

      const phaseTraces = data.trajectories.map((trajectory) => {
        const isSelected = trajectory.mode === "selected";
        return {
          x: trajectory.x1,
          y: trajectory.x2,
          mode: "lines",
          line: {
            color: isSelected ? "#2f6f73" : "#9ca3af",
            width: isSelected ? 3 : 1.5,
          },
          name: isSelected ? "selected trajectory" : "reference trajectory",
          legendgroup: trajectory.mode,
          showlegend: isSelected,
          xaxis: "x",
          yaxis: "y",
          hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
        };
      });

      const eigenvectorTraces = data.eigenvectors.map((vector) => ({
        x: [-phaseLimit * vector.x1, phaseLimit * vector.x1],
        y: [-phaseLimit * vector.x2, phaseLimit * vector.x2],
        mode: "lines",
        line: { color: "#bc4b51", dash: "dot", width: 2 },
        name: vector.label,
        showlegend: true,
        xaxis: "x",
        yaxis: "y",
        hoverinfo: "skip",
      }));

      const timeTraces = [
        {
          x: data.time,
          y: selected.x1,
          mode: "lines",
          line: { color: "#1d4ed8", width: 3 },
          name: "x_1(t)",
          xaxis: "x2",
          yaxis: "y2",
          hovertemplate: "t=%{x:.2f}<br>x_1=%{y:.3f}<extra></extra>",
        },
        {
          x: data.time,
          y: selected.x2,
          mode: "lines",
          line: { color: "#d97706", width: 3 },
          name: "x_2(t)",
          xaxis: "x2",
          yaxis: "y2",
          hovertemplate: "t=%{x:.2f}<br>x_2=%{y:.3f}<extra></extra>",
        },
      ];

      const markers = [
        {
          x: [selected.initial_x1],
          y: [selected.initial_x2],
          mode: "markers",
          marker: { color: "#111827", size: 9, symbol: "circle-open", line: { width: 2 } },
          name: "initial state",
          xaxis: "x",
          yaxis: "y",
          hovertemplate: "x_1(0)=%{x:.3f}<br>x_2(0)=%{y:.3f}<extra></extra>",
        },
        {
          x: [0],
          y: [0],
          mode: "markers",
          marker: { color: "#111827", size: 8, symbol: "square" },
          name: "equilibrium",
          xaxis: "x",
          yaxis: "y",
          hoverinfo: "skip",
        },
      ];

      renderPlotly(
        plotly,
        plot,
        [...phaseTraces, ...eigenvectorTraces, ...markers, ...timeTraces],
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
            range: [0, data.time_max],
            zeroline: false,
          },
          yaxis2: {
            title: "state components",
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.1 },
        }
      );
    }

    controls.append(
      makeSelectControl({
        label: "System class",
        options: [
          { label: "Stable node", value: "stable_node" },
          { label: "Saddle", value: "saddle" },
          { label: "Center", value: "center" },
          { label: "Spiral sink", value: "spiral_sink" },
        ],
        value: caseKey,
        onInput: (value) => {
          caseKey = value;
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
        label: "Initial angle",
        min: 0,
        max: 6.28,
        step: 0.05,
        value: angle,
        onInput: (value) => {
          angle = value;
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

  async function initChapter2ModalSuperposition(element) {
    const [plotly, functions] = await Promise.all([loadPlotly(), loadChapter2Functions()]);
    let eta10 = numberFromDataset(element, "eta10", 1.0);
    let eta20 = numberFromDataset(element, "eta20", 0.0);
    const timeMax = numberFromDataset(element, "timeMax", 18);
    const steps = 360;
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Modal Superposition in the 2-DOF Oscillator",
      true
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeTwoDofModalSuperposition(
        functions.twoDofModalSuperposition,
        eta10,
        eta20,
        timeMax,
        steps
      );
      if (requestId !== drawRequest) {
        return;
      }

      const qLimit = Math.max(
        1.1,
        ...data.q1.map((value) => Math.abs(value)),
        ...data.q2.map((value) => Math.abs(value))
      ) * 1.15;
      readout.textContent =
        `q(0) = ${data.eta1_0.toFixed(2)} u_1 + ${data.eta2_0.toFixed(2)} u_2 ` +
        `with zero modal velocities. The modal coordinates oscillate independently at ` +
        `omega_1 = ${data.omega1.toFixed(2)} and omega_2 = ${data.omega2.toFixed(2)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.q1,
            y: data.q2,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "q(t)",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "q_1=%{x:.3f}<br>q_2=%{y:.3f}<extra></extra>",
          },
          {
            x: [-qLimit * data.u1[0], qLimit * data.u1[0]],
            y: [-qLimit * data.u1[1], qLimit * data.u1[1]],
            mode: "lines",
            line: { color: "#1d4ed8", dash: "dot", width: 2 },
            name: "u_1 direction",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: [-qLimit * data.u2[0], qLimit * data.u2[0]],
            y: [-qLimit * data.u2[1], qLimit * data.u2[1]],
            mode: "lines",
            line: { color: "#d97706", dash: "dot", width: 2 },
            name: "u_2 direction",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: [data.q0[0]],
            y: [data.q0[1]],
            mode: "markers",
            marker: { color: "#111827", size: 9, symbol: "circle-open", line: { width: 2 } },
            name: "q(0)",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "q_1(0)=%{x:.3f}<br>q_2(0)=%{y:.3f}<extra></extra>",
          },
          {
            x: data.time,
            y: data.eta1,
            mode: "lines",
            line: { color: "#1d4ed8", width: 3 },
            name: "eta_1(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>eta_1=%{y:.3f}<extra></extra>",
          },
          {
            x: data.time,
            y: data.eta2,
            mode: "lines",
            line: { color: "#d97706", width: 3 },
            name: "eta_2(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>eta_2=%{y:.3f}<extra></extra>",
          },
          {
            x: data.time,
            y: data.q1,
            mode: "lines",
            line: { color: "#4b5563", dash: "dash", width: 2 },
            name: "q_1(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>q_1=%{y:.3f}<extra></extra>",
          },
          {
            x: data.time,
            y: data.q2,
            mode: "lines",
            line: { color: "#9ca3af", dash: "dash", width: 2 },
            name: "q_2(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>q_2=%{y:.3f}<extra></extra>",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 58, l: 58 },
          xaxis: {
            title: "q_1",
            range: [-qLimit, qLimit],
            zeroline: true,
          },
          yaxis: {
            title: "q_2",
            range: [-qLimit, qLimit],
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
            title: "modal and state amplitudes",
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.1 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Initial eta_1(0)",
        min: -1.5,
        max: 1.5,
        step: 0.05,
        value: eta10,
        onInput: (value) => {
          eta10 = value;
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
        label: "Initial eta_2(0)",
        min: -1.5,
        max: 1.5,
        step: 0.05,
        value: eta20,
        onInput: (value) => {
          eta20 = value;
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

  registerExample("chapter2-phase-portrait", initChapter2PhasePortrait);
  registerExample("chapter2-modal-superposition", initChapter2ModalSuperposition);
})();
