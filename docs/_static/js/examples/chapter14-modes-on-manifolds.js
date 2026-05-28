(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    makeSelectControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
  } = window.CourseInteractives;

  const TWO_PI = 2 * Math.PI;
  const COLORS = {
    nonlinear: "#2f6f73",
    linear: "#bc4b51",
    tangent: "#8a6d1d",
    ambient: "#6b7280",
    circle: "#111827",
    grid: "#d1d5db",
  };

  function wrapAngle(angle) {
    const wrapped = ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
    return wrapped <= -Math.PI ? wrapped + TWO_PI : wrapped;
  }

  function circlePoint(theta) {
    return [Math.cos(theta), Math.sin(theta)];
  }

  function tangentDirection(theta) {
    return [-Math.sin(theta), Math.cos(theta)];
  }

  function makeShell(titleText, largePlot = false) {
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
    plot.className = largePlot
      ? "course-interactive__plot course-interactive__plot--large"
      : "course-interactive__plot";
    header.append(title);

    return { header, controls, readout, plot };
  }

  function setError(element, error) {
    const message = error && error.userMessage ? error.userMessage : error.message || String(error);
    element.textContent = message;
  }

  function integrateCircle(theta0, timeMax, steps) {
    const time = [];
    const theta = [];
    const x = [];
    const y = [];
    const dt = timeMax / steps;
    let state = theta0;

    for (let index = 0; index <= steps; index += 1) {
      const currentTime = index * dt;
      time.push(currentTime);
      theta.push(state);
      x.push(Math.cos(state));
      y.push(Math.sin(state));

      if (index === steps) {
        continue;
      }

      const rhs = (value) => -Math.sin(value);
      const k1 = rhs(state);
      const k2 = rhs(state + 0.5 * dt * k1);
      const k3 = rhs(state + 0.5 * dt * k2);
      const k4 = rhs(state + dt * k3);
      state += dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    }

    return { time, theta, x, y };
  }

  function makeArc(baseTheta, eta, samples) {
    const x = [];
    const y = [];
    for (let index = 0; index <= samples; index += 1) {
      const theta = baseTheta + eta * index / samples;
      x.push(Math.cos(theta));
      y.push(Math.sin(theta));
    }
    return { x, y };
  }

  async function initTangentVersusAmbient(element) {
    const plotly = await loadPlotly();
    let baseAngle = numberFromDataset(element, "baseAngle", 0.6);
    let pointAngle = numberFromDataset(element, "pointAngle", 2.1);
    let isMounted = false;

    const { header, controls, readout, plot } = makeShell(
      "Ambient Chords Versus Tangent-Space Log Coordinates"
    );

    function draw() {
      const basePoint = circlePoint(baseAngle);
      const point = circlePoint(pointAngle);
      const tangent = tangentDirection(baseAngle);
      const eta = wrapAngle(pointAngle - baseAngle);
      const logEnd = [basePoint[0] + eta * tangent[0], basePoint[1] + eta * tangent[1]];
      const midpoint = [
        0.5 * (basePoint[0] + point[0]),
        0.5 * (basePoint[1] + point[1]),
      ];
      const chordLength = Math.hypot(point[0] - basePoint[0], point[1] - basePoint[1]);
      const midpointRadius = Math.hypot(midpoint[0], midpoint[1]);
      const arc = makeArc(baseAngle, eta, 96);
      const tangentExtent = Math.max(1.6, Math.min(3.25, Math.abs(eta) + 0.9));
      const tangentLine = {
        x: [
          basePoint[0] - tangentExtent * tangent[0],
          basePoint[0] + tangentExtent * tangent[0],
        ],
        y: [
          basePoint[1] - tangentExtent * tangent[1],
          basePoint[1] + tangentExtent * tangent[1],
        ],
      };
      const limit = Math.min(
        4.35,
        Math.max(
          1.35,
          1.15 * Math.max(
            ...tangentLine.x.map(Math.abs),
            ...tangentLine.y.map(Math.abs),
            Math.abs(logEnd[0]),
            Math.abs(logEnd[1])
          )
        )
      );

      readout.textContent =
        `Wrapped log coordinate eta = ${eta.toFixed(2)} rad; ` +
        `arc length = ${Math.abs(eta).toFixed(2)}; ` +
        `chord length = ${chordLength.toFixed(2)}; ` +
        `ambient midpoint radius = ${midpointRadius.toFixed(2)}.`;

      return renderPlotly(
        plotly,
        plot,
        [
          {
            x: arc.x,
            y: arc.y,
            mode: "lines",
            line: { color: COLORS.nonlinear, width: 4 },
            name: "intrinsic arc",
            hovertemplate: "x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>",
          },
          {
            x: tangentLine.x,
            y: tangentLine.y,
            mode: "lines",
            line: { color: COLORS.grid, width: 2, dash: "dot" },
            name: "tangent line at base",
            hoverinfo: "skip",
          },
          {
            x: [basePoint[0], point[0]],
            y: [basePoint[1], point[1]],
            mode: "lines",
            line: { color: COLORS.ambient, width: 3 },
            name: "ambient chord",
            hovertemplate: "x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>",
          },
          {
            x: [basePoint[0], logEnd[0]],
            y: [basePoint[1], logEnd[1]],
            mode: "lines",
            line: { color: COLORS.tangent, width: 4 },
            name: "tangent-space log",
            hovertemplate: "x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>",
          },
          {
            x: Array.from({ length: 181 }, (_, index) => Math.cos(TWO_PI * index / 180)),
            y: Array.from({ length: 181 }, (_, index) => Math.sin(TWO_PI * index / 180)),
            mode: "lines",
            line: { color: COLORS.circle, width: 2 },
            name: "S^1",
            hoverinfo: "skip",
          },
          {
            x: [basePoint[0]],
            y: [basePoint[1]],
            mode: "markers",
            marker: { color: COLORS.nonlinear, size: 10, symbol: "circle" },
            name: "base point",
            hovertemplate: "base point<extra></extra>",
          },
          {
            x: [point[0]],
            y: [point[1]],
            mode: "markers",
            marker: { color: COLORS.ambient, size: 10, symbol: "diamond" },
            name: "comparison point",
            hovertemplate: "comparison point<extra></extra>",
          },
          {
            x: [midpoint[0]],
            y: [midpoint[1]],
            mode: "markers",
            marker: { color: COLORS.linear, size: 10, symbol: "square" },
            name: "ambient midpoint",
            hovertemplate: "ambient midpoint<extra></extra>",
          },
          {
            x: [logEnd[0]],
            y: [logEnd[1]],
            mode: "markers",
            marker: { color: COLORS.tangent, size: 10, symbol: "x" },
            name: "log endpoint",
            hovertemplate: "log endpoint<extra></extra>",
          },
        ],
        {
          margin: { t: 24, r: 20, b: 48, l: 56 },
          xaxis: {
            title: "ambient x_1",
            range: [-limit, limit],
            zeroline: true,
          },
          yaxis: {
            title: "ambient x_2",
            range: [-limit, limit],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.12 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "base angle",
        min: -Math.PI,
        max: Math.PI,
        step: 0.05,
        value: baseAngle,
        onInput(value) {
          baseAngle = value;
          if (isMounted) {
            draw().catch((error) => setError(element, error));
          }
        },
      }),
      makeRangeControl({
        label: "comparison angle",
        min: -Math.PI,
        max: Math.PI,
        step: 0.05,
        value: pointAngle,
        onInput(value) {
          pointAngle = value;
          if (isMounted) {
            draw().catch((error) => setError(element, error));
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  async function initCircleTangentDynamics(element) {
    const plotly = await loadPlotly();
    let baseChoice = element.dataset.baseChoice === "pi" ? "pi" : "0";
    let initialEta = numberFromDataset(element, "eta0", 0.55);
    let timeMax = numberFromDataset(element, "timeMax", 2.5);
    let isMounted = false;

    const { header, controls, readout, plot } = makeShell(
      "Local Tangent Dynamics on S^1",
      true
    );

    function draw() {
      const baseTheta = baseChoice === "pi" ? Math.PI : 0;
      const rate = -Math.cos(baseTheta);
      const theta0 = baseTheta + initialEta;
      const steps = Math.max(140, Math.round(timeMax * 90));
      const trajectory = integrateCircle(theta0, timeMax, steps);
      const nonlinearEta = trajectory.theta.map((theta) => wrapAngle(theta - baseTheta));
      const linearEta = trajectory.time.map((time) => initialEta * Math.exp(rate * time));
      const maxLinear = Math.max(...linearEta.map((value) => Math.abs(value)));
      const maxEta = Math.max(
        ...nonlinearEta.map((value) => Math.abs(value)),
        Math.min(maxLinear, 4)
      );
      const yLimit = Math.min(4, Math.max(1.25, 1.12 * maxEta));
      const selectedEquilibrium = circlePoint(baseTheta);
      const otherEquilibrium = circlePoint(baseTheta + Math.PI);
      const truncatedLinear = maxLinear > yLimit + 0.05;
      const nonlinearFinal = nonlinearEta[nonlinearEta.length - 1];
      const linearFinal = linearEta[linearEta.length - 1];
      const localKind = rate < 0 ? "stable" : "unstable";

      readout.textContent =
        `At theta_* = ${baseChoice === "pi" ? "pi" : "0"}, ` +
        `the local scalar rate is ${rate.toFixed(2)} (${localKind}). ` +
        `At T = ${timeMax.toFixed(2)}, nonlinear eta(T) = ${nonlinearFinal.toFixed(2)} ` +
        `and linear eta(T) = ${linearFinal.toFixed(2)}.` +
        (truncatedLinear
          ? " The dashed linear trace leaves the plotted range, which signals that one tangent chart is being pushed too far."
          : "");

      return renderPlotly(
        plotly,
        plot,
        [
          {
            x: Array.from({ length: 181 }, (_, index) => Math.cos(TWO_PI * index / 180)),
            y: Array.from({ length: 181 }, (_, index) => Math.sin(TWO_PI * index / 180)),
            mode: "lines",
            line: { color: COLORS.circle, width: 2 },
            name: "S^1",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: trajectory.x,
            y: trajectory.y,
            mode: "lines",
            line: { color: COLORS.nonlinear, width: 4 },
            name: "nonlinear trajectory",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.2f}<br>x_2=%{y:.2f}<extra></extra>",
          },
          {
            x: [trajectory.x[0]],
            y: [trajectory.y[0]],
            mode: "markers",
            marker: {
              color: COLORS.nonlinear,
              size: 10,
              symbol: "circle-open",
              line: { width: 2 },
            },
            name: "initial state",
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "initial state<extra></extra>",
          },
          {
            x: [trajectory.x[trajectory.x.length - 1]],
            y: [trajectory.y[trajectory.y.length - 1]],
            mode: "markers",
            marker: { color: COLORS.nonlinear, size: 10, symbol: "circle" },
            name: "final state",
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "final state<extra></extra>",
          },
          {
            x: [selectedEquilibrium[0]],
            y: [selectedEquilibrium[1]],
            mode: "markers",
            marker: { color: COLORS.tangent, size: 11, symbol: "diamond" },
            name: "selected equilibrium",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "selected equilibrium<extra></extra>",
          },
          {
            x: [otherEquilibrium[0]],
            y: [otherEquilibrium[1]],
            mode: "markers",
            marker: {
              color: COLORS.ambient,
              size: 10,
              symbol: "diamond-open",
              line: { width: 2 },
            },
            name: "other equilibrium",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "other equilibrium<extra></extra>",
          },
          {
            x: trajectory.time,
            y: nonlinearEta,
            mode: "lines",
            line: { color: COLORS.nonlinear, width: 4 },
            name: "wrapped nonlinear eta(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>eta=%{y:.2f}<extra></extra>",
          },
          {
            x: trajectory.time,
            y: linearEta,
            mode: "lines",
            line: { color: COLORS.linear, width: 3, dash: "dash" },
            name: "linearized eta(t)",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>eta_lin=%{y:.2f}<extra></extra>",
          },
          {
            x: [0, timeMax],
            y: [Math.PI, Math.PI],
            mode: "lines",
            line: { color: COLORS.grid, width: 2, dash: "dot" },
            name: "chart boundary",
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
            hoverinfo: "skip",
          },
          {
            x: [0, timeMax],
            y: [-Math.PI, -Math.PI],
            mode: "lines",
            line: { color: COLORS.grid, width: 2, dash: "dot" },
            name: "chart boundary",
            xaxis: "x2",
            yaxis: "y2",
            hoverinfo: "skip",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 52, l: 58 },
          xaxis: {
            title: "ambient x_1",
            range: [-1.2, 1.2],
            zeroline: true,
          },
          yaxis: {
            title: "ambient x_2",
            range: [-1.2, 1.2],
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
            title: "eta(t) relative to theta_*",
            range: [-yLimit, yLimit],
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.12 },
        }
      );
    }

    controls.append(
      makeSelectControl({
        label: "equilibrium",
        value: baseChoice,
        options: [
          { value: "0", label: "theta_* = 0" },
          { value: "pi", label: "theta_* = pi" },
        ],
        onInput(value) {
          baseChoice = value;
          if (isMounted) {
            draw().catch((error) => setError(element, error));
          }
        },
      }),
      makeRangeControl({
        label: "initial eta(0)",
        min: -0.9,
        max: 0.9,
        step: 0.05,
        value: initialEta,
        onInput(value) {
          initialEta = value;
          if (isMounted) {
            draw().catch((error) => setError(element, error));
          }
        },
      }),
      makeRangeControl({
        label: "time horizon T",
        min: 0.5,
        max: 3.5,
        step: 0.1,
        value: timeMax,
        onInput(value) {
          timeMax = value;
          if (isMounted) {
            draw().catch((error) => setError(element, error));
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter14-tangent-versus-ambient", initTangentVersusAmbient);
  registerExample("chapter14-circle-tangent-dynamics", initCircleTangentDynamics);
})();
