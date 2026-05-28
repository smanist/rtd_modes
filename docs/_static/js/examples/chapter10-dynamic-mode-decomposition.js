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

  const COLORS = {
    clean: "#2f6f73",
    fitted: "#bc4b51",
    noisy: "#111827",
    trueEigenvalue: "#1d4ed8",
    estimatedEigenvalue: "#d97706",
    projectedMode: "#6b7280",
    exactMode: "#7c3aed",
  };

  function add2(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function sub2(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  function scale2(value, scalar) {
    return [value[0] * scalar, value[1] * scalar];
  }

  function dot2(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function norm2(value) {
    return Math.hypot(value[0], value[1]);
  }

  function normalize2(value) {
    const magnitude = norm2(value);
    if (magnitude < 1.0e-12) {
      return [1, 0];
    }
    return [value[0] / magnitude, value[1] / magnitude];
  }

  function outer2(column, row) {
    return [
      [column[0] * row[0], column[0] * row[1]],
      [column[1] * row[0], column[1] * row[1]],
    ];
  }

  function addMatrix2(a, b) {
    return [
      [a[0][0] + b[0][0], a[0][1] + b[0][1]],
      [a[1][0] + b[1][0], a[1][1] + b[1][1]],
    ];
  }

  function matVec2(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function zeroMatrix2() {
    return [
      [0, 0],
      [0, 0],
    ];
  }

  function buildRotationDecayMatrix(rho, theta) {
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);
    return [
      [rho * cosine, -rho * sine],
      [rho * sine, rho * cosine],
    ];
  }

  function buildTrajectory(matrix, initialState, steps) {
    const states = [initialState.slice()];
    for (let index = 0; index < steps; index += 1) {
      states.push(matVec2(matrix, states[states.length - 1]));
    }
    return states;
  }

  function buildNoisySnapshots(cleanSnapshots, noiseLevel) {
    if (noiseLevel <= 0) {
      return cleanSnapshots.map((snapshot) => snapshot.slice());
    }

    return cleanSnapshots.map((snapshot, index) =>
      add2(snapshot, [
        noiseLevel *
          (0.85 * Math.cos(0.83 * index + 0.2) + 0.25 * Math.sin(1.91 * index)),
        noiseLevel *
          (0.75 * Math.sin(1.13 * index - 0.35) - 0.2 * Math.cos(2.27 * index)),
      ])
    );
  }

  function symmetricEigenDecomposition2(matrix) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const d = matrix[1][1];
    const trace = a + d;
    const radius = Math.hypot(a - d, 2 * b);
    const lambda1 = Math.max(0, 0.5 * (trace + radius));
    const lambda2 = Math.max(0, 0.5 * (trace - radius));

    let vector1;
    if (Math.abs(b) > 1.0e-12 || Math.abs(lambda1 - a) > 1.0e-12) {
      vector1 = normalize2([b, lambda1 - a]);
    } else {
      vector1 = a >= d ? [1, 0] : [0, 1];
    }

    const vector2 = [-vector1[1], vector1[0]];
    return {
      values: [lambda1, lambda2],
      vectors: [vector1, vector2],
    };
  }

  function eigenvalues2(matrix) {
    const trace = matrix[0][0] + matrix[1][1];
    const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const discriminant = trace * trace - 4 * determinant;

    if (discriminant >= 0) {
      const root = Math.sqrt(discriminant);
      return [
        { re: 0.5 * (trace + root), im: 0 },
        { re: 0.5 * (trace - root), im: 0 },
      ];
    }

    const root = Math.sqrt(-discriminant);
    return [
      { re: 0.5 * trace, im: 0.5 * root },
      { re: 0.5 * trace, im: -0.5 * root },
    ];
  }

  function fitRankTruncatedDmd(snapshots, rank) {
    const xColumns = snapshots.slice(0, -1);
    const yColumns = snapshots.slice(1);
    const gram = xColumns.reduce((accumulator, column) => {
      return addMatrix2(accumulator, outer2(column, column));
    }, zeroMatrix2());

    const decomposition = symmetricEigenDecomposition2(gram);
    const singularValues = decomposition.values.map((value) => Math.sqrt(value));
    const usable = [];
    const tolerance = Math.max(1.0e-10, (singularValues[0] || 0) * 1.0e-8);

    for (let index = 0; index < Math.min(rank, 2); index += 1) {
      if (singularValues[index] > tolerance) {
        usable.push({
          sigma: singularValues[index],
          u: decomposition.vectors[index],
        });
      }
    }

    const bColumns = usable.map(({ sigma, u }) => {
      const accumulator = yColumns.reduce((sum, yColumn, columnIndex) => {
        return add2(sum, scale2(yColumn, dot2(xColumns[columnIndex], u)));
      }, [0, 0]);
      return scale2(accumulator, 1 / (sigma * sigma));
    });

    const reducedOperator = usable.map((rowBasis) =>
      bColumns.map((column) => dot2(rowBasis.u, column))
    );

    const fittedMatrix = usable.reduce((sum, basis, index) => {
      return addMatrix2(sum, outer2(bColumns[index], basis.u));
    }, zeroMatrix2());

    const residualNumerator = yColumns.reduce((sum, yColumn, columnIndex) => {
      const mismatch = sub2(yColumn, matVec2(fittedMatrix, xColumns[columnIndex]));
      return sum + dot2(mismatch, mismatch);
    }, 0);
    const residualDenominator = yColumns.reduce(
      (sum, column) => sum + dot2(column, column),
      0
    );

    let projectedMode = null;
    let exactMode = null;
    let modeAngleDegrees = null;
    if (usable.length === 1) {
      const mu = reducedOperator[0][0];
      projectedMode = usable[0].u.slice();
      if (Math.abs(mu) > 1.0e-12) {
        exactMode = normalize2(scale2(bColumns[0], 1 / mu));
        const cosine = Math.max(-1, Math.min(1, dot2(projectedMode, exactMode)));
        modeAngleDegrees = (Math.acos(Math.abs(cosine)) * 180) / Math.PI;
      }
    }

    const estimatedEigenvalues =
      usable.length === 1
        ? [{ re: reducedOperator[0][0], im: 0 }]
        : eigenvalues2(reducedOperator);

    return {
      estimatedEigenvalues,
      exactMode,
      fittedMatrix,
      modeAngleDegrees,
      projectedMode,
      rank: usable.length,
      residual:
        residualDenominator > 1.0e-14
          ? Math.sqrt(residualNumerator / residualDenominator)
          : 0,
      singularValues,
    };
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

  function formatComplex(value) {
    const realText = value.re.toFixed(3);
    if (Math.abs(value.im) < 1.0e-9) {
      return realText;
    }
    const sign = value.im >= 0 ? "+" : "-";
    return `${realText} ${sign} ${Math.abs(value.im).toFixed(3)}i`;
  }

  function formatConjugatePair(values) {
    if (
      values.length === 2 &&
      Math.abs(values[0].re - values[1].re) < 1.0e-9 &&
      Math.abs(values[0].im + values[1].im) < 1.0e-9 &&
      Math.abs(values[0].im) > 1.0e-9
    ) {
      return `${values[0].re.toFixed(3)} ± ${Math.abs(values[0].im).toFixed(3)}i`;
    }

    return values.map(formatComplex).join(", ");
  }

  function eigenvalueTrace(values, name, color, xaxis, yaxis, symbol) {
    return {
      x: values.map((value) => value.re),
      y: values.map((value) => value.im),
      mode: "markers",
      marker: {
        color,
        size: 10,
        symbol,
        line: { color: "#ffffff", width: 1 },
      },
      name,
      xaxis,
      yaxis,
      hovertemplate: "Re=%{x:.3f}<br>Im=%{y:.3f}<extra></extra>",
    };
  }

  function unitCircleTrace(xaxis, yaxis) {
    const samples = 181;
    const theta = Array.from({ length: samples }, (_, index) => {
      return (2 * Math.PI * index) / (samples - 1);
    });
    return {
      x: theta.map((value) => Math.cos(value)),
      y: theta.map((value) => Math.sin(value)),
      mode: "lines",
      line: { color: "#9ca3af", dash: "dot", width: 2 },
      name: "unit circle",
      xaxis,
      yaxis,
      hoverinfo: "skip",
    };
  }

  function vectorTrace(vector, limit, name, color, xaxis, yaxis, dash) {
    const scaled = scale2(normalize2(vector), 0.9 * limit);
    return {
      x: [-scaled[0], scaled[0]],
      y: [-scaled[1], scaled[1]],
      mode: "lines",
      line: { color, dash, width: 2 },
      name,
      xaxis,
      yaxis,
      hoverinfo: "skip",
    };
  }

  function rmsDistance(cleanSnapshots, fittedSnapshots, startIndex) {
    const count = cleanSnapshots.length - startIndex;
    if (count <= 0) {
      return 0;
    }

    const total = cleanSnapshots.slice(startIndex).reduce((sum, snapshot, index) => {
      const mismatch = sub2(snapshot, fittedSnapshots[startIndex + index]);
      return sum + dot2(mismatch, mismatch);
    }, 0);
    return Math.sqrt(total / count);
  }

  async function initRotationDecayExplorer(element) {
    const plotly = await loadPlotly();
    let rho = numberFromDataset(element, "rho", 0.9);
    let theta = numberFromDataset(element, "theta", 0.7);
    let deltaT = numberFromDataset(element, "deltaT", 1.0);
    const trainingSnapshots = 3;
    const forecastSteps = 10;
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Rotation-Decay DMD from Two Snapshot Pairs",
      true
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const matrix = buildRotationDecayMatrix(rho, theta);
      const cleanSnapshots = buildTrajectory(matrix, [1, 0], forecastSteps);
      const fit = fitRankTruncatedDmd(cleanSnapshots.slice(0, trainingSnapshots), 2);
      const fittedRollout = buildTrajectory(fit.fittedMatrix, [1, 0], forecastSteps);
      if (requestId !== drawRequest) {
        return;
      }

      const conditionNumber =
        fit.singularValues[1] > 1.0e-12
          ? fit.singularValues[0] / fit.singularValues[1]
          : Infinity;
      const lambdaReal = Math.log(rho) / deltaT;
      const lambdaImag = theta / deltaT;
      const trueEigenvalues = [
        { re: rho * Math.cos(theta), im: rho * Math.sin(theta) },
        { re: rho * Math.cos(theta), im: -rho * Math.sin(theta) },
      ];

      readout.textContent =
        `The two-pair fit returns mu = ${formatConjugatePair(fit.estimatedEigenvalues)}. ` +
        `On the principal logarithm branch, lambda = ${lambdaReal.toFixed(3)} ± ` +
        `${lambdaImag.toFixed(3)}i. The snapshot matrix condition number is ` +
        `${Number.isFinite(conditionNumber) ? conditionNumber.toFixed(2) : "very large"}, ` +
        `so the recovery becomes delicate as theta approaches 0 or pi.`;

      const phaseLimit =
        1.2 *
        Math.max(
          1,
          ...cleanSnapshots.flatMap((snapshot) => snapshot.map((value) => Math.abs(value))),
          ...fittedRollout.flatMap((snapshot) => snapshot.map((value) => Math.abs(value)))
        );

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: cleanSnapshots.map((snapshot) => snapshot[0]),
            y: cleanSnapshots.map((snapshot) => snapshot[1]),
            mode: "lines+markers",
            line: { color: COLORS.clean, width: 3 },
            marker: { size: 7 },
            name: "exact trajectory",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          {
            x: fittedRollout.map((snapshot) => snapshot[0]),
            y: fittedRollout.map((snapshot) => snapshot[1]),
            mode: "lines",
            line: { color: COLORS.fitted, width: 2.5, dash: "dash" },
            name: "DMD rollout",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          {
            x: cleanSnapshots.slice(0, trainingSnapshots).map((snapshot) => snapshot[0]),
            y: cleanSnapshots.slice(0, trainingSnapshots).map((snapshot) => snapshot[1]),
            mode: "markers",
            marker: { color: COLORS.noisy, size: 9, symbol: "diamond" },
            name: "fit snapshots",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          unitCircleTrace("x2", "y2"),
          eigenvalueTrace(
            trueEigenvalues,
            "true mu",
            COLORS.trueEigenvalue,
            "x2",
            "y2",
            "circle"
          ),
          eigenvalueTrace(
            fit.estimatedEigenvalues,
            "DMD mu",
            COLORS.estimatedEigenvalue,
            "x2",
            "y2",
            "diamond"
          ),
        ],
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
            title: "Re(mu)",
            range: [-1.15, 1.15],
            zeroline: true,
          },
          yaxis2: {
            title: "Im(mu)",
            range: [-1.15, 1.15],
            scaleanchor: "x2",
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
        label: "Decay rho",
        min: 0.65,
        max: 0.99,
        step: 0.01,
        value: rho,
        onInput: (value) => {
          rho = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      }),
      makeRangeControl({
        label: "Angle theta",
        min: 0.15,
        max: 2.95,
        step: 0.05,
        value: theta,
        onInput: (value) => {
          theta = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      }),
      makeRangeControl({
        label: "Sample spacing Delta t",
        min: 0.25,
        max: 1.5,
        step: 0.05,
        value: deltaT,
        onInput: (value) => {
          deltaT = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  async function initRankNoiseExplorer(element) {
    const plotly = await loadPlotly();
    let rho = numberFromDataset(element, "rho", 0.94);
    let theta = numberFromDataset(element, "theta", 0.6);
    let noiseLevel = numberFromDataset(element, "noiseLevel", 0.04);
    let rank = String(element.dataset.rank || "2");
    const trainingPairs = 6;
    const totalSteps = 12;
    let drawRequest = 0;
    let isMounted = false;
    const { header, controls, readout, plot } = makeShell(
      "Rank Truncation and Noise Sensitivity in DMD",
      true
    );

    async function draw() {
      const requestId = drawRequest += 1;
      const matrix = buildRotationDecayMatrix(rho, theta);
      const cleanSnapshots = buildTrajectory(matrix, [1, 0], totalSteps);
      const noisySnapshots = buildNoisySnapshots(cleanSnapshots, noiseLevel);
      const fit = fitRankTruncatedDmd(noisySnapshots.slice(0, trainingPairs + 1), Number(rank));
      const fittedRollout = buildTrajectory(fit.fittedMatrix, [1, 0], totalSteps);
      if (requestId !== drawRequest) {
        return;
      }

      const trueEigenvalues = [
        { re: rho * Math.cos(theta), im: rho * Math.sin(theta) },
        { re: rho * Math.cos(theta), im: -rho * Math.sin(theta) },
      ];
      const holdoutRms = rmsDistance(cleanSnapshots, fittedRollout, trainingPairs + 1);
      const phaseLimit =
        1.25 *
        Math.max(
          1,
          ...cleanSnapshots.flatMap((snapshot) => snapshot.map((value) => Math.abs(value))),
          ...noisySnapshots.flatMap((snapshot) => snapshot.map((value) => Math.abs(value))),
          ...fittedRollout.flatMap((snapshot) => snapshot.map((value) => Math.abs(value)))
        );

      const singularText = fit.singularValues
        .map((value) => value.toFixed(3))
        .join(", ");
      const variantText =
        fit.rank === 1 && fit.projectedMode && fit.exactMode
          ? `At rank 1, the projected and exact lifts tilt apart by ${fit.modeAngleDegrees.toFixed(1)} degrees because the retained POD line is not invariant.`
          : fit.rank === 1
            ? "At rank 1, the conjugate pair collapses onto a single retained direction, so one real factor cannot capture the full rotation."
          : "At rank 2 in this planar example, projected and exact DMD share the same recovered invariant plane.";

      readout.textContent =
        `Retained rank ${fit.rank} with singular values sigma = ${singularText}. ` +
        `Estimated mu = ${formatConjugatePair(fit.estimatedEigenvalues)}, ` +
        `normalized one-step residual ${fit.residual.toFixed(3)}, and holdout RMS ` +
        `${holdoutRms.toFixed(3)}. ${variantText}`;

      const traces = [
        {
          x: cleanSnapshots.map((snapshot) => snapshot[0]),
          y: cleanSnapshots.map((snapshot) => snapshot[1]),
          mode: "lines+markers",
          line: { color: COLORS.clean, width: 3 },
          marker: { size: 5 },
          name: "clean trajectory",
          xaxis: "x",
          yaxis: "y",
          hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
        },
        {
          x: noisySnapshots.slice(0, trainingPairs + 1).map((snapshot) => snapshot[0]),
          y: noisySnapshots.slice(0, trainingPairs + 1).map((snapshot) => snapshot[1]),
          mode: "markers",
          marker: { color: COLORS.noisy, size: 8, symbol: "diamond" },
          name: "noisy fit window",
          xaxis: "x",
          yaxis: "y",
          hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
        },
        {
          x: fittedRollout.map((snapshot) => snapshot[0]),
          y: fittedRollout.map((snapshot) => snapshot[1]),
          mode: "lines",
          line: { color: COLORS.fitted, width: 2.5, dash: "dash" },
          name: "DMD rollout",
          xaxis: "x",
          yaxis: "y",
          hovertemplate: "x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
        },
        unitCircleTrace("x2", "y2"),
        eigenvalueTrace(
          trueEigenvalues,
          "true mu",
          COLORS.trueEigenvalue,
          "x2",
          "y2",
          "circle"
        ),
        eigenvalueTrace(
          fit.estimatedEigenvalues,
          "DMD mu",
          COLORS.estimatedEigenvalue,
          "x2",
          "y2",
          "diamond"
        ),
      ];

      if (fit.rank === 1 && fit.projectedMode && fit.exactMode) {
        traces.push(
          vectorTrace(
            fit.projectedMode,
            phaseLimit,
            "projected mode",
            COLORS.projectedMode,
            "x",
            "y",
            "dot"
          ),
          vectorTrace(
            fit.exactMode,
            phaseLimit,
            "exact mode",
            COLORS.exactMode,
            "x",
            "y",
            "dashdot"
          )
        );
      }

      await renderPlotly(
        plotly,
        plot,
        traces,
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
            title: "Re(mu)",
            range: [-1.15, 1.15],
            zeroline: true,
          },
          yaxis2: {
            title: "Im(mu)",
            range: [-1.15, 1.15],
            scaleanchor: "x2",
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
      makeSelectControl({
        label: "Retained rank",
        options: [
          { label: "Rank 2", value: "2" },
          { label: "Rank 1", value: "1" },
        ],
        value: rank,
        onInput: (value) => {
          rank = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      }),
      makeRangeControl({
        label: "Decay rho",
        min: 0.85,
        max: 0.99,
        step: 0.01,
        value: rho,
        onInput: (value) => {
          rho = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      }),
      makeRangeControl({
        label: "Angle theta",
        min: 0.25,
        max: 1.1,
        step: 0.05,
        value: theta,
        onInput: (value) => {
          theta = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      }),
      makeRangeControl({
        label: "Noise level",
        min: 0,
        max: 0.12,
        step: 0.005,
        value: noiseLevel,
        onInput: (value) => {
          noiseLevel = value;
          if (!isMounted) {
            return;
          }
          draw().catch(console.error);
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter10-rotation-decay-dmd", initRotationDecayExplorer);
  registerExample("chapter10-rank-noise-dmd", initRankNoiseExplorer);
})();
