(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
  } = window.CourseInteractives;

  const COLORS = {
    primary: "#2f6f73",
    secondary: "#bc4b51",
    accent: "#8a6d1d",
    neutral: "#5c677d",
    highlight: "#c07a2c",
  };

  function formatSigned(value, digits = 3) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
  }

  function wrapLineAngle(angle) {
    const period = Math.PI;
    let wrapped = angle % period;
    if (wrapped < 0) {
      wrapped += period;
    }
    return wrapped;
  }

  function lineAngleDifference(angleA, angleB) {
    const wrappedA = wrapLineAngle(angleA);
    const wrappedB = wrapLineAngle(angleB);
    let difference = Math.abs(wrappedA - wrappedB);
    if (difference > Math.PI / 2) {
      difference = Math.PI - difference;
    }
    return difference;
  }

  function rotationMatrix(angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return [
      [cosine, -sine],
      [sine, cosine],
    ];
  }

  function transpose2(matrix) {
    return [
      [matrix[0][0], matrix[1][0]],
      [matrix[0][1], matrix[1][1]],
    ];
  }

  function multiply2x2(left, right) {
    return [
      [
        left[0][0] * right[0][0] + left[0][1] * right[1][0],
        left[0][0] * right[0][1] + left[0][1] * right[1][1],
      ],
      [
        left[1][0] * right[0][0] + left[1][1] * right[1][0],
        left[1][0] * right[0][1] + left[1][1] * right[1][1],
      ],
    ];
  }

  function dot2(left, right) {
    return left[0] * right[0] + left[1] * right[1];
  }

  function norm2(vector) {
    return Math.hypot(vector[0], vector[1]);
  }

  function qrFactorization2(matrix) {
    const column1 = [matrix[0][0], matrix[1][0]];
    const column2 = [matrix[0][1], matrix[1][1]];

    const r11 = Math.max(norm2(column1), 1e-12);
    const q1 = [column1[0] / r11, column1[1] / r11];

    const r12 = dot2(q1, column2);
    const orthogonalResidual = [
      column2[0] - r12 * q1[0],
      column2[1] - r12 * q1[1],
    ];
    const rawR22 = norm2(orthogonalResidual);
    const q2 =
      rawR22 > 1e-12
        ? [
            orthogonalResidual[0] / rawR22,
            orthogonalResidual[1] / rawR22,
          ]
        : [-q1[1], q1[0]];
    const r22 = rawR22 > 1e-12 ? rawR22 : 1e-12;

    return {
      q: [
        [q1[0], q2[0]],
        [q1[1], q2[1]],
      ],
      r: [
        [r11, r12],
        [0, r22],
      ],
    };
  }

  function averageRate1(alpha, epsilon, initialTime, horizon) {
    if (Math.abs(horizon) < 1e-9) {
      return alpha + epsilon * Math.sin(initialTime);
    }

    return (
      alpha +
      (epsilon * (Math.cos(initialTime) - Math.cos(initialTime + horizon))) /
        horizon
    );
  }

  function diagonalFtleData(alpha, beta, epsilon, initialTime, horizonMax, steps) {
    const horizon = [];
    const rate1 = [];
    const rate2 = [];
    const ftle1 = [];
    const ftle2 = [];

    for (let index = 0; index <= steps; index += 1) {
      const tau = (horizonMax * index) / steps;
      const avg1 = averageRate1(alpha, epsilon, initialTime, tau);
      const avg2 = -beta;
      horizon.push(tau);
      rate1.push(avg1);
      rate2.push(avg2);
      ftle1.push(Math.max(avg1, avg2));
      ftle2.push(Math.min(avg1, avg2));
    }

    return { horizon, rate1, rate2, ftle1, ftle2 };
  }

  function selectedDiagonalSummary(alpha, beta, epsilon, initialTime, horizon) {
    const integral1 =
      alpha * horizon +
      epsilon * (Math.cos(initialTime) - Math.cos(initialTime + horizon));
    const integral2 = -beta * horizon;
    const average1 = averageRate1(alpha, epsilon, initialTime, horizon);
    const average2 = -beta;
    const dominantAxis = average1 >= average2 ? "e_1" : "e_2";
    const sigma1 = Math.exp(Math.max(integral1, integral2));
    const sigma2 = Math.exp(Math.min(integral1, integral2));

    return {
      average1,
      average2,
      ftle1: Math.max(average1, average2),
      ftle2: Math.min(average1, average2),
      sigma1,
      sigma2,
      dominantAxis,
    };
  }

  function expTriangularStep(alpha, beta, shear, stepSize) {
    const expGrow = Math.exp(alpha * stepSize);
    const expDecay = Math.exp(-beta * stepSize);
    const coupling = (shear * (expGrow - expDecay)) / (alpha + beta);
    return [
      [expGrow, coupling],
      [0, expDecay],
    ];
  }

  function rotatingStepMap(alpha, beta, shear, omega, time0, stepSize) {
    const leftRotation = rotationMatrix(omega * (time0 + stepSize));
    const rightRotation = transpose2(rotationMatrix(omega * time0));
    return multiply2x2(
      multiply2x2(leftRotation, expTriangularStep(alpha, beta, shear, stepSize)),
      rightRotation
    );
  }

  function qrLyapunovData(alpha, beta, shear, omega, stepSize, totalTime) {
    const steps = Math.max(8, Math.round(totalTime / stepSize));
    const time = [0];
    const estimate1 = [null];
    const estimate2 = [null];
    const angleErrorDegrees = [null];

    let qrBasis = [
      [1, 0],
      [0, 1],
    ];
    let logSum1 = 0;
    let logSum2 = 0;

    for (let index = 0; index < steps; index += 1) {
      const time0 = index * stepSize;
      const time1 = (index + 1) * stepSize;
      const stepMap = rotatingStepMap(alpha, beta, shear, omega, time0, stepSize);
      const propagatedBasis = multiply2x2(stepMap, qrBasis);
      const factorization = qrFactorization2(propagatedBasis);
      qrBasis = factorization.q;

      logSum1 += Math.log(factorization.r[0][0]);
      logSum2 += Math.log(factorization.r[1][1]);

      const clvAngle = omega * time1;
      const q1 = [qrBasis[0][0], qrBasis[1][0]];
      const q1Angle = Math.atan2(q1[1], q1[0]);

      time.push(time1);
      estimate1.push(logSum1 / time1);
      estimate2.push(logSum2 / time1);
      angleErrorDegrees.push(
        (180 * lineAngleDifference(q1Angle, clvAngle)) / Math.PI
      );
    }

    return {
      time,
      estimate1,
      estimate2,
      angleErrorDegrees,
      finalEstimate1: estimate1[estimate1.length - 1],
      finalEstimate2: estimate2[estimate2.length - 1],
      finalAngleError: angleErrorDegrees[angleErrorDegrees.length - 1],
    };
  }

  async function initDiagonalFtleAccumulator(element) {
    const plotly = await loadPlotly();
    let alpha = numberFromDataset(element, "alpha", 0.22);
    let beta = numberFromDataset(element, "beta", 0.28);
    let epsilon = numberFromDataset(element, "epsilon", 0.85);
    let initialTime = numberFromDataset(element, "t0", 0.6);
    let selectedHorizon = numberFromDataset(element, "horizon", 8);

    const horizonMax = 16;
    const steps = 320;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Finite-Time Exponent Accumulation in the Diagonal LTV Example";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function draw() {
      const data = diagonalFtleData(
        alpha,
        beta,
        epsilon,
        initialTime,
        horizonMax,
        steps
      );
      const summary = selectedDiagonalSummary(
        alpha,
        beta,
        epsilon,
        initialTime,
        selectedHorizon
      );

      readout.textContent =
        `At T = ${selectedHorizon.toFixed(2)}, ` +
        `the running averages are ${formatSigned(summary.average1)} for a_1 ` +
        `and ${formatSigned(summary.average2)} for a_2, so ` +
        `chi_1^(T) = ${formatSigned(summary.ftle1)} and ` +
        `chi_2^(T) = ${formatSigned(summary.ftle2)}. ` +
        `The dominant singular direction is ${summary.dominantAxis}, with ` +
        `sigma_1 = ${summary.sigma1.toFixed(3)} and sigma_2 = ${summary.sigma2.toFixed(3)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.horizon,
            y: data.rate1,
            mode: "lines",
            line: { color: COLORS.primary, width: 3 },
            name: "1/T integral a_1",
          },
          {
            x: data.horizon,
            y: data.rate2,
            mode: "lines",
            line: { color: COLORS.secondary, width: 3 },
            name: "1/T integral a_2",
          },
          {
            x: data.horizon,
            y: data.ftle1,
            mode: "lines",
            line: { color: COLORS.accent, width: 2, dash: "dash" },
            name: "chi_1^(T)",
          },
          {
            x: data.horizon,
            y: data.ftle2,
            mode: "lines",
            line: { color: COLORS.neutral, width: 2, dash: "dash" },
            name: "chi_2^(T)",
          },
          {
            x: [0, horizonMax],
            y: [alpha, alpha],
            mode: "lines",
            line: { color: COLORS.primary, width: 1.5, dash: "dot" },
            name: "asymptotic alpha",
          },
          {
            x: [0, horizonMax],
            y: [-beta, -beta],
            mode: "lines",
            line: { color: COLORS.secondary, width: 1.5, dash: "dot" },
            name: "asymptotic -beta",
          },
          {
            x: [selectedHorizon, selectedHorizon],
            y: [summary.average1, summary.average2],
            mode: "markers",
            marker: {
              color: [COLORS.primary, COLORS.secondary],
              size: 9,
            },
            name: "selected T",
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 65 },
          xaxis: { title: "Horizon T", range: [0, horizonMax] },
          yaxis: {
            title: "Average growth rate",
            range: [
              Math.min(-beta - 0.35, alpha - Math.abs(epsilon) - 0.25),
              Math.max(alpha + Math.abs(epsilon) + 0.25, 0.6),
            ],
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.16 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Mean growth alpha",
        min: 0.05,
        max: 0.5,
        step: 0.01,
        value: alpha,
        onInput: (value) => {
          alpha = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Mean decay beta",
        min: 0.05,
        max: 0.5,
        step: 0.01,
        value: beta,
        onInput: (value) => {
          beta = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Oscillation epsilon",
        min: 0,
        max: 1.2,
        step: 0.02,
        value: epsilon,
        onInput: (value) => {
          epsilon = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Initial time t_0",
        min: 0,
        max: 6.28,
        step: 0.02,
        value: initialTime,
        onInput: (value) => {
          initialTime = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Selected horizon T",
        min: 0.2,
        max: horizonMax,
        step: 0.1,
        value: selectedHorizon,
        onInput: (value) => {
          selectedHorizon = value;
          draw();
        },
      })
    );

    header.append(title);
    element.replaceChildren(header, controls, readout, plot);
    draw();
  }

  async function initQrLyapunovConvergence(element) {
    const plotly = await loadPlotly();
    let alpha = numberFromDataset(element, "alpha", 0.18);
    let beta = numberFromDataset(element, "beta", 0.12);
    let shear = numberFromDataset(element, "shear", 1);
    let omega = numberFromDataset(element, "omega", 0.7);

    const stepSize = 0.4;
    const totalTime = 24;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "QR Convergence for a Rotating Tangent Basis";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function draw() {
      const data = qrLyapunovData(alpha, beta, shear, omega, stepSize, totalTime);

      readout.textContent =
        `With Delta t = ${stepSize.toFixed(2)} and final time ${totalTime.toFixed(1)}, ` +
        `the QR averages end at ${formatSigned(data.finalEstimate1)} and ` +
        `${formatSigned(data.finalEstimate2)}. ` +
        `The exact asymptotic targets remain alpha = ${formatSigned(alpha)} and ` +
        `-beta = ${formatSigned(-beta)}, while the leading Gram-Schmidt direction ` +
        `sits ${data.finalAngleError.toFixed(2)} degrees from the unstable CLV line.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.time,
            y: data.estimate1,
            mode: "lines",
            line: { color: COLORS.primary, width: 3 },
            name: "QR estimate 1",
          },
          {
            x: data.time,
            y: data.estimate2,
            mode: "lines",
            line: { color: COLORS.secondary, width: 3 },
            name: "QR estimate 2",
          },
          {
            x: [0, totalTime],
            y: [alpha, alpha],
            mode: "lines",
            line: { color: COLORS.primary, width: 1.5, dash: "dot" },
            name: "target alpha",
          },
          {
            x: [0, totalTime],
            y: [-beta, -beta],
            mode: "lines",
            line: { color: COLORS.secondary, width: 1.5, dash: "dot" },
            name: "target -beta",
          },
          {
            x: data.time,
            y: data.angleErrorDegrees,
            mode: "lines",
            line: { color: COLORS.highlight, width: 2.5 },
            name: "angle(q_1, CLV_1)",
            yaxis: "y2",
          },
        ],
        {
          margin: { t: 20, r: 55, b: 55, l: 65 },
          xaxis: { title: "Accumulation time", range: [0, totalTime] },
          yaxis: {
            title: "Lyapunov exponent estimate",
            range: [
              Math.min(-beta - 0.18, -0.45),
              Math.max(alpha + 0.18, 0.45),
            ],
          },
          yaxis2: {
            title: "Direction error (deg)",
            overlaying: "y",
            side: "right",
            rangemode: "tozero",
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.18 },
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Target alpha",
        min: 0.04,
        max: 0.35,
        step: 0.01,
        value: alpha,
        onInput: (value) => {
          alpha = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Target beta",
        min: 0.04,
        max: 0.35,
        step: 0.01,
        value: beta,
        onInput: (value) => {
          beta = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Shear",
        min: 0,
        max: 2.5,
        step: 0.05,
        value: shear,
        onInput: (value) => {
          shear = value;
          draw();
        },
      }),
      makeRangeControl({
        label: "Rotation rate omega",
        min: 0,
        max: 1.6,
        step: 0.02,
        value: omega,
        onInput: (value) => {
          omega = value;
          draw();
        },
      })
    );

    header.append(title);
    element.replaceChildren(header, controls, readout, plot);
    draw();
  }

  registerExample("chapter7-diagonal-ftle-accumulator", initDiagonalFtleAccumulator);
  registerExample("chapter7-qr-lyapunov-convergence", initQrLyapunovConvergence);
})();
