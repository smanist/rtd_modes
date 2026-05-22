(function () {
  "use strict";

  const {
    loadPlotly,
    loadPyodideRuntime,
    makeRangeControl,
    numberFromDataset,
    registerExample,
    renderPlotly,
    staticAssetUrl,
  } = window.CourseInteractives;

  let transientEnergyPromise = null;
  const transientEnergySource = String.raw`import numpy as np


def transient_energy(coupling=8.0, time_max=6.0, steps=320):
    """Compute transient energy for the hand-derived 2x2 non-normal system."""
    t = np.linspace(0.0, float(time_max), int(steps) + 1)
    exp1 = np.exp(-t)
    exp2 = np.exp(-2.0 * t)
    x1 = float(coupling) * (exp1 - exp2)
    x2 = exp2
    energy = x1**2 + x2**2
    peak_index = int(np.argmax(energy))

    return {
        "time": t.tolist(),
        "energy": energy.tolist(),
        "peak_time": float(t[peak_index]),
        "peak_energy": float(energy[peak_index]),
    }
`;

  function loadError(step, error) {
    const message = error && error.message ? error.message : String(error);
    const wrapped = new Error(`${step}: ${message}`);
    wrapped.cause = error;
    wrapped.userMessage = `This interactive example could not be loaded. ${step}: ${message}`;
    return wrapped;
  }

  async function loadPythonSource() {
    const sourceUrl = staticAssetUrl("py/examples/ch03_transient_energy.py");
    if (window.location.protocol === "file:") {
      return transientEnergySource;
    }

    let response;
    try {
      response = await fetch(sourceUrl);
    } catch (error) {
      throw loadError(`Python source fetch failed (${sourceUrl})`, error);
    }
    if (!response.ok) {
      throw loadError(
        "Python source fetch failed",
        new Error(`${response.status} ${response.statusText}: ${sourceUrl}`)
      );
    }

    return response.text();
  }

  async function loadTransientEnergyFunction() {
    if (!transientEnergyPromise) {
      transientEnergyPromise = (async () => {
        let pyodide;
        try {
          pyodide = await loadPyodideRuntime();
        } catch (error) {
          throw loadError("Pyodide runtime failed to load", error);
        }

        try {
          await pyodide.loadPackage("numpy");
        } catch (error) {
          throw loadError("NumPy package failed to load", error);
        }

        try {
          pyodide.runPython(await loadPythonSource());
          return pyodide.globals.get("transient_energy");
        } catch (error) {
          throw loadError("Python source execution failed", error);
        }
      })();
    }

    return transientEnergyPromise;
  }

  function pyProxyToObject(proxy) {
    try {
      return proxy.toJs({ dict_converter: Object.fromEntries });
    } finally {
      proxy.destroy();
    }
  }

  function computeTransientEnergy(transientEnergy, coupling, timeMax, steps) {
    try {
      return pyProxyToObject(transientEnergy(coupling, timeMax, steps));
    } catch (error) {
      throw loadError("Python calculation failed", error);
    }
  }

  async function initChapter3TransientEnergy(element) {
    const [plotly, transientEnergy] = await Promise.all([
      loadPlotly(),
      loadTransientEnergyFunction(),
    ]);
    let coupling = numberFromDataset(element, "k", 8);
    const timeMax = numberFromDataset(element, "timeMax", 6);
    const steps = 320;
    let drawRequest = 0;
    let isMounted = false;

    const header = document.createElement("div");
    const title = document.createElement("p");
    const controls = document.createElement("div");
    const readout = document.createElement("p");
    const plot = document.createElement("div");

    header.className = "course-interactive__header";
    title.className = "course-interactive__title";
    title.textContent = "Transient Energy for x(0) = [0, 1]";
    controls.className = "course-interactive__controls";
    readout.className = "course-interactive__readout";
    plot.className = "course-interactive__plot";

    async function draw() {
      const requestId = drawRequest += 1;
      const data = computeTransientEnergy(transientEnergy, coupling, timeMax, steps);
      if (requestId !== drawRequest) {
        return;
      }

      const peakHalfWidth = Math.max(0.15, timeMax / 18);
      const peakLeft = Math.max(0, data.peak_time - peakHalfWidth);
      const peakRight = Math.min(timeMax, data.peak_time + peakHalfWidth);
      const growthFactor = data.peak_energy / data.energy[0];

      readout.textContent =
        `Peak energy ${data.peak_energy.toFixed(3)} at t = ${data.peak_time.toFixed(2)}; ` +
        `growth factor ${growthFactor.toFixed(3)}.`;

      renderPlotly(
        plotly,
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
            y: [data.peak_energy, data.peak_energy],
            mode: "lines",
            line: { color: "#bc4b51", width: 6 },
            hoverinfo: "skip",
            showlegend: false,
          },
          {
            x: [data.peak_time],
            y: [data.peak_energy],
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
              x: data.peak_time,
              y: data.peak_energy,
              text: "Peak transient energy",
              showarrow: true,
              arrowhead: 2,
              ax: 36,
              ay: -28,
            },
          ],
        }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Coupling K",
        min: 0,
        max: 10,
        step: 0.2,
        value: coupling,
        onInput: (value) => {
          coupling = value;
          if (!isMounted) {
            return;
          }

          draw().catch((error) => {
            readout.textContent = "The Python calculation could not be updated.";
            console.error(error);
          });
        },
      })
    );

    header.append(title);
    element.replaceChildren(header, controls, readout, plot);
    isMounted = true;
    await draw();
  }

  registerExample("chapter3-transient-energy", initChapter3TransientEnergy, {
    selectors: [".course-interactive-chapter3-transient-energy"],
  });
})();
