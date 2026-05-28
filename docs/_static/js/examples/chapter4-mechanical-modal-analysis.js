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

  const colors = {
    mode1: "#2f6f73",
    mode2: "#bc4b51",
    q1: "#1d4ed8",
    q2: "#8a6d1d",
  };

  const forcePatterns = {
    symmetric: {
      label: "symmetric (1, 1)",
      vector: [1, 1],
    },
    antisymmetric: {
      label: "antisymmetric (1, -1)",
      vector: [1, -1],
    },
    left: {
      label: "left mass only (1, 0)",
      vector: [1, 0],
    },
  };

  function modeVector(aValue, bValue, dValue, eigenvalue, modeIndex) {
    let vector;
    if (Math.abs(bValue) > 1e-10) {
      vector = [bValue, eigenvalue - aValue];
    } else if (modeIndex === 0) {
      vector = aValue <= dValue ? [1, 0] : [0, 1];
    } else {
      vector = aValue <= dValue ? [0, 1] : [1, 0];
    }

    let norm = Math.hypot(vector[0], vector[1]);
    if (norm < 1e-10) {
      vector = [eigenvalue - dValue, bValue];
      norm = Math.hypot(vector[0], vector[1]);
    }

    return [vector[0] / norm, vector[1] / norm];
  }

  function computeModes(massRatio, stiffnessRatio, couplingRatio) {
    const m1 = 1;
    const m2 = massRatio;
    const k1 = 1;
    const k2 = stiffnessRatio;
    const kc = couplingRatio;

    const aValue = (k1 + kc) / m1;
    const dValue = (k2 + kc) / m2;
    const bValue = -kc / Math.sqrt(m1 * m2);
    const trace = aValue + dValue;
    const gap = Math.sqrt((aValue - dValue) ** 2 + 4 * bValue * bValue);
    const eigenvalues = [(trace - gap) / 2, (trace + gap) / 2];
    const frequencies = eigenvalues.map((value) => Math.sqrt(Math.max(value, 0)));

    const modeShapes = eigenvalues.map((eigenvalue, index) => {
      const vector = modeVector(aValue, bValue, dValue, eigenvalue, index);
      const shape = [vector[0] / Math.sqrt(m1), vector[1] / Math.sqrt(m2)];

      if (index === 0) {
        if (shape[0] + shape[1] < 0) {
          return shape.map((entry) => -entry);
        }
        return shape;
      }

      if (shape[0] < 0) {
        return shape.map((entry) => -entry);
      }
      return shape;
    });

    const displayShapes = modeShapes.map((shape) => {
      const scale = Math.max(Math.abs(shape[0]), Math.abs(shape[1]), 1e-12);
      return shape.map((entry) => entry / scale);
    });

    const stiffnessMatrix = [
      [k1 + kc, -kc],
      [-kc, k2 + kc],
    ];

    const massOrthogonality =
      modeShapes[0][0] * m1 * modeShapes[1][0] +
      modeShapes[0][1] * m2 * modeShapes[1][1];
    const stiffnessOrthogonality =
      modeShapes[0][0] *
        (stiffnessMatrix[0][0] * modeShapes[1][0] +
          stiffnessMatrix[0][1] * modeShapes[1][1]) +
      modeShapes[0][1] *
        (stiffnessMatrix[1][0] * modeShapes[1][0] +
          stiffnessMatrix[1][1] * modeShapes[1][1]);

    return {
      eigenvalues,
      frequencies,
      modeShapes,
      displayShapes,
      massOrthogonality,
      stiffnessOrthogonality,
    };
  }

  function computeFrf(couplingRatio, alpha, beta, forceKey, points = 260) {
    const modalData = computeModes(1, 1, couplingRatio);
    const force = forcePatterns[forceKey] || forcePatterns.left;
    const gammas = modalData.modeShapes.map(
      (shape) => shape[0] * force.vector[0] + shape[1] * force.vector[1]
    );
    const damping = modalData.eigenvalues.map((value) => alpha + beta * value);
    const maxFrequency = Math.max(2.5, modalData.frequencies[1] * 1.7);
    const omega = Array.from({ length: points + 1 }, (_, index) => (maxFrequency * index) / points);
    const modalMagnitudes = [[], []];
    const physicalMagnitudes = [[], []];
    const totalMagnitudes = [];

    omega.forEach((frequency) => {
      const modalResponse = modalData.eigenvalues.map((value, index) => {
        const realPart = value - frequency * frequency;
        const imagPart = frequency * damping[index];
        const scale = realPart * realPart + imagPart * imagPart + 1e-12;
        return {
          real: (gammas[index] * realPart) / scale,
          imag: (-gammas[index] * imagPart) / scale,
        };
      });

      const q1Real =
        modalData.modeShapes[0][0] * modalResponse[0].real +
        modalData.modeShapes[1][0] * modalResponse[1].real;
      const q1Imag =
        modalData.modeShapes[0][0] * modalResponse[0].imag +
        modalData.modeShapes[1][0] * modalResponse[1].imag;
      const q2Real =
        modalData.modeShapes[0][1] * modalResponse[0].real +
        modalData.modeShapes[1][1] * modalResponse[1].real;
      const q2Imag =
        modalData.modeShapes[0][1] * modalResponse[0].imag +
        modalData.modeShapes[1][1] * modalResponse[1].imag;

      modalMagnitudes[0].push(Math.hypot(modalResponse[0].real, modalResponse[0].imag));
      modalMagnitudes[1].push(Math.hypot(modalResponse[1].real, modalResponse[1].imag));
      physicalMagnitudes[0].push(Math.hypot(q1Real, q1Imag));
      physicalMagnitudes[1].push(Math.hypot(q2Real, q2Imag));
      totalMagnitudes.push(Math.hypot(q1Real, q1Imag, q2Real, q2Imag));
    });

    let peakIndex = 0;
    totalMagnitudes.forEach((value, index) => {
      if (value > totalMagnitudes[peakIndex]) {
        peakIndex = index;
      }
    });

    return {
      damping,
      forceLabel: force.label,
      frequencies: modalData.frequencies,
      gammas,
      modalMagnitudes,
      omega,
      peakFrequency: omega[peakIndex],
      peakIndex,
      physicalMagnitudes,
      totalMagnitudes,
    };
  }

  async function initChapter4ModeShapeExplorer(element) {
    const plotly = await loadPlotly();
    let massRatio = numberFromDataset(element, "massRatio", 1);
    let stiffnessRatio = numberFromDataset(element, "stiffnessRatio", 1);
    let couplingRatio = numberFromDataset(element, "couplingRatio", 1);
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "2-DOF Mode Shape Explorer";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const data = computeModes(massRatio, stiffnessRatio, couplingRatio);
      const symmetryNote =
        Math.abs(massRatio - 1) < 0.03 && Math.abs(stiffnessRatio - 1) < 0.03
          ? "The symmetric point recovers the exact [1, 1] and [1, -1] patterns."
          : "Breaking symmetry rotates the modal basis while preserving M-orthogonality.";

      readout.textContent =
        `omega_1 = ${data.frequencies[0].toFixed(3)}, ` +
        `omega_2 = ${data.frequencies[1].toFixed(3)}. ` +
        `Relative mode shapes are [${data.displayShapes[0][0].toFixed(2)}, ` +
        `${data.displayShapes[0][1].toFixed(2)}] and ` +
        `[${data.displayShapes[1][0].toFixed(2)}, ${data.displayShapes[1][1].toFixed(2)}]. ` +
        `phi_1^T M phi_2 = ${data.massOrthogonality.toExponential(1)}. ${symmetryNote}`;

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: [1, 2],
            y: data.displayShapes[0],
            mode: "lines+markers",
            line: { color: colors.mode1, width: 3 },
            marker: { color: colors.mode1, size: 10 },
            name: "mode 1",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "mass %{x}<br>relative amplitude %{y:.3f}<extra></extra>",
          },
          {
            x: [1, 2],
            y: data.displayShapes[1],
            mode: "lines+markers",
            line: { color: colors.mode2, width: 3 },
            marker: { color: colors.mode2, size: 10 },
            name: "mode 2",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "mass %{x}<br>relative amplitude %{y:.3f}<extra></extra>",
          },
          {
            type: "bar",
            x: ["mode 1", "mode 2"],
            y: data.frequencies,
            marker: { color: [colors.mode1, colors.mode2] },
            name: "natural frequency",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "%{x}<br>omega = %{y:.3f}<extra></extra>",
            showlegend: false,
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 60 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.15 },
          xaxis: {
            domain: [0, 1],
            anchor: "y",
            tickvals: [1, 2],
            ticktext: ["mass 1", "mass 2"],
          },
          yaxis: {
            domain: [0.42, 1],
            title: "relative mode shape",
            range: [-1.15, 1.15],
            zeroline: true,
          },
          xaxis2: {
            domain: [0, 1],
            anchor: "y2",
            title: "mode",
          },
          yaxis2: {
            domain: [0, 0.24],
            title: "omega_j",
            rangemode: "tozero",
          },
          annotations: [
            {
              x: 1.5,
              y: 1.08,
              xref: "x",
              yref: "y",
              text: "Mode shapes are scaled by their largest entry for comparison.",
              showarrow: false,
              font: { size: 12 },
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Mass ratio m_2 / m_1",
        min: 0.6,
        max: 1.8,
        step: 0.02,
        value: massRatio,
        onInput: (value) => {
          massRatio = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      }),
      makeRangeControl({
        label: "Ground stiffness ratio k_2 / k_1",
        min: 0.6,
        max: 1.8,
        step: 0.02,
        value: stiffnessRatio,
        onInput: (value) => {
          stiffnessRatio = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      }),
      makeRangeControl({
        label: "Coupling ratio k_c / k_1",
        min: 0.1,
        max: 2.0,
        step: 0.05,
        value: couplingRatio,
        onInput: (value) => {
          couplingRatio = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  async function initChapter4ModalFrfExplorer(element) {
    const plotly = await loadPlotly();
    let couplingRatio = numberFromDataset(element, "couplingRatio", 1);
    let alpha = numberFromDataset(element, "alpha", 0.04);
    let beta = numberFromDataset(element, "beta", 0.03);
    let forceKey = element.dataset.forcePattern || "left";
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Modal Participation and Forced Response";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    async function draw() {
      const data = computeFrf(couplingRatio, alpha, beta, forceKey);
      const suppressedModes = data.gammas
        .map((value, index) => ({ value, label: `mode ${index + 1}` }))
        .filter((item) => Math.abs(item.value) < 1e-3)
        .map((item) => item.label);
      const dominantMode =
        data.modalMagnitudes[0][data.peakIndex] >= data.modalMagnitudes[1][data.peakIndex]
          ? "mode 1"
          : "mode 2";
      const suppressionNote =
        suppressedModes.length > 0
          ? `${suppressedModes.join(" and ")} is not excited by this forcing pattern.`
          : `Both modes participate; ${dominantMode} is larger at the response peak.`;
      const maxPhysical = Math.max(
        ...data.physicalMagnitudes[0],
        ...data.physicalMagnitudes[1],
        1e-6
      );
      const maxModal = Math.max(...data.modalMagnitudes[0], ...data.modalMagnitudes[1], 1e-6);

      readout.textContent =
        `Forcing ${data.forceLabel}: Gamma_1 = ${data.gammas[0].toFixed(3)}, ` +
        `Gamma_2 = ${data.gammas[1].toFixed(3)}. ` +
        `Largest combined response occurs near omega = ${data.peakFrequency.toFixed(3)}. ` +
        `${suppressionNote}`;

      await renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.omega,
            y: data.physicalMagnitudes[0],
            mode: "lines",
            line: { color: colors.q1, width: 3 },
            name: "|q_1|",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "omega=%{x:.3f}<br>|q_1|=%{y:.3f}<extra></extra>",
          },
          {
            x: data.omega,
            y: data.physicalMagnitudes[1],
            mode: "lines",
            line: { color: colors.q2, width: 3, dash: "dash" },
            name: "|q_2|",
            xaxis: "x",
            yaxis: "y",
            hovertemplate: "omega=%{x:.3f}<br>|q_2|=%{y:.3f}<extra></extra>",
          },
          {
            x: [data.frequencies[0], data.frequencies[0]],
            y: [0, maxPhysical],
            mode: "lines",
            line: { color: colors.mode1, width: 2, dash: "dot" },
            name: "omega_1",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: [data.frequencies[1], data.frequencies[1]],
            y: [0, maxPhysical],
            mode: "lines",
            line: { color: colors.mode2, width: 2, dash: "dot" },
            name: "omega_2",
            xaxis: "x",
            yaxis: "y",
            hoverinfo: "skip",
          },
          {
            x: data.omega,
            y: data.modalMagnitudes[0],
            mode: "lines",
            line: { color: colors.mode1, width: 3 },
            name: "|eta_1|",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "omega=%{x:.3f}<br>|eta_1|=%{y:.3f}<extra></extra>",
          },
          {
            x: data.omega,
            y: data.modalMagnitudes[1],
            mode: "lines",
            line: { color: colors.mode2, width: 3 },
            name: "|eta_2|",
            xaxis: "x2",
            yaxis: "y2",
            hovertemplate: "omega=%{x:.3f}<br>|eta_2|=%{y:.3f}<extra></extra>",
          },
          {
            x: [data.frequencies[0], data.frequencies[0]],
            y: [0, maxModal],
            mode: "lines",
            line: { color: colors.mode1, width: 2, dash: "dot" },
            name: "omega_1 (modal)",
            xaxis: "x2",
            yaxis: "y2",
            hoverinfo: "skip",
            showlegend: false,
          },
          {
            x: [data.frequencies[1], data.frequencies[1]],
            y: [0, maxModal],
            mode: "lines",
            line: { color: colors.mode2, width: 2, dash: "dot" },
            name: "omega_2 (modal)",
            xaxis: "x2",
            yaxis: "y2",
            hoverinfo: "skip",
            showlegend: false,
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 60 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.15 },
          xaxis: {
            domain: [0, 1],
            anchor: "y",
            title: "forcing frequency omega",
          },
          yaxis: {
            domain: [0.42, 1],
            title: "physical response amplitude",
            rangemode: "tozero",
          },
          xaxis2: {
            domain: [0, 1],
            anchor: "y2",
            title: "forcing frequency omega",
          },
          yaxis2: {
            domain: [0, 0.24],
            title: "modal amplitude",
            rangemode: "tozero",
          },
        }
      );
    }

    controls.append(
      makeSelectControl({
        label: "Force pattern",
        options: [
          { value: "left", label: "left mass only" },
          { value: "symmetric", label: "symmetric" },
          { value: "antisymmetric", label: "antisymmetric" },
        ],
        value: forceKey,
        onInput: (value) => {
          forceKey = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      }),
      makeRangeControl({
        label: "Coupling ratio k_c / k_1",
        min: 0.1,
        max: 2.0,
        step: 0.05,
        value: couplingRatio,
        onInput: (value) => {
          couplingRatio = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      }),
      makeRangeControl({
        label: "Rayleigh alpha",
        min: 0,
        max: 0.2,
        step: 0.005,
        value: alpha,
        onInput: (value) => {
          alpha = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      }),
      makeRangeControl({
        label: "Rayleigh beta",
        min: 0,
        max: 0.12,
        step: 0.002,
        value: beta,
        onInput: (value) => {
          beta = value;
          if (isMounted) {
            draw().catch((error) => console.error(error));
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter4-mode-shape-explorer", initChapter4ModeShapeExplorer);
  registerExample("chapter4-modal-frf-explorer", initChapter4ModalFrfExplorer);
})();
