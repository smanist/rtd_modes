(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  function sampleTransientEnergy({ coupling, timeMax, steps }) {
    const time = [];
    const energy = [];
    let peakIndex = 0;

    for (let i = 0; i <= steps; i += 1) {
      const t = (timeMax * i) / steps;
      const exp1 = Math.exp(-t);
      const exp2 = Math.exp(-2 * t);
      const x1 = coupling * (exp1 - exp2);
      const x2 = exp2;
      const value = x1 * x1 + x2 * x2;

      time.push(t);
      energy.push(value);

      if (value > energy[peakIndex]) {
        peakIndex = i;
      }
    }

    return {
      time,
      energy,
      peakEnergy: energy[peakIndex],
      peakTime: time[peakIndex],
    };
  }

  async function initChapter3TransientEnergy(element) {
    const plotly = await loadPlotly();
    let coupling = numberFromDataset(element, "k", 8);
    const timeMax = numberFromDataset(element, "timeMax", 6);
    const steps = 320;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Transient Energy for x(0) = [0, 1]^T";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot";

    function draw() {
      const data = sampleTransientEnergy({ coupling, timeMax, steps });
      const peakHalfWidth = Math.max(0.15, timeMax / 18);
      const peakLeft = Math.max(0, data.peakTime - peakHalfWidth);
      const peakRight = Math.min(timeMax, data.peakTime + peakHalfWidth);
      const growthFactor = data.peakEnergy / data.energy[0];

      readout.textContent =
        `Peak energy ${data.peakEnergy.toFixed(3)} at t = ${data.peakTime.toFixed(2)}; ` +
        `growth factor ${growthFactor.toFixed(3)}.`;

      plotly.react(
        plot,
        [
          {
            x: data.time,
            y: data.energy,
            mode: "lines",
            line: { color: "#2f6f73", width: 3 },
            name: "E(t)",
          },
          {
            x: [peakLeft, peakRight],
            y: [data.peakEnergy, data.peakEnergy],
            mode: "lines",
            line: { color: "#bc4b51", width: 6 },
            hoverinfo: "skip",
            showlegend: false,
          },
          {
            x: [data.peakTime],
            y: [data.peakEnergy],
            mode: "markers",
            marker: { color: "#bc4b51", size: 9 },
            name: "Peak",
          },
        ],
        {
          margin: { t: 20, r: 20, b: 55, l: 65 },
          xaxis: { title: "t", range: [0, timeMax] },
          yaxis: { title: "Energy E(t) = x_1(t)^2 + x_2(t)^2", rangemode: "tozero" },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          legend: { orientation: "h", x: 0, y: 1.12 },
          annotations: [
            {
              x: data.peakTime,
              y: data.peakEnergy,
              text: "Peak transient energy",
              showarrow: true,
              arrowhead: 2,
              ax: 36,
              ay: -28,
            },
          ],
        },
        { responsive: true, displayModeBar: false }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Coupling K",
        min: 0,
        max: 16,
        step: 0.5,
        value: coupling,
        onInput: (value) => {
          coupling = value;
          draw();
        },
      })
    );

    header.append(title);
    element.replaceChildren(header, controls, readout, plot);
    draw();
  }

  registerExample("chapter3-transient-energy", initChapter3TransientEnergy, {
    selectors: [".course-interactive-chapter3-transient-energy"],
  });
})();
