(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
  } = window.CourseInteractives;

  const colors = {
    full: "#2f6f73",
    krylov: "#8a6d1d",
    modal: "#bc4b51",
  };

  function buildWorkedExampleModel(beta) {
    const basisNorm = Math.hypot(beta, 1);
    const krylovPole = (beta * (beta + 1)) / (beta * beta + 1);
    const krylovGain = (beta + 1) / basisNorm;

    return {
      beta,
      basisNorm,
      dcGain: 1 + 1 / beta,
      krylovGain,
      krylovNumerator: krylovGain * krylovGain,
      krylovPole,
    };
  }

  function sampleStepComparison(beta, inputLevel, timeMax, steps) {
    const model = buildWorkedExampleModel(beta);
    const time = [];
    const fullOutput = [];
    const modalOutput = [];
    const krylovOutput = [];
    const fullX1 = [];
    const fullX2 = [];
    const modalX1 = [];
    const modalX2 = [];
    const krylovX1 = [];
    const krylovX2 = [];
    let modalPeakError = 0;
    let krylovPeakError = 0;

    const krylovStateScale = model.basisNorm / beta;

    for (let index = 0; index <= steps; index += 1) {
      const t = (timeMax * index) / steps;
      const expSlow = Math.exp(-t);
      const expFast = Math.exp(-beta * t);
      const expKrylov = Math.exp(-model.krylovPole * t);
      const fullSlow = inputLevel * (1 - expSlow);
      const fullFast = (inputLevel / beta) * (1 - expFast);
      const modal = fullSlow;
      const krylovState = inputLevel * krylovStateScale * (1 - expKrylov);
      const krylovY = model.krylovGain * krylovState;
      const fullY = fullSlow + fullFast;

      time.push(t);
      fullOutput.push(fullY);
      modalOutput.push(modal);
      krylovOutput.push(krylovY);

      fullX1.push(fullSlow);
      fullX2.push(fullFast);
      modalX1.push(modal);
      modalX2.push(0);
      krylovX1.push((beta / model.basisNorm) * krylovState);
      krylovX2.push((1 / model.basisNorm) * krylovState);

      modalPeakError = Math.max(modalPeakError, Math.abs(fullY - modal));
      krylovPeakError = Math.max(krylovPeakError, Math.abs(fullY - krylovY));
    }

    return {
      equilibriumX1: inputLevel,
      equilibriumX2: inputLevel / beta,
      fullOutput,
      fullX1,
      fullX2,
      krylovOutput,
      krylovPeakError,
      krylovX1,
      krylovX2,
      modalOutput,
      modalPeakError,
      modalX1,
      modalX2,
      model,
      time,
    };
  }

  function evaluateTransferMagnitudes(beta, omega) {
    const model = buildWorkedExampleModel(beta);
    const fullReal = 1 / (1 + omega * omega) + beta / (beta * beta + omega * omega);
    const fullImag = -omega / (1 + omega * omega) - omega / (beta * beta + omega * omega);
    const fullMagnitude = Math.hypot(fullReal, fullImag);
    const modalMagnitude = 1 / Math.hypot(1, omega);
    const krylovMagnitude = model.krylovNumerator / Math.hypot(model.krylovPole, omega);

    return {
      fullMagnitude,
      krylovMagnitude,
      krylovRelativeError:
        (100 * Math.abs(krylovMagnitude - fullMagnitude)) / Math.max(fullMagnitude, 1e-9),
      modalMagnitude,
      modalRelativeError:
        (100 * Math.abs(modalMagnitude - fullMagnitude)) / Math.max(fullMagnitude, 1e-9),
      model,
    };
  }

  function sampleFrequencyComparison(beta, omegaMax, probeOmega, steps) {
    const omega = [];
    const fullMagnitude = [];
    const modalMagnitude = [];
    const krylovMagnitude = [];
    const modalRelativeError = [];
    const krylovRelativeError = [];

    for (let index = 0; index <= steps; index += 1) {
      const omegaValue = (omegaMax * index) / steps;
      const point = evaluateTransferMagnitudes(beta, omegaValue);
      omega.push(omegaValue);
      fullMagnitude.push(point.fullMagnitude);
      modalMagnitude.push(point.modalMagnitude);
      krylovMagnitude.push(point.krylovMagnitude);
      modalRelativeError.push(point.modalRelativeError);
      krylovRelativeError.push(point.krylovRelativeError);
    }

    return {
      fullMagnitude,
      krylovMagnitude,
      krylovRelativeError,
      modalMagnitude,
      modalRelativeError,
      omega,
      probe: evaluateTransferMagnitudes(beta, probeOmega),
      probeOmega,
    };
  }

  async function initChapter8StepComparison(element) {
    const plotly = await loadPlotly();
    let beta = numberFromDataset(element, "beta", 10);
    let inputLevel = numberFromDataset(element, "inputLevel", 1);
    const timeMax = numberFromDataset(element, "timeMax", 6);
    const steps = 320;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Full, Modal, and Krylov Step Responses for the Two-State ROM";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    function draw() {
      const data = sampleStepComparison(beta, inputLevel, timeMax, steps);
      const omittedStaticContribution = inputLevel / beta;

      readout.textContent =
        `Full steady output = ${(
          data.model.dcGain * inputLevel
        ).toFixed(3)} = ${inputLevel.toFixed(3)} + ${omittedStaticContribution.toFixed(3)}. ` +
        `Modal truncation drops the fast static contribution ${omittedStaticContribution.toFixed(
          3
        )}, while the Krylov ROM recovers the exact equilibrium. ` +
        `Modal peak output error = ${data.modalPeakError.toFixed(3)}, ` +
        `Krylov peak output error = ${data.krylovPeakError.toFixed(3)}.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.time,
            y: data.fullOutput,
            mode: "lines",
            line: { color: colors.full, width: 3 },
            name: "full y(t)",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.time,
            y: data.modalOutput,
            mode: "lines",
            line: { color: colors.modal, width: 3, dash: "dash" },
            name: "modal y_r(t)",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.time,
            y: data.krylovOutput,
            mode: "lines",
            line: { color: colors.krylov, width: 3, dash: "dot" },
            name: "Krylov y_r(t)",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.fullX1,
            y: data.fullX2,
            mode: "lines",
            line: { color: colors.full, width: 3 },
            name: "full state",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
          {
            x: data.modalX1,
            y: data.modalX2,
            mode: "lines",
            line: { color: colors.modal, width: 3, dash: "dash" },
            name: "modal state",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
          {
            x: data.krylovX1,
            y: data.krylovX2,
            mode: "lines",
            line: { color: colors.krylov, width: 3, dash: "dot" },
            name: "Krylov state",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
          {
            x: [data.equilibriumX1],
            y: [data.equilibriumX2],
            mode: "markers",
            marker: { color: colors.full, size: 9, symbol: "circle-open" },
            name: "full equilibrium",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
            hovertemplate: "full equilibrium<br>x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
          {
            x: [data.equilibriumX1],
            y: [0],
            mode: "markers",
            marker: { color: colors.modal, size: 9, symbol: "square-open" },
            name: "modal equilibrium",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
            hovertemplate: "modal equilibrium<br>x_1=%{x:.3f}<br>x_2=%{y:.3f}<extra></extra>",
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 60 },
          legend: { orientation: "h", x: 0, y: 1.18 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          xaxis: { domain: [0, 0.54], title: "t", range: [0, timeMax] },
          yaxis: {
            domain: [0, 1],
            title: "output y(t)",
            rangemode: "tozero",
          },
          xaxis2: {
            domain: [0.64, 1],
            title: "x_1",
            rangemode: "tozero",
          },
          yaxis2: {
            domain: [0, 1],
            title: "x_2",
            rangemode: "tozero",
            scaleanchor: "x2",
            scaleratio: 1,
          },
          annotations: [
            {
              x: 0.27,
              y: 1.08,
              xref: "paper",
              yref: "paper",
              text: "step output",
              showarrow: false,
              font: { size: 12 },
            },
            {
              x: 0.82,
              y: 1.08,
              xref: "paper",
              yref: "paper",
              text: "state trajectory",
              showarrow: false,
              font: { size: 12 },
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Fast decay rate",
        min: 2,
        max: 20,
        step: 1,
        value: beta,
        onInput: (value) => {
          beta = value;
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Step input u",
        min: 0.2,
        max: 2,
        step: 0.1,
        value: inputLevel,
        onInput: (value) => {
          inputLevel = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    draw();
  }

  async function initChapter8FrequencyResponse(element) {
    const plotly = await loadPlotly();
    let beta = numberFromDataset(element, "beta", 10);
    let probeOmega = numberFromDataset(element, "probeOmega", 1);
    const omegaMax = numberFromDataset(element, "omegaMax", 12);
    const steps = 320;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Low-Frequency Gain and Moment Matching";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot course-interactive__plot--large";
    header.append(title);

    function draw() {
      const data = sampleFrequencyComparison(beta, omegaMax, probeOmega, steps);
      const dcGain = data.probe.model.dcGain;

      readout.textContent =
        `At omega = ${probeOmega.toFixed(2)}, |G(i omega)| = ${data.probe.fullMagnitude.toFixed(3)}, ` +
        `modal error = ${data.probe.modalRelativeError.toFixed(1)}%, ` +
        `Krylov error = ${data.probe.krylovRelativeError.toFixed(1)}%. ` +
        `At omega = 0, the full gain is ${dcGain.toFixed(3)}, modal truncation gives 1.000, ` +
        `and the Krylov ROM matches ${dcGain.toFixed(3)} exactly.`;

      renderPlotly(
        plotly,
        plot,
        [
          {
            x: data.omega,
            y: data.fullMagnitude,
            mode: "lines",
            line: { color: colors.full, width: 3 },
            name: "|G(i omega)|",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.omega,
            y: data.modalMagnitude,
            mode: "lines",
            line: { color: colors.modal, width: 3, dash: "dash" },
            name: "|G_mt(i omega)|",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.omega,
            y: data.krylovMagnitude,
            mode: "lines",
            line: { color: colors.krylov, width: 3, dash: "dot" },
            name: "|G_k(i omega)|",
            xaxis: "x",
            yaxis: "y",
          },
          {
            x: data.omega,
            y: data.modalRelativeError,
            mode: "lines",
            line: { color: colors.modal, width: 3, dash: "dash" },
            name: "modal relative error",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
          {
            x: data.omega,
            y: data.krylovRelativeError,
            mode: "lines",
            line: { color: colors.krylov, width: 3, dash: "dot" },
            name: "Krylov relative error",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
          {
            x: [probeOmega, probeOmega, probeOmega],
            y: [
              data.probe.fullMagnitude,
              data.probe.modalMagnitude,
              data.probe.krylovMagnitude,
            ],
            mode: "markers",
            marker: {
              color: [colors.full, colors.modal, colors.krylov],
              size: 8,
            },
            name: "probe frequency",
            xaxis: "x",
            yaxis: "y",
            showlegend: false,
          },
          {
            x: [probeOmega, probeOmega],
            y: [data.probe.modalRelativeError, data.probe.krylovRelativeError],
            mode: "markers",
            marker: {
              color: [colors.modal, colors.krylov],
              size: 8,
            },
            name: "probe error",
            xaxis: "x2",
            yaxis: "y2",
            showlegend: false,
          },
        ],
        {
          margin: { t: 30, r: 20, b: 55, l: 65 },
          legend: { orientation: "h", x: 0, y: 1.18 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          xaxis: {
            domain: [0, 1],
            title: "frequency omega",
            range: [0, omegaMax],
            anchor: "y",
          },
          yaxis: {
            domain: [0.44, 1],
            title: "magnitude",
            rangemode: "tozero",
          },
          xaxis2: {
            domain: [0, 1],
            title: "frequency omega",
            range: [0, omegaMax],
            anchor: "y2",
          },
          yaxis2: {
            domain: [0, 0.26],
            title: "relative error (%)",
            rangemode: "tozero",
          },
          annotations: [
            {
              x: 0.5,
              y: 1.08,
              xref: "paper",
              yref: "paper",
              text: "transfer magnitude",
              showarrow: false,
              font: { size: 12 },
            },
            {
              x: 0.5,
              y: 0.33,
              xref: "paper",
              yref: "paper",
              text: "ROM error relative to the full model",
              showarrow: false,
              font: { size: 12 },
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Fast decay rate",
        min: 2,
        max: 20,
        step: 1,
        value: beta,
        onInput: (value) => {
          beta = value;
          if (probeOmega > omegaMax) {
            probeOmega = omegaMax;
          }
          if (isMounted) {
            draw();
          }
        },
      }),
      makeRangeControl({
        label: "Probe frequency",
        min: 0,
        max: omegaMax,
        step: 0.1,
        value: probeOmega,
        onInput: (value) => {
          probeOmega = value;
          if (isMounted) {
            draw();
          }
        },
      })
    );

    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    draw();
  }

  registerExample("chapter8-rom-step-comparison", initChapter8StepComparison);
  registerExample("chapter8-rom-frequency-response", initChapter8FrequencyResponse);
})();
