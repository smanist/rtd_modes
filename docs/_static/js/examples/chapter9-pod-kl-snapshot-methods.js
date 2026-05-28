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

  const EPSILON = 1e-9;
  const snapshotColors = ["#2f6f73", "#bc4b51"];
  const modeColors = ["#1f4e79", "#8a6d1d"];
  const heatmapScale = [
    [0, "#bc4b51"],
    [0.5, "#f4f1de"],
    [1, "#2f6f73"],
  ];

  function formatNumber(value, digits = 3) {
    return Number(value).toFixed(digits);
  }

  function formatPercent(value) {
    return `${(100 * value).toFixed(1)}%`;
  }

  function scaleVector(vector, factor) {
    return vector.map((value) => factor * value);
  }

  function normalizeVector(vector) {
    const norm = Math.hypot(...vector);
    if (norm < EPSILON) {
      return vector.slice();
    }

    return scaleVector(vector, 1 / norm);
  }

  function canonicalizeVector(vector) {
    const index = vector.findIndex((value) => Math.abs(value) > EPSILON);
    if (index >= 0 && vector[index] < 0) {
      return scaleVector(vector, -1);
    }

    return vector.slice();
  }

  function multiplyMatrixVector(matrix, vector) {
    return matrix.map(
      (row) => row.reduce((sum, entry, index) => sum + entry * vector[index], 0)
    );
  }

  function outerProduct(left, right) {
    return left.map((leftValue) => right.map((rightValue) => leftValue * rightValue));
  }

  function addMatrices(left, right) {
    return left.map((row, rowIndex) =>
      row.map((entry, columnIndex) => entry + right[rowIndex][columnIndex])
    );
  }

  function subtractMatrices(left, right) {
    return left.map((row, rowIndex) =>
      row.map((entry, columnIndex) => entry - right[rowIndex][columnIndex])
    );
  }

  function frobeniusSquared(matrix) {
    return matrix.reduce(
      (sum, row) =>
        sum + row.reduce((rowSum, entry) => rowSum + entry * entry, 0),
      0
    );
  }

  function columnSquaredNorms(matrix) {
    const columnCount = matrix[0].length;
    const norms = Array.from({ length: columnCount }, () => 0);

    matrix.forEach((row) => {
      row.forEach((entry, columnIndex) => {
        norms[columnIndex] += entry * entry;
      });
    });

    return norms;
  }

  function eigendecomposeSymmetric2x2(a11, a12, a22) {
    const trace = a11 + a22;
    const gap = a11 - a22;
    const disc = Math.sqrt(gap * gap + 4 * a12 * a12);
    const lambda1 = Math.max(0, 0.5 * (trace + disc));
    const lambda2 = Math.max(0, 0.5 * (trace - disc));

    let vector1;
    if (Math.abs(a12) > EPSILON) {
      vector1 = normalizeVector([a12, lambda1 - a11]);
      if (Math.hypot(...vector1) < EPSILON) {
        vector1 = normalizeVector([lambda1 - a22, a12]);
      }
    } else if (a11 >= a22) {
      vector1 = [1, 0];
    } else {
      vector1 = [0, 1];
    }

    vector1 = canonicalizeVector(vector1);
    const vector2 = canonicalizeVector(normalizeVector([-vector1[1], vector1[0]]));

    return {
      values: [lambda1, lambda2],
      vectors: [vector1, vector2],
    };
  }

  function buildSnapshotData(a, b) {
    const matrix = [
      [1, 0],
      [0, 1],
      [a, b],
    ];
    const gram = [
      [1 + a * a, a * b],
      [a * b, 1 + b * b],
    ];
    const eigen = eigendecomposeSymmetric2x2(gram[0][0], gram[0][1], gram[1][1]);
    const singularValues = eigen.values.map((value) => Math.sqrt(Math.max(0, value)));
    const leftModes = eigen.vectors.map((vector, index) =>
      normalizeVector(scaleVector(multiplyMatrixVector(matrix, vector), 1 / singularValues[index]))
    );
    const totalEnergy = singularValues[0] ** 2 + singularValues[1] ** 2;

    return {
      a,
      b,
      matrix,
      gram,
      rightVectors: eigen.vectors,
      leftModes,
      singularValues,
      modalEnergies: singularValues.map((value) => value * value),
      totalEnergy,
    };
  }

  function reconstructAtRank(data, rank) {
    let approximation = data.matrix.map((row) => row.map(() => 0));
    for (let index = 0; index < rank; index += 1) {
      const term = outerProduct(
        data.leftModes[index],
        scaleVector(data.rightVectors[index], data.singularValues[index])
      );
      approximation = addMatrices(approximation, term);
    }

    const residual = subtractMatrices(data.matrix, approximation);
    const errorSquared = frobeniusSquared(residual);

    return {
      approximation,
      residual,
      errorSquared,
      capturedEnergy:
        data.totalEnergy > EPSILON ? 1 - errorSquared / data.totalEnergy : 1,
      columnErrors: columnSquaredNorms(residual),
    };
  }

  function symmetryNote(a, b) {
    if (Math.abs(a - b) < 0.05) {
      return "Matching third entries keeps the average/difference structure of the worked example visible.";
    }

    return "Breaking the symmetry rotates the POD modes away from the exact average/difference pair.";
  }

  function snapshotAndModeTraces(data) {
    const stateLabels = ["state 1", "state 2", "state 3"];
    return [
      {
        x: stateLabels,
        y: data.matrix.map((row) => row[0]),
        type: "bar",
        name: "snapshot x_0",
        marker: { color: snapshotColors[0] },
        xaxis: "x",
        yaxis: "y",
        hovertemplate: "x_0(%{x}) = %{y:.3f}<extra></extra>",
      },
      {
        x: stateLabels,
        y: data.matrix.map((row) => row[1]),
        type: "bar",
        name: "snapshot x_1",
        marker: { color: snapshotColors[1] },
        xaxis: "x",
        yaxis: "y",
        hovertemplate: "x_1(%{x}) = %{y:.3f}<extra></extra>",
      },
      {
        x: stateLabels,
        y: data.leftModes[0],
        type: "bar",
        name: "mode phi_1",
        marker: { color: modeColors[0] },
        xaxis: "x2",
        yaxis: "y2",
        hovertemplate: "phi_1(%{x}) = %{y:.3f}<extra></extra>",
      },
      {
        x: stateLabels,
        y: data.leftModes[1],
        type: "bar",
        name: "mode phi_2",
        marker: { color: modeColors[1] },
        xaxis: "x2",
        yaxis: "y2",
        hovertemplate: "phi_2(%{x}) = %{y:.3f}<extra></extra>",
      },
    ];
  }

  function makeMatrixHeatmap(matrix, xaxis, yaxis, name, limit) {
    return {
      z: matrix,
      x: ["snapshot x_0", "snapshot x_1"],
      y: ["state 1", "state 2", "state 3"],
      type: "heatmap",
      xaxis,
      yaxis,
      name,
      colorscale: heatmapScale,
      zmid: 0,
      zmin: -limit,
      zmax: limit,
      showscale: false,
      hovertemplate: "%{y}, %{x}: %{z:.3f}<extra></extra>",
    };
  }

  async function initChapter9PodSpectrumExplorer(element) {
    const plotly = await loadPlotly();
    let a = numberFromDataset(element, "a", 1);
    let b = numberFromDataset(element, "b", 1);
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const detail = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Tiny Snapshot-Matrix POD Explorer";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    detail.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    function draw() {
      const data = buildSnapshotData(a, b);
      const gamma1 = data.modalEnergies[0] / data.totalEnergy;
      const rankOneError = data.modalEnergies[1];
      const modeLimit =
        1.1 *
        Math.max(
          ...data.matrix.flat().map((value) => Math.abs(value)),
          ...data.leftModes.flat().map((value) => Math.abs(value)),
          1
        );

      readout.textContent =
        `sigma_1 = ${formatNumber(data.singularValues[0])}, ` +
        `sigma_2 = ${formatNumber(data.singularValues[1])}. ` +
        `The leading POD mode captures ${formatPercent(gamma1)} of ||X||_F^2, ` +
        `so the optimal rank-one error is ||X - X_1||_F^2 = sigma_2^2 = ${formatNumber(rankOneError)}.`;

      detail.textContent =
        `For G = X^T X, the snapshot eigenvalues are ${formatNumber(data.modalEnergies[0])} and ` +
        `${formatNumber(data.modalEnergies[1])}. ${symmetryNote(a, b)}`;

      renderPlotly(
        plotly,
        plot,
        snapshotAndModeTraces(data),
        {
          grid: { rows: 1, columns: 2, pattern: "independent" },
          margin: { t: 48, r: 20, b: 55, l: 58 },
          barmode: "group",
          xaxis: { title: "snapshot entries" },
          yaxis: { title: "value", range: [-modeLimit, modeLimit] },
          xaxis2: { title: "POD mode entries" },
          yaxis2: { title: "value", range: [-modeLimit, modeLimit] },
          annotations: [
            {
              text: "snapshot columns",
              x: 0.19,
              y: 1.12,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
            {
              text: "spatial POD modes",
              x: 0.82,
              y: 1.12,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
          ],
          legend: { orientation: "h", x: 0, y: 1.24 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Third entry of x_0",
        min: 0,
        max: 2,
        step: 0.1,
        value: a,
        onInput: (value) => {
          a = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Third entry of x_1",
        min: 0,
        max: 2,
        step: 0.1,
        value: b,
        onInput: (value) => {
          b = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, detail, plot);
    isMounted = true;
    draw();
  }

  async function initChapter9RankReconstructionExplorer(element) {
    const plotly = await loadPlotly();
    let a = numberFromDataset(element, "a", 1);
    let b = numberFromDataset(element, "b", 1);
    let rank = String(Math.round(numberFromDataset(element, "rank", 1)));
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const detail = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Retained Rank and Reconstruction Error";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    detail.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    function draw() {
      const data = buildSnapshotData(a, b);
      const rankValue = Number(rank);
      const current = reconstructAtRank(data, rankValue);
      const byRank = [0, 1, 2].map((candidate) => reconstructAtRank(data, candidate));
      const heatmapLimit =
        1.1 *
        Math.max(
          ...data.matrix.flat().map((value) => Math.abs(value)),
          ...current.approximation.flat().map((value) => Math.abs(value)),
          1
        );

      readout.textContent =
        `Keeping r = ${rankValue} captures ${formatPercent(current.capturedEnergy)} of ||X||_F^2 ` +
        `and leaves ||X - X_r||_F^2 = ${formatNumber(current.errorSquared)}. ` +
        `For this family, the optimal error is exactly the sum of the discarded sigma_j^2 terms.`;

      detail.textContent =
        `Residual energy by snapshot column: x_0 -> ${formatNumber(current.columnErrors[0])}, ` +
        `x_1 -> ${formatNumber(current.columnErrors[1])}.`;

      renderPlotly(
        plotly,
        plot,
        [
          makeMatrixHeatmap(data.matrix, "x", "y", "original X", heatmapLimit),
          makeMatrixHeatmap(
            current.approximation,
            "x2",
            "y2",
            `rank-${rankValue} reconstruction`,
            heatmapLimit
          ),
          {
            x: ["r = 0", "r = 1", "r = 2"],
            y: byRank.map((entry) => entry.errorSquared),
            type: "bar",
            marker: {
              color: [0, 1, 2].map((candidate) =>
                candidate === rankValue ? "#bc4b51" : "#c9ced6"
              ),
            },
            name: "reconstruction error",
            xaxis: "x3",
            yaxis: "y3",
            hovertemplate: "rank %{x}: ||X - X_r||_F^2 = %{y:.3f}<extra></extra>",
          },
          {
            x: ["r = 0", "r = 1", "r = 2"],
            y: byRank.map((entry) => entry.capturedEnergy),
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "#1f4e79", size: 9 },
            line: { color: "#1f4e79", width: 3 },
            name: "captured energy",
            xaxis: "x3",
            yaxis: "y4",
            hovertemplate: "rank %{x}: captured = %{y:.1%}<extra></extra>",
          },
        ],
        {
          grid: { rows: 1, columns: 3, pattern: "independent" },
          margin: { t: 48, r: 58, b: 60, l: 58 },
          xaxis: { title: "original X" },
          yaxis: { title: "state", autorange: "reversed" },
          xaxis2: { title: `reconstruction X_${rankValue}` },
          yaxis2: { title: "state", autorange: "reversed" },
          xaxis3: { title: "retained rank" },
          yaxis3: { title: "error", rangemode: "tozero" },
          yaxis4: {
            title: "captured energy",
            overlaying: "y3",
            side: "right",
            range: [0, 1.05],
            tickformat: ".0%",
          },
          annotations: [
            {
              text: "original snapshots",
              x: 0.11,
              y: 1.12,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
            {
              text: `best rank-${rankValue} approximation`,
              x: 0.5,
              y: 1.12,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
            {
              text: "error and captured energy",
              x: 0.88,
              y: 1.12,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
          ],
          legend: { orientation: "h", x: 0, y: 1.24 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Third entry of x_0",
        min: 0,
        max: 2,
        step: 0.1,
        value: a,
        onInput: (value) => {
          a = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Third entry of x_1",
        min: 0,
        max: 2,
        step: 0.1,
        value: b,
        onInput: (value) => {
          b = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeSelectControl({
        label: "Retained rank",
        options: [
          { label: "r = 0", value: "0" },
          { label: "r = 1", value: "1" },
          { label: "r = 2", value: "2" },
        ],
        value: rank,
        onInput: (value) => {
          rank = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, detail, plot);
    isMounted = true;
    draw();
  }

  registerExample("chapter9-pod-spectrum-explorer", initChapter9PodSpectrumExplorer);
  registerExample(
    "chapter9-rank-reconstruction-explorer",
    initChapter9RankReconstructionExplorer
  );
})();
