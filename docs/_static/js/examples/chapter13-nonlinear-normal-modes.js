(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
  } = window.CourseInteractives;

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

    return { controls, header, plot, readout };
  }

  function linspace(start, end, count) {
    if (count <= 1) {
      return [start];
    }

    const values = [];
    for (let i = 0; i < count; i += 1) {
      values.push(start + ((end - start) * i) / (count - 1));
    }
    return values;
  }

  function signed(value, digits = 3) {
    const text = value.toFixed(digits);
    return value >= 0 ? `+${text}` : text;
  }

  function computeDuffingBackbone(omega0, alpha, amplitude, amplitudeMax) {
    const amplitudes = linspace(0, amplitudeMax, 181);
    const frequencies = amplitudes.map((level) =>
      Math.sqrt(Math.max(omega0 * omega0 + 0.75 * alpha * level * level, 0))
    );
    const selectedOmega = Math.sqrt(
      Math.max(omega0 * omega0 + 0.75 * alpha * amplitude * amplitude, 0)
    );
    const timeMax = (4 * Math.PI) / Math.max(selectedOmega, 1.0e-6);
    const time = linspace(0, timeMax, 241);
    const displacement = time.map((t) => amplitude * Math.cos(selectedOmega * t));
    const velocity = time.map((t) => -amplitude * selectedOmega * Math.sin(selectedOmega * t));

    return {
      amplitudes,
      displacement,
      frequencies,
      selectedOmega,
      time,
      timeMax,
      velocity,
    };
  }

  function graphRelation(q1, ratio, curvature) {
    return ratio * q1 + curvature * q1 * q1 * q1;
  }

  function polygonArea(x, y) {
    let area = 0;
    for (let i = 0; i < x.length; i += 1) {
      const next = (i + 1) % x.length;
      area += x[i] * y[next] - x[next] * y[i];
    }
    return 0.5 * Math.abs(area);
  }

  function rootMeanSquare(values) {
    const meanSquare =
      values.reduce((total, value) => total + value * value, 0) / Math.max(values.length, 1);
    return Math.sqrt(meanSquare);
  }

  function computeSynchrony(amplitude, ratio, curvature, phaseLagDegrees) {
    const phaseLag = (phaseLagDegrees * Math.PI) / 180;
    const tau = linspace(0, 2 * Math.PI, 241);
    const q1 = tau.map((value) => amplitude * Math.cos(value));
    const q2 = tau.map((value) => {
      const shifted = amplitude * Math.cos(value + phaseLag);
      return graphRelation(shifted, ratio, curvature);
    });
    const graphResidual = q1.map((value, index) => q2[index] - graphRelation(value, ratio, curvature));
    const q1Graph = linspace(-amplitude, amplitude, 181);
    const linearGraph = q1Graph.map((value) => ratio * value);
    const curvedGraph = q1Graph.map((value) => graphRelation(value, ratio, curvature));

    return {
      curvedGraph,
      graphDeviation: rootMeanSquare(graphResidual),
      linearGraph,
      loopArea: polygonArea(q1, q2),
      q1,
      q1Graph,
      q2,
      tau,
    };
  }

  async function initDuffingBackboneExplorer(element) {
    const plotly = await loadPlotly();
    const omega0 = numberFromDataset(element, "omega0", 1);
    const amplitudeMax = numberFromDataset(element, "amplitudeMax", 1.5);
    let amplitude = numberFromDataset(element, "amplitude", 0.9);
    let alpha = numberFromDataset(element, "alpha", 0.35);

    const { controls, header, plot, readout } = makeShell("Duffing Backbone Explorer");

    function draw() {
      const data = computeDuffingBackbone(omega0, alpha, amplitude, amplitudeMax);
      const shift = data.selectedOmega - omega0;
      const regime =
        alpha > 1.0e-9 ? "hardening" : alpha < -1.0e-9 ? "softening" : "linear";
      const period = (2 * Math.PI) / Math.max(data.selectedOmega, 1.0e-6);

      readout.textContent =
        `Omega(a) approx ${data.selectedOmega.toFixed(3)} at a = ${amplitude.toFixed(2)}. ` +
        `The backbone is ${regime}, with frequency shift ${signed(shift)} relative to ` +
        `omega0 = ${omega0.toFixed(2)} and period T approx ${period.toFixed(3)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.amplitudes,
            y: data.frequencies,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "Backbone",
          },
          {
            x: [0, amplitudeMax],
            y: [omega0, omega0],
            mode: "lines",
            line: { color: "#7b8794", width: 2, dash: "dash" },
            name: "Linear omega0",
          },
          {
            x: [amplitude],
            y: [data.selectedOmega],
            mode: "markers",
            marker: { color: "#bc4b51", size: 10 },
            name: "Selected point",
          },
          {
            x: data.displacement,
            y: data.velocity,
            mode: "lines",
            line: { color: "#8a6d1d", width: 3 },
            name: "Approximate orbit",
            xaxis: "x2",
            yaxis: "y2",
          },
          {
            x: [data.displacement[0]],
            y: [data.velocity[0]],
            mode: "markers",
            marker: { color: "#bc4b51", size: 8 },
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 20, r: 20, b: 55, l: 60 },
          legend: { orientation: "h", x: 0, y: 1.14 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          xaxis: { title: "Amplitude a", range: [0, amplitudeMax] },
          yaxis: { title: "Omega(a)", rangemode: "tozero" },
          xaxis2: { title: "x(t)" },
          yaxis2: { title: "x dot(t)" },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Amplitude a",
        min: 0.1,
        max: amplitudeMax,
        step: 0.05,
        value: amplitude,
        onInput: (value) => {
          amplitude = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Cubic stiffness alpha",
        min: -0.5,
        max: 0.8,
        step: 0.05,
        value: alpha,
        onInput: (value) => {
          alpha = value;
          draw();
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    draw();
  }

  async function initRosenbergSynchronyExplorer(element) {
    const plotly = await loadPlotly();
    let amplitude = numberFromDataset(element, "amplitude", 1);
    let ratio = numberFromDataset(element, "ratio", 1);
    let curvature = numberFromDataset(element, "curvature", 0.2);
    let phaseLag = numberFromDataset(element, "phaseLag", 0);

    const { controls, header, plot, readout } = makeShell(
      "Synchrony and Curved Modal Geometry"
    );

    function draw() {
      const data = computeSynchrony(amplitude, ratio, curvature, phaseLag);
      const synchronous = Math.abs(phaseLag) < 1.0e-9;
      const interpretation = synchronous
        ? "Zero phase lag keeps the motion on a one-dimensional graph."
        : "Nonzero lag opens a loop, so one scalar coordinate no longer describes the motion.";

      readout.textContent =
        `${interpretation} Loop area ${data.loopArea.toFixed(3)} and RMS departure from ` +
        `q2 = r q1 + kappa q1^3 is ${data.graphDeviation.toFixed(3)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.q1Graph,
            y: data.linearGraph,
            mode: "lines",
            line: { color: "#7b8794", width: 2, dash: "dash" },
            name: "Linear subspace",
          },
          {
            x: data.q1Graph,
            y: data.curvedGraph,
            mode: "lines",
            line: { color: "#bc4b51", width: 2, dash: "dot" },
            name: "Curved graph",
          },
          {
            x: data.q1,
            y: data.q2,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "Motion",
          },
          {
            x: [data.q1[0]],
            y: [data.q2[0]],
            mode: "markers",
            marker: { color: "#8a6d1d", size: 8 },
            showlegend: false,
          },
          {
            x: data.tau,
            y: data.q1,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "q1(t)",
            xaxis: "x2",
            yaxis: "y2",
          },
          {
            x: data.tau,
            y: data.q2,
            mode: "lines",
            line: { color: "#bc4b51", width: 3 },
            name: "q2(t)",
            xaxis: "x2",
            yaxis: "y2",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 20, r: 20, b: 55, l: 60 },
          legend: { orientation: "h", x: 0, y: 1.14 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          xaxis: { title: "q1" },
          yaxis: { title: "q2" },
          xaxis2: { title: "tau" },
          yaxis2: { title: "Displacement" },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Amplitude a",
        min: 0.4,
        max: 1.4,
        step: 0.05,
        value: amplitude,
        onInput: (value) => {
          amplitude = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Shape ratio r",
        min: 0.5,
        max: 1.5,
        step: 0.05,
        value: ratio,
        onInput: (value) => {
          ratio = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Curvature kappa",
        min: -0.35,
        max: 0.35,
        step: 0.025,
        value: curvature,
        onInput: (value) => {
          curvature = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Phase lag phi (deg)",
        min: 0,
        max: 120,
        step: 2,
        value: phaseLag,
        onInput: (value) => {
          phaseLag = value;
          draw();
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    draw();
  }

  registerExample("chapter13-duffing-backbone-explorer", initDuffingBackboneExplorer);
  registerExample(
    "chapter13-rosenberg-synchrony-explorer",
    initRosenbergSynchronyExplorer
  );
})();
