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

  const TAU = 2 * Math.PI;
  const degreeColors = [
    "#2f6f73",
    "#bc4b51",
    "#8a6d1d",
    "#7b4f9d",
    "#3b82f6",
    "#d97706",
  ];
  const rotationPresets = {
    "periodic-1-6": {
      label: "1/6 turn per step",
      ratio: 1 / 6,
      p: 1,
      q: 6,
      periodic: true,
    },
    "periodic-2-9": {
      label: "2/9 turn per step",
      ratio: 2 / 9,
      p: 2,
      q: 9,
      periodic: true,
    },
    "irrational-golden": {
      label: "golden-ratio turn",
      ratio: (Math.sqrt(5) - 1) / 2,
      periodic: false,
    },
    "irrational-sqrt2": {
      label: "sqrt(2) - 1 turn",
      ratio: Math.sqrt(2) - 1,
      periodic: false,
    },
  };

  function buildTimeGrid(timeMax, steps) {
    const time = [];
    for (let index = 0; index <= steps; index += 1) {
      time.push((timeMax * index) / steps);
    }
    return time;
  }

  function buildUnitCircle(samples = 241) {
    const x = [];
    const y = [];
    for (let index = 0; index < samples; index += 1) {
      const angle = (TAU * index) / (samples - 1);
      x.push(Math.cos(angle));
      y.push(Math.sin(angle));
    }
    return { x, y };
  }

  function gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
      const remainder = x % y;
      x = y;
      y = remainder;
    }
    return x || 1;
  }

  function modTau(angle) {
    const wrapped = angle % TAU;
    return wrapped < 0 ? wrapped + TAU : wrapped;
  }

  function formatComplex(real, imag) {
    const imagMagnitude = Math.abs(imag).toFixed(3);
    const sign = imag >= 0 ? "+" : "-";
    return `${real.toFixed(3)} ${sign} ${imagMagnitude} i`;
  }

  function scalarDecayData(initialState, maxDegree, timeMax, steps) {
    const time = buildTimeGrid(timeMax, steps);
    const state = time.map((value) => initialState * Math.exp(-value));
    const observables = [];

    for (let degree = 1; degree <= maxDegree; degree += 1) {
      observables.push({
        degree,
        values: time.map((value) => Math.exp(-degree * value)),
        finalValue: Math.exp(-degree * timeMax),
      });
    }

    return {
      time,
      state,
      observables,
      finalState: state[state.length - 1],
    };
  }

  function rotationData(presetKey, harmonic, steps) {
    const preset = rotationPresets[presetKey] || rotationPresets["periodic-1-6"];
    const omega = TAU * preset.ratio;
    const stateX = [];
    const stateY = [];
    const observableX = [];
    const observableY = [];
    const indices = [];

    for (let index = 0; index <= steps; index += 1) {
      const theta = modTau(index * omega);
      const observableAngle = modTau(harmonic * theta);
      indices.push(index);
      stateX.push(Math.cos(theta));
      stateY.push(Math.sin(theta));
      observableX.push(Math.cos(observableAngle));
      observableY.push(Math.sin(observableAngle));
    }

    const multiplierAngle = modTau(harmonic * omega);
    const multiplier = {
      real: Math.cos(multiplierAngle),
      imag: Math.sin(multiplierAngle),
    };

    let closureText = "More samples fill the circle without exact closure.";
    if (preset.periodic) {
      const observablePeriod = preset.q / gcd(harmonic * preset.p, preset.q);
      closureText =
        `State orbit closes after ${preset.q} steps; ` +
        `the harmonic observable closes after ${observablePeriod} steps.`;
    }

    return {
      preset,
      omega,
      harmonic,
      indices,
      stateX,
      stateY,
      observableX,
      observableY,
      multiplier,
      closureText,
    };
  }

  async function initScalarDecayEigenfunctions(element) {
    const plotly = await loadPlotly();
    let initialState = numberFromDataset(element, "x0", 1.4);
    let maxDegree = Math.round(numberFromDataset(element, "maxDegree", 4));
    let timeMax = numberFromDataset(element, "timeMax", 6);
    const steps = 240;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Scalar Decay in Koopman Eigenfunction Coordinates";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot";
    header.append(title);

    async function draw() {
      const data = scalarDecayData(initialState, maxDegree, timeMax, steps);
      const minObservable = Math.exp(-maxDegree * timeMax);

      readout.textContent =
        `For phi_m(x) = x^m, the Koopman exponent is lambda_m = -m. ` +
        `With x(0) = ${initialState.toFixed(2)}, the state ends at x(T) = ${data.finalState.toFixed(3)} ` +
        `and the degree-${maxDegree} normalized observable shrinks by ${data.observables[maxDegree - 1].finalValue.toExponential(2)} over the horizon. ` +
        `The semilog panel is straight because phi_m(x(t)) / phi_m(x_0) = e^{-m t}.`;

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.time,
            y: data.state,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "x(t)",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "t=%{x:.2f}<br>x(t)=%{y:.4f}<extra></extra>",
          },
          ...data.observables.map((observable, index) => ({
            x: data.time,
            y: observable.values,
            mode: "lines",
            line: {
              color: degreeColors[index % degreeColors.length],
              width: 2.5,
            },
            name: `m = ${observable.degree}`,
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate:
              `t=%{x:.2f}<br>` +
              `phi_${observable.degree}(x(t)) / phi_${observable.degree}(x_0) = %{y:.3e}<extra></extra>`,
          })),
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 56, l: 58 },
          xaxis: {
            title: "t",
            range: [0, timeMax],
            zeroline: false,
          },
          yaxis: {
            title: "x(t)",
            rangemode: "tozero",
            zeroline: false,
          },
          xaxis2: {
            title: "t",
            range: [0, timeMax],
            zeroline: false,
          },
          yaxis2: {
            title: "phi_m(x(t)) / phi_m(x_0)",
            type: "log",
            range: [Math.log10(minObservable), 0.08],
            zeroline: false,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.12 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Initial state x(0)",
        min: 0.2,
        max: 2,
        step: 0.1,
        value: initialState,
        onInput: (value) => {
          initialState = value;
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      }),
      makeRangeControl({
        label: "Largest degree m",
        min: 1,
        max: 6,
        step: 1,
        value: maxDegree,
        onInput: (value) => {
          maxDegree = Math.round(value);
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      }),
      makeRangeControl({
        label: "Horizon T",
        min: 2,
        max: 8,
        step: 0.5,
        value: timeMax,
        onInput: (value) => {
          timeMax = value;
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  async function initCircleRotationObservables(element) {
    const plotly = await loadPlotly();
    let presetKey = element.dataset.rotationPreset || "periodic-1-6";
    let harmonic = Math.round(numberFromDataset(element, "harmonic", 2));
    let steps = Math.round(numberFromDataset(element, "steps", 24));
    const unitCircle = buildUnitCircle();
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Circle Rotation and Fourier Koopman Observables";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot";
    header.append(title);

    async function draw() {
      const data = rotationData(presetKey, harmonic, steps);

      readout.textContent =
        `For phi_${harmonic}(theta) = exp(i ${harmonic} theta), the Koopman eigenvalue is ` +
        `mu_${harmonic} = ${formatComplex(data.multiplier.real, data.multiplier.imag)}. ` +
        `${data.closureText}`;

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: unitCircle.x,
            y: unitCircle.y,
            mode: "lines",
            line: { color: "#d1d5db", width: 2 },
            name: "unit circle",
            hoverinfo: "skip",
            showlegend: false,
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.stateX,
            y: data.stateY,
            mode: "lines+markers",
            line: { color: "#2f6f73", width: 2.5 },
            marker: {
              color: data.indices,
              colorscale: "Tealgrn",
              size: 8,
              colorbar: { title: "k", x: 0.45, len: 0.75 },
            },
            name: "state orbit",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "k=%{marker.color}<br>cos(theta_k)=%{x:.3f}<br>sin(theta_k)=%{y:.3f}<extra></extra>",
          },
          {
            x: unitCircle.x,
            y: unitCircle.y,
            mode: "lines",
            line: { color: "#d1d5db", width: 2 },
            name: "unit circle",
            hoverinfo: "skip",
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
          },
          {
            x: data.observableX,
            y: data.observableY,
            mode: "lines+markers",
            line: { color: "#bc4b51", width: 2.5 },
            marker: {
              color: data.indices,
              colorscale: "Magma",
              size: 8,
              showscale: false,
            },
            name: "observable orbit",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate:
              "k=%{marker.color}<br>Re(phi_m)=%{x:.3f}<br>Im(phi_m)=%{y:.3f}<extra></extra>",
          },
          {
            x: [data.multiplier.real],
            y: [data.multiplier.imag],
            mode: "markers",
            marker: { color: "#111827", size: 11, symbol: "diamond" },
            name: "mu_m",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "mu_m = %{x:.3f} + %{y:.3f} i<extra></extra>",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 28, b: 56, l: 56 },
          xaxis: {
            title: "Re(e^{i theta_k})",
            range: [-1.15, 1.15],
            zeroline: true,
          },
          yaxis: {
            title: "Im(e^{i theta_k})",
            range: [-1.15, 1.15],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            title: "Re(phi_m(theta_k))",
            range: [-1.15, 1.15],
            zeroline: true,
          },
          yaxis2: {
            title: "Im(phi_m(theta_k))",
            range: [-1.15, 1.15],
            scaleanchor: "x2",
            scaleratio: 1,
            zeroline: true,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.12 },
          annotations: [
            {
              xref: "paper",
              yref: "paper",
              x: 0.22,
              y: 1.04,
              text: "state sequence",
              showarrow: false,
            },
            {
              xref: "paper",
              yref: "paper",
              x: 0.79,
              y: 1.04,
              text: "observable sequence",
              showarrow: false,
            },
          ],
        }
      );
    }

    controls.append(
      makeSelectControl({
        label: "Rotation omega / (2 pi)",
        options: Object.entries(rotationPresets).map(([value, preset]) => ({
          value,
          label: preset.label,
        })),
        value: presetKey,
        onInput: (value) => {
          presetKey = value;
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      }),
      makeRangeControl({
        label: "Harmonic m",
        min: 1,
        max: 6,
        step: 1,
        value: harmonic,
        onInput: (value) => {
          harmonic = Math.round(value);
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      }),
      makeRangeControl({
        label: "Steps N",
        min: 6,
        max: 48,
        step: 1,
        value: steps,
        onInput: (value) => {
          steps = Math.round(value);
          if (isMounted) {
            draw().catch(console.error);
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter11-scalar-decay-eigenfunctions", initScalarDecayEigenfunctions);
  registerExample("chapter11-circle-rotation-observables", initCircleRotationObservables);
})();
