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
  const COLORS = {
    response: "#2f6f73",
    forcing: "#bc4b51",
    spod: "#8a6d1d",
    secondary: "#7b4f9d",
  };

  function complex(re, im = 0) {
    return { re, im };
  }

  function cAdd(left, right) {
    return complex(left.re + right.re, left.im + right.im);
  }

  function cSub(left, right) {
    return complex(left.re - right.re, left.im - right.im);
  }

  function cMul(left, right) {
    return complex(
      left.re * right.re - left.im * right.im,
      left.re * right.im + left.im * right.re
    );
  }

  function cConj(value) {
    return complex(value.re, -value.im);
  }

  function cScale(value, factor) {
    return complex(value.re * factor, value.im * factor);
  }

  function cAbsSquared(value) {
    return value.re * value.re + value.im * value.im;
  }

  function cAbs(value) {
    return Math.sqrt(cAbsSquared(value));
  }

  function cDiv(left, right) {
    const denominator = cAbsSquared(right);
    if (denominator < EPSILON) {
      return complex(0, 0);
    }

    return complex(
      (left.re * right.re + left.im * right.im) / denominator,
      (left.im * right.re - left.re * right.im) / denominator
    );
  }

  function cArg(value) {
    return Math.atan2(value.im, value.re);
  }

  function cExp(theta) {
    return complex(Math.cos(theta), Math.sin(theta));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function identity2() {
    return [
      [complex(1, 0), complex(0, 0)],
      [complex(0, 0), complex(1, 0)],
    ];
  }

  function diagonal2(first, second) {
    return [
      [complex(first, 0), complex(0, 0)],
      [complex(0, 0), complex(second, 0)],
    ];
  }

  function symmetric2(a11, a12, a22) {
    return [
      [complex(a11, 0), complex(a12, 0)],
      [complex(a12, 0), complex(a22, 0)],
    ];
  }

  function matrixConjugateTranspose(matrix) {
    return [
      [cConj(matrix[0][0]), cConj(matrix[1][0])],
      [cConj(matrix[0][1]), cConj(matrix[1][1])],
    ];
  }

  function matrixMultiply(left, right) {
    return [
      [
        cAdd(cMul(left[0][0], right[0][0]), cMul(left[0][1], right[1][0])),
        cAdd(cMul(left[0][0], right[0][1]), cMul(left[0][1], right[1][1])),
      ],
      [
        cAdd(cMul(left[1][0], right[0][0]), cMul(left[1][1], right[1][0])),
        cAdd(cMul(left[1][0], right[0][1]), cMul(left[1][1], right[1][1])),
      ],
    ];
  }

  function matrixVectorMultiply(matrix, vector) {
    return [
      cAdd(cMul(matrix[0][0], vector[0]), cMul(matrix[0][1], vector[1])),
      cAdd(cMul(matrix[1][0], vector[0]), cMul(matrix[1][1], vector[1])),
    ];
  }

  function normalizeVector(vector) {
    const norm = Math.sqrt(cAbsSquared(vector[0]) + cAbsSquared(vector[1]));
    if (norm < EPSILON) {
      return [complex(1, 0), complex(0, 0)];
    }

    return [cScale(vector[0], 1 / norm), cScale(vector[1], 1 / norm)];
  }

  function orthogonalVector(vector) {
    return normalizeVector([
      cScale(cConj(vector[1]), -1),
      cConj(vector[0]),
    ]);
  }

  function alignVectorPhase(vector) {
    const index = cAbsSquared(vector[0]) >= cAbsSquared(vector[1]) ? 0 : 1;
    const phase = -cArg(vector[index]);
    const factor = cExp(phase);
    return vector.map((entry) => cMul(entry, factor));
  }

  function innerProduct(left, right) {
    return cAdd(cMul(cConj(left[0]), right[0]), cMul(cConj(left[1]), right[1]));
  }

  function subspaceAngleDegrees(left, right) {
    const overlap = clamp(cAbs(innerProduct(left, right)), 0, 1);
    return (Math.acos(overlap) * 180) / Math.PI;
  }

  function hermitianEigenDecomposition(matrix) {
    const a = matrix[0][0].re;
    const d = matrix[1][1].re;
    const b = cScale(cAdd(matrix[0][1], cConj(matrix[1][0])), 0.5);
    const traceHalf = 0.5 * (a + d);
    const diffHalf = 0.5 * (a - d);
    const radius = Math.sqrt(diffHalf * diffHalf + cAbsSquared(b));
    const lambda1 = traceHalf + radius;
    const lambda2 = traceHalf - radius;

    function eigenvector(lambda) {
      if (cAbs(b) > EPSILON || Math.abs(lambda - a) > EPSILON) {
        return normalizeVector([b, complex(lambda - a, 0)]);
      }
      if (a >= d) {
        return [complex(1, 0), complex(0, 0)];
      }
      return [complex(0, 0), complex(1, 0)];
    }

    const vector1 = alignVectorPhase(eigenvector(lambda1));
    const vector2 = alignVectorPhase(orthogonalVector(vector1));
    return {
      values: [lambda1, lambda2],
      vectors: [vector1, vector2],
    };
  }

  function resolventMatrix(alpha, beta, kappa, omega) {
    const diagonal = complex(alpha, omega);
    const denominator = cAdd(
      cMul(diagonal, diagonal),
      complex(beta * (beta + kappa), 0)
    );

    return [
      [cDiv(diagonal, denominator), cDiv(complex(beta + kappa, 0), denominator)],
      [cDiv(complex(-beta, 0), denominator), cDiv(diagonal, denominator)],
    ];
  }

  function resolventSvd(alpha, beta, kappa, omega) {
    const resolvent = resolventMatrix(alpha, beta, kappa, omega);
    const gram = matrixMultiply(matrixConjugateTranspose(resolvent), resolvent);
    const eig = hermitianEigenDecomposition(gram);
    const sigma1 = Math.sqrt(Math.max(eig.values[0], 0));
    const sigma2 = Math.sqrt(Math.max(eig.values[1], 0));
    const forcing1 = eig.vectors[0];
    const forcing2 = eig.vectors[1];
    const response1 =
      sigma1 > EPSILON
        ? alignVectorPhase(normalizeVector(matrixVectorMultiply(resolvent, forcing1)))
        : [complex(1, 0), complex(0, 0)];
    const response2 =
      sigma2 > EPSILON
        ? alignVectorPhase(normalizeVector(matrixVectorMultiply(resolvent, forcing2)))
        : alignVectorPhase(orthogonalVector(response1));

    return {
      resolvent,
      sigma1,
      sigma2,
      forcingVectors: [forcing1, forcing2],
      responseVectors: [response1, response2],
    };
  }

  function forcingModel(name) {
    if (name === "x1-heavy") {
      return {
        label: "x1-heavy forcing",
        matrix: diagonal2(9, 1),
      };
    }
    if (name === "correlated") {
      return {
        label: "correlated forcing",
        matrix: symmetric2(1, 0.95, 1),
      };
    }
    return {
      label: "white forcing",
      matrix: identity2(),
    };
  }

  function analyzeSpod(alpha, beta, kappa, omega, forcingName) {
    const svd = resolventSvd(alpha, beta, kappa, omega);
    const forcing = forcingModel(forcingName);
    const forcingBasis = [
      [svd.forcingVectors[0][0], svd.forcingVectors[1][0]],
      [svd.forcingVectors[0][1], svd.forcingVectors[1][1]],
    ];
    const csd = matrixMultiply(
      matrixMultiply(svd.resolvent, forcing.matrix),
      matrixConjugateTranspose(svd.resolvent)
    );
    const spod = hermitianEigenDecomposition(csd);
    const projectedForcing = matrixMultiply(
      matrixMultiply(matrixConjugateTranspose(forcingBasis), forcing.matrix),
      forcingBasis
    );

    return {
      ...svd,
      csd,
      forcing,
      spodValues: spod.values,
      spodVectors: spod.vectors,
      projectedForcing,
    };
  }

  function harmonicOrbit(vector, samples = 181) {
    const aligned = alignVectorPhase(vector);
    const x = [];
    const y = [];

    for (let index = 0; index < samples; index += 1) {
      const theta = (2 * Math.PI * index) / (samples - 1);
      const phase = cExp(theta);
      x.push(cMul(aligned[0], phase).re);
      y.push(cMul(aligned[1], phase).re);
    }

    return { x, y };
  }

  function matrixMagnitude(matrix) {
    return [
      [cAbs(matrix[0][0]), cAbs(matrix[0][1])],
      [cAbs(matrix[1][0]), cAbs(matrix[1][1])],
    ];
  }

  function makeShell(titleText) {
    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plots = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = titleText;
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plots.style.display = "grid";
    plots.style.gap = "1rem";
    plots.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
    header.append(title);

    return { header, controls, readout, plots };
  }

  async function initChapter12ResolventGainDirections(element) {
    const plotly = await loadPlotly();
    const alpha = numberFromDataset(element, "alpha", 0.35);
    const beta = numberFromDataset(element, "beta", 1.2);
    let kappa = numberFromDataset(element, "kappa", 0.8);
    let omega = numberFromDataset(element, "omega", 1.45);
    const omegaMax = 3.0;
    const frequencySamples = 181;
    let isMounted = false;
    const { header, controls, readout, plots } = makeShell(
      "Resolvent Gains and Leading Harmonic Directions"
    );
    const gainPlot = document.createElement("div");
    const orbitPlot = document.createElement("div");

    gainPlot.className = "course-interactive__plot";
    orbitPlot.className = "course-interactive__plot";
    plots.append(gainPlot, orbitPlot);

    function draw() {
      const frequencies = [];
      const sigma1Curve = [];
      const sigma2Curve = [];

      for (let index = 0; index < frequencySamples; index += 1) {
        const sampleOmega = (omegaMax * index) / (frequencySamples - 1);
        const sample = resolventSvd(alpha, beta, kappa, sampleOmega);
        frequencies.push(sampleOmega);
        sigma1Curve.push(sample.sigma1);
        sigma2Curve.push(sample.sigma2);
      }

      const selected = resolventSvd(alpha, beta, kappa, omega);
      const naturalFrequency = Math.sqrt(beta * (beta + kappa));
      const forcingOrbit = harmonicOrbit(selected.forcingVectors[0]);
      const responseOrbit = harmonicOrbit(selected.responseVectors[0]);

      readout.textContent =
        `At omega = ${omega.toFixed(2)}, sigma_1 = ${selected.sigma1.toFixed(3)} and ` +
        `sigma_2 = ${selected.sigma2.toFixed(3)} ` +
        `(gain ratio ${(selected.sigma1 / Math.max(selected.sigma2, EPSILON)).toFixed(2)}). ` +
        `The damped natural frequency sqrt(beta(beta + kappa)) is ` +
        `${naturalFrequency.toFixed(2)}.`;

      renderPlotly(
        plotly,
        gainPlot,
        [
          {
            x: frequencies,
            y: sigma1Curve,
            mode: "lines",
            line: { color: COLORS.response, width: 3 },
            name: "sigma_1",
          },
          {
            x: frequencies,
            y: sigma2Curve,
            mode: "lines",
            line: { color: COLORS.secondary, width: 3, dash: "dash" },
            name: "sigma_2",
          },
          {
            x: [omega, omega],
            y: [0, Math.max(selected.sigma1, selected.sigma2)],
            mode: "lines",
            line: { color: COLORS.forcing, width: 2, dash: "dot" },
            name: "selected omega",
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 65 },
          title: { text: "Resolvent gain versus frequency", font: { size: 14 } },
          xaxis: { title: "omega", range: [0, omegaMax] },
          yaxis: { title: "singular value", rangemode: "tozero" },
          legend: { orientation: "h", x: 0, y: 1.15 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );

      renderPlotly(
        plotly,
        orbitPlot,
        [
          {
            x: forcingOrbit.x,
            y: forcingOrbit.y,
            mode: "lines",
            line: { color: COLORS.forcing, width: 3, dash: "dash" },
            name: "optimal forcing v_1",
          },
          {
            x: responseOrbit.x,
            y: responseOrbit.y,
            mode: "lines",
            line: { color: COLORS.response, width: 3 },
            name: "response mode u_1",
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 55 },
          title: { text: "Leading harmonic forcing and response shapes", font: { size: 14 } },
          xaxis: {
            title: "x_1",
            range: [-1.1, 1.1],
            zeroline: true,
            zerolinecolor: "#999999",
          },
          yaxis: {
            title: "x_2",
            range: [-1.1, 1.1],
            zeroline: true,
            zerolinecolor: "#999999",
            scaleanchor: "x",
            scaleratio: 1,
          },
          legend: { orientation: "h", x: 0, y: 1.15 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Asymmetry kappa",
        min: 0,
        max: 2,
        step: 0.05,
        value: kappa,
        onInput: (value) => {
          kappa = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Frequency omega",
        min: 0,
        max: omegaMax,
        step: 0.02,
        value: omega,
        onInput: (value) => {
          omega = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plots);
    isMounted = true;
    draw();
  }

  async function initChapter12SpodResolventComparison(element) {
    const plotly = await loadPlotly();
    const alpha = numberFromDataset(element, "alpha", 0.35);
    const beta = numberFromDataset(element, "beta", 1.2);
    let kappa = numberFromDataset(element, "kappa", 0.8);
    let omega = numberFromDataset(element, "omega", 0.8);
    let forcingName = element.dataset.forcing || "white";
    const omegaMax = 3.0;
    let isMounted = false;
    const { header, controls, readout, plots } = makeShell(
      "SPOD Mode Versus Resolvent Response Mode"
    );
    const csdPlot = document.createElement("div");
    const orbitPlot = document.createElement("div");

    csdPlot.className = "course-interactive__plot";
    orbitPlot.className = "course-interactive__plot";
    plots.append(csdPlot, orbitPlot);

    function draw() {
      const analysis = analyzeSpod(alpha, beta, kappa, omega, forcingName);
      const leadingEnergyFraction =
        analysis.spodValues[0] /
        Math.max(analysis.spodValues[0] + analysis.spodValues[1], EPSILON);
      const angle = subspaceAngleDegrees(
        analysis.responseVectors[0],
        analysis.spodVectors[0]
      );
      const forcingMixing =
        cAbs(analysis.projectedForcing[0][1]) /
        Math.max(
          analysis.projectedForcing[0][0].re + analysis.projectedForcing[1][1].re,
          EPSILON
        );
      const responseOrbit = harmonicOrbit(analysis.responseVectors[0]);
      const spodOrbit = harmonicOrbit(analysis.spodVectors[0]);
      const csdMagnitude = matrixMagnitude(analysis.csd);

      readout.textContent =
        `${analysis.forcing.label} at omega = ${omega.toFixed(2)} gives a ` +
        `${angle.toFixed(1)} degree angle between the leading SPOD mode and the ` +
        `leading resolvent response mode. The leading SPOD eigenvalue carries ` +
        `${(100 * leadingEnergyFraction).toFixed(1)}% of tr(S_x), and the forcing ` +
        `mixing term |V^* S_f V|_12 / tr(S_f) is ${forcingMixing.toFixed(3)}.`;

      renderPlotly(
        plotly,
        csdPlot,
        [
          {
            x: ["x_1", "x_2"],
            y: ["x_1", "x_2"],
            z: csdMagnitude,
            type: "heatmap",
            colorscale: "YlGnBu",
            showscale: true,
            hovertemplate: "|S_x|(%{y}, %{x}) = %{z:.3f}<extra></extra>",
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 55 },
          title: { text: "Cross-spectral density magnitude", font: { size: 14 } },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );

      renderPlotly(
        plotly,
        orbitPlot,
        [
          {
            x: responseOrbit.x,
            y: responseOrbit.y,
            mode: "lines",
            line: { color: COLORS.response, width: 3 },
            name: "resolvent response u_1",
          },
          {
            x: spodOrbit.x,
            y: spodOrbit.y,
            mode: "lines",
            line: { color: COLORS.spod, width: 3, dash: "dash" },
            name: "leading SPOD mode phi_1",
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 55 },
          title: { text: "Leading modal shapes in the x_1-x_2 plane", font: { size: 14 } },
          xaxis: {
            title: "x_1",
            range: [-1.1, 1.1],
            zeroline: true,
            zerolinecolor: "#999999",
          },
          yaxis: {
            title: "x_2",
            range: [-1.1, 1.1],
            zeroline: true,
            zerolinecolor: "#999999",
            scaleanchor: "x",
            scaleratio: 1,
          },
          legend: { orientation: "h", x: 0, y: 1.15 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Asymmetry kappa",
        min: 0,
        max: 2,
        step: 0.05,
        value: kappa,
        onInput: (value) => {
          kappa = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Frequency omega",
        min: 0,
        max: omegaMax,
        step: 0.02,
        value: omega,
        onInput: (value) => {
          omega = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeSelectControl({
        label: "Forcing statistics",
        value: forcingName,
        options: [
          { value: "white", label: "white" },
          { value: "x1-heavy", label: "x1-heavy" },
          { value: "correlated", label: "correlated" },
        ],
        onInput: (value) => {
          forcingName = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plots);
    isMounted = true;
    draw();
  }

  registerExample(
    "chapter12-resolvent-gain-directions",
    initChapter12ResolventGainDirections
  );
  registerExample(
    "chapter12-spod-resolvent-comparison",
    initChapter12SpodResolventComparison
  );
})();
