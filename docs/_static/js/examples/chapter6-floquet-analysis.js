(function () {
  "use strict";

  const { loadPlotly, makeRangeControl, numberFromDataset, registerExample, renderPlotly } =
    window.CourseInteractives;

  const COLORS = {
    orbit: "#bc4b51",
    mapped: "#2f6f73",
    neutral: "#6b7280",
    multiplier: "#8a6d1d",
  };

  function circlePoints(samples = 181) {
    const x = [];
    const y = [];

    for (let index = 0; index < samples; index += 1) {
      const theta = (2 * Math.PI * index) / (samples - 1);
      x.push(Math.cos(theta));
      y.push(Math.sin(theta));
    }

    return { x, y };
  }

  function multiplyMatrix2(a, b) {
    return [
      [
        a[0][0] * b[0][0] + a[0][1] * b[1][0],
        a[0][0] * b[0][1] + a[0][1] * b[1][1],
      ],
      [
        a[1][0] * b[0][0] + a[1][1] * b[1][0],
        a[1][0] * b[0][1] + a[1][1] * b[1][1],
      ],
    ];
  }

  function applyMatrix2(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function oscillatorPropagator(omega, horizon) {
    const cosine = Math.cos(omega * horizon);
    const sine = Math.sin(omega * horizon);
    return [
      [cosine, sine / omega],
      [-omega * sine, cosine],
    ];
  }

  function piecewiseMonodromy(omega1, omega2, period) {
    const halfPeriod = 0.5 * period;
    return multiplyMatrix2(
      oscillatorPropagator(omega2, halfPeriod),
      oscillatorPropagator(omega1, halfPeriod)
    );
  }

  function matrixTrace(matrix) {
    return matrix[0][0] + matrix[1][1];
  }

  function matrixDeterminant(matrix) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  function floquetPairFromTrace(traceValue) {
    const discriminant = traceValue * traceValue - 4;
    if (discriminant >= -1e-10) {
      const root = Math.sqrt(Math.max(discriminant, 0));
      return [
        {
          re: 0.5 * (traceValue + root),
          im: 0,
        },
        {
          re: 0.5 * (traceValue - root),
          im: 0,
        },
      ];
    }

    const imag = 0.5 * Math.sqrt(-discriminant);
    return [
      { re: 0.5 * traceValue, im: imag },
      { re: 0.5 * traceValue, im: -imag },
    ];
  }

  function complexMagnitude(value) {
    return Math.hypot(value.re, value.im);
  }

  function formatSigned(value, digits = 3) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
  }

  function formatComplex(value, digits = 3) {
    if (Math.abs(value.im) < 1e-10) {
      return value.re.toFixed(digits);
    }

    return `${value.re.toFixed(digits)} ${value.im >= 0 ? "+" : "-"} ${Math.abs(
      value.im
    ).toFixed(digits)} i`;
  }

  function floquetClassificationFromRadius(radius) {
    if (radius < 0.999) {
      return "inside the unit circle, so the sampled mode decays each period.";
    }
    if (radius > 1.001) {
      return "outside the unit circle, so the sampled mode grows each period.";
    }
    return "on the unit circle, so the sampled mode is neutrally bounded at the linear level.";
  }

  function piecewiseClassificationFromTrace(traceValue) {
    if (Math.abs(traceValue) < 1.999) {
      return "The exact piecewise map is bounded because det(M_F)=1 and |tr(M_F)| < 2.";
    }
    if (Math.abs(traceValue) > 2.001) {
      return "The exact piecewise map is unstable because one reciprocal multiplier leaves the unit circle.";
    }
    return "The exact piecewise map sits on the transition boundary |tr(M_F)| = 2.";
  }

  async function initFloquetMultiplierExplorer(element) {
    const plotly = await loadPlotly();
    let radius = numberFromDataset(element, "radius", 1.05);
    let angleDegrees = numberFromDataset(element, "angleDeg", 36);
    let period = numberFromDataset(element, "period", 2);
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Floquet Multipliers and the Unit Circle";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    const unitCircle = circlePoints();

    async function draw() {
      const requestId = drawRequest += 1;
      const theta = (angleDegrees * Math.PI) / 180;
      const multipliers = [
        { re: radius * Math.cos(theta), im: radius * Math.sin(theta) },
        { re: radius * Math.cos(theta), im: -radius * Math.sin(theta) },
      ];
      const growthSteps = Array.from({ length: 9 }, (_, index) => index);
      const growthHistory = growthSteps.map((index) => radius ** index);
      const exponentReal = Math.log(radius) / period;
      const exponentImag = theta / period;

      if (requestId !== drawRequest) {
        return;
      }

      readout.textContent =
        `rho_+ = ${formatComplex(multipliers[0])}, rho_- = ${formatComplex(
          multipliers[1]
        )}. ` +
        `On the principal branch, Re(nu) = ${formatSigned(exponentReal)} and ` +
        `Im(nu) = +/-${Math.abs(exponentImag).toFixed(3)}. ` +
        `The pair lies ${floquetClassificationFromRadius(radius)}`;

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: unitCircle.x,
            y: unitCircle.y,
            mode: "lines",
            name: "unit circle",
            line: { color: COLORS.neutral, width: 2, dash: "dot" },
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: multipliers.map((value) => value.re),
            y: multipliers.map((value) => value.im),
            mode: "markers+text",
            text: ["rho_+", "rho_-"],
            textposition: ["top center", "bottom center"],
            name: "multipliers",
            marker: {
              color: COLORS.multiplier,
              size: 12,
              line: { color: "#ffffff", width: 1.5 },
            },
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "Re=%{x:.3f}<br>Im=%{y:.3f}<extra></extra>",
          },
          {
            x: growthSteps,
            y: growthHistory,
            mode: "lines+markers",
            name: "|a_k| / |a_0|",
            line: { color: COLORS.mapped, width: 3 },
            marker: { color: COLORS.mapped, size: 8 },
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "k=%{x}<br>|a_k|/|a_0|=%{y:.3f}<extra></extra>",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 58, l: 58 },
          xaxis: {
            title: "Re(rho)",
            range: [-1.8, 1.8],
            zeroline: true,
          },
          yaxis: {
            title: "Im(rho)",
            range: [-1.8, 1.8],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            title: "period index k",
            dtick: 1,
            zeroline: false,
          },
          yaxis2: {
            title: "|a_k| / |a_0|",
            type: "log",
            zeroline: false,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.08 },
          shapes: [
            {
              type: "line",
              xref: "x2",
              yref: "y2",
              x0: 0,
              x1: 8,
              y0: 1,
              y1: 1,
              line: { color: COLORS.neutral, width: 1.5, dash: "dot" },
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Magnitude |rho|",
        min: 0.6,
        max: 1.6,
        step: 0.01,
        value: radius,
        onInput: (value) => {
          radius = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The Floquet multiplier plot could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Angle arg(rho) (deg)",
        min: 0,
        max: 180,
        step: 1,
        value: angleDegrees,
        onInput: (value) => {
          angleDegrees = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The Floquet multiplier plot could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Period T",
        min: 0.5,
        max: 6,
        step: 0.1,
        value: period,
        onInput: (value) => {
          period = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The Floquet multiplier plot could not be updated.";
            console.error(error);
          });
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  async function initPiecewiseMonodromyMap(element) {
    const plotly = await loadPlotly();
    let omega1 = numberFromDataset(element, "omega1", 0.8);
    let omega2 = numberFromDataset(element, "omega2", 2.1);
    let period = numberFromDataset(element, "period", 2.4);
    let initialAngle = numberFromDataset(element, "initialAngle", 30);
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Piecewise Monodromy Map";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    const unitCircle = circlePoints();

    async function draw() {
      const requestId = drawRequest += 1;
      const monodromy = piecewiseMonodromy(omega1, omega2, period);
      const traceValue = matrixTrace(monodromy);
      const determinant = matrixDeterminant(monodromy);
      const multipliers = floquetPairFromTrace(traceValue);
      const dominantRadius = Math.max(...multipliers.map(complexMagnitude));
      const mappedCircle = unitCircle.x.map((xValue, index) =>
        applyMatrix2(monodromy, [xValue, unitCircle.y[index]])
      );
      const angleRadians = (initialAngle * Math.PI) / 180;
      const initialState = [Math.cos(angleRadians), Math.sin(angleRadians)];

      const orbitStates = [initialState];
      for (let index = 0; index < 8; index += 1) {
        orbitStates.push(applyMatrix2(monodromy, orbitStates[orbitStates.length - 1]));
      }

      if (requestId !== drawRequest) {
        return;
      }

      readout.textContent =
        `tr(M_F) = ${traceValue.toFixed(3)}, det(M_F) = ${determinant.toFixed(3)}, ` +
        `rho_+ = ${formatComplex(multipliers[0])}, rho_- = ${formatComplex(
          multipliers[1]
        )}. ` +
        `${piecewiseClassificationFromTrace(traceValue)} ` +
        `The sampled norm grows asymptotically like |rho_max|^m with |rho_max| = ${dominantRadius.toFixed(
          3
        )}.`;

      const phaseOrbit = orbitStates.slice(0, 5);
      const phaseValues = mappedCircle.flatMap((value) => [Math.abs(value[0]), Math.abs(value[1])]);
      const orbitValues = phaseOrbit.flatMap((value) => [Math.abs(value[0]), Math.abs(value[1])]);
      const phaseLimit = Math.max(1.25, 1.1 * Math.max(...phaseValues, ...orbitValues));

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: unitCircle.x,
            y: unitCircle.y,
            mode: "lines",
            name: "initial unit circle",
            line: { color: COLORS.neutral, width: 2, dash: "dot" },
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: mappedCircle.map((value) => value[0]),
            y: mappedCircle.map((value) => value[1]),
            mode: "lines",
            name: "M_F circle",
            line: { color: COLORS.mapped, width: 3 },
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "q=%{x:.3f}<br>qdot=%{y:.3f}<extra></extra>",
          },
          {
            x: phaseOrbit.map((value) => value[0]),
            y: phaseOrbit.map((value) => value[1]),
            mode: "lines+markers+text",
            text: phaseOrbit.map((_, index) => `m=${index}`),
            textposition: "top center",
            name: "sampled orbit",
            line: { color: COLORS.orbit, width: 2.5 },
            marker: { color: COLORS.orbit, size: 8 },
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "q=%{x:.3f}<br>qdot=%{y:.3f}<extra></extra>",
          },
          {
            x: orbitStates.map((_, index) => index),
            y: orbitStates.map((value) => Math.hypot(value[0], value[1])),
            mode: "lines+markers",
            name: "||x_m||_2",
            line: { color: COLORS.orbit, width: 3 },
            marker: { color: COLORS.orbit, size: 8 },
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "m=%{x}<br>||x_m||_2=%{y:.3f}<extra></extra>",
          },
        ],
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 28, r: 20, b: 58, l: 58 },
          xaxis: {
            title: "q",
            range: [-phaseLimit, phaseLimit],
            zeroline: true,
          },
          yaxis: {
            title: "qdot",
            range: [-phaseLimit, phaseLimit],
            scaleanchor: "x",
            scaleratio: 1,
            zeroline: true,
          },
          xaxis2: {
            title: "period index m",
            dtick: 1,
            zeroline: false,
          },
          yaxis2: {
            title: "||x_m||_2",
            type: "log",
            zeroline: false,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.08 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "omega_1",
        min: 0.5,
        max: 2.5,
        step: 0.05,
        value: omega1,
        onInput: (value) => {
          omega1 = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The monodromy map could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "omega_2",
        min: 0.5,
        max: 2.5,
        step: 0.05,
        value: omega2,
        onInput: (value) => {
          omega2 = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The monodromy map could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Period T",
        min: 1,
        max: 5,
        step: 0.1,
        value: period,
        onInput: (value) => {
          period = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The monodromy map could not be updated.";
            console.error(error);
          });
        },
      }),
      makeRangeControl({
        label: "Initial angle (deg)",
        min: 0,
        max: 360,
        step: 1,
        value: initialAngle,
        onInput: (value) => {
          initialAngle = value;
          if (!isMounted) {
            return;
          }
          draw().catch((error) => {
            readout.textContent = "The monodromy map could not be updated.";
            console.error(error);
          });
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter6-floquet-multiplier-explorer", initFloquetMultiplierExplorer);
  registerExample("chapter6-piecewise-monodromy-map", initPiecewiseMonodromyMap);
})();
