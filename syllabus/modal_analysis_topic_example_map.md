# Modal Analysis of Dynamical Systems: Topic–Example Map

This outline pairs each course topic with an accessible hand-derivable example, a recurring engineering-relevant example, and the key concepts students should learn.

## Week 1 — Modal Taxonomy

**Hand-derivable example:** 2D oscillator  
**Recurring engineering example:** aircraft modes, building modes, flow modes, thermal modes

### Key concepts to learn

- Different meanings of “mode” across dynamical systems.
- Modes as eigenvectors, singular vectors, data directions, frequency-domain structures, tangent directions, and nonlinear observables.
- Dependence of modes on the operator, inner product, data measure, and modeling objective.
- Distinction between state-space modes, input-output modes, statistical modes, and operator-theoretic modes.
- Why modal analysis is useful for stability, prediction, reduction, interpretation, and control-oriented modeling.
- Examples of modal phenomena in mechanical vibration, flight dynamics, fluid flows, thermal systems, and power/energy systems.

---

## Week 2 — Linear Autonomous Systems

**Hand-derivable example:** 2-DOF oscillator  
**Recurring engineering example:** aircraft flight dynamics model, aeroelastic model

### Key concepts to learn

- Continuous-time and discrete-time linear systems.
- Eigenvalues, eigenvectors, left/right eigenvectors, and modal expansion.
- Stability interpretation of eigenvalues.
- Diagonalization, Jordan form, and Schur form.
- Real versus complex modes.
- Modal coordinates and reconstruction of the state.
- Spectral mapping between continuous-time and discrete-time systems.
- Sensitivity of modal decompositions to eigenvalue multiplicity and non-diagonalizability.

---

## Week 3 — Non-normality, Transient Growth, and Pseudospectra

**Hand-derivable example:** \(2\times2\) non-normal upper-triangular matrix  
**Recurring engineering example:** Ginzburg-Landau model, aeroelastic bifurcation

### Key concepts to learn

- Normal versus non-normal operators.
- Eigenvector nonorthogonality and modal interference.
- Transient growth despite asymptotic stability.
- Singular values of the propagator \(e^{At}\).
- Resolvent norm and frequency-dependent amplification.
- Pseudospectra and eigenvalue sensitivity.
- Numerical range and short-time growth intuition.
- Why eigenvalues alone can be misleading in fluid, structural, and input-output systems.

---

## Week 4 — Second-Order Mechanical Modal Analysis

**Hand-derivable example:** 2-DOF mass-spring-damper system  
**Recurring engineering example:** beam vibration model

### Key concepts to learn

- Second-order dynamics of the form \(M\ddot q+C\dot q+Kq=f\).
- Generalized eigenvalue problems \(K\phi=\omega^2M\phi\).
- Mass normalization and modal orthogonality.
- Modal coordinates for undamped systems.
- Proportional damping and modal decoupling.
- Non-proportional damping and complex modes.
- Frequency response functions and modal participation.
- Modal truncation and its limits for forced response.

---

## Week 5 — Linear Time-Varying Systems

**Hand-derivable example:** scalar LTV system or triangular \(A(t)\) system  
**Recurring engineering example:** aircraft flight dynamics model

### Key concepts to learn

- Linear time-varying systems \(\dot x=A(t)x\).
- State-transition matrix and fundamental solution.
- Propagator composition \(\Phi(t_2,t_0)=\Phi(t_2,t_1)\Phi(t_1,t_0)\).
- Difference between instantaneous eigenvalues of \(A(t)\) and finite-time dynamics.
- Finite-time growth and singular vectors of the propagator.
- Tangent dynamics along a nonlinear trajectory as an LTV system.
- Numerical integration of the state-transition matrix.
- Engineering sources of time-varying dynamics: scheduling, rotation, periodic loading, deployment, and morphing.

---

## Week 6 — Floquet Analysis

**Hand-derivable example:** Mathieu equation or piecewise-periodic linear system  
**Recurring engineering example:** spacecraft as a rotating beam

### Key concepts to learn

- Periodic LTV systems \(\dot x=A(t)x\), \(A(t+T)=A(t)\).
- Monodromy matrix \(\Phi(T,0)\).
- Floquet multipliers and Floquet exponents.
- Stability of periodic solutions and periodic systems.
- Parametric resonance and instability tongues.
- Relation between Floquet analysis and Poincare maps.
- Linearization about a periodic orbit.
- Interpretation of phase and transverse modes for limit cycles.

---

## Week 7 — Lyapunov Exponents and Covariant Lyapunov Vectors

**Hand-derivable example:** diagonal LTV system / Lorenz system for numerical exploration  
**Recurring engineering example:** thermal convection

### Key concepts to learn

- Tangent linear dynamics \(\dot\xi=Df(x(t))\xi\).
- Finite-time Lyapunov exponents.
- Asymptotic Lyapunov exponents.
- QR-based computation of Lyapunov exponents.
- Forward and backward Lyapunov vectors.
- Covariant Lyapunov vectors and Oseledets splitting.
- Difference between singular vectors, Gram-Schmidt vectors, and CLVs.
- Stable, unstable, and neutral tangent directions.
- Interpretation of trajectory-dependent modes in chaotic or complex nonlinear dynamics.

---

## Week 8 — Model Truncation and Reduced-Order Modeling

**Hand-derivable example:** 2-state input-output system  
**Recurring engineering example:** thermal diffusion and flexible structure

### Key concepts to learn

- Purpose of model truncation: prediction, simulation speed, interpretation, and control-oriented modeling.
- Difference between modal truncation, projection ROMs, Krylov reduction, POD reduction, and balanced truncation.
- Projection ansatz \(x\approx V_ra\).
- Galerkin and Petrov-Galerkin projection.
- Modal truncation for second-order systems.
- Static correction and residual flexibility for forced structural response.
- Krylov subspaces and moment matching.
- Transfer function \(G(s)=C(sI-A)^{-1}B\).
- Controllability and observability Gramians.
- Balanced coordinates and Hankel singular values.
- Balanced truncation as retention of states that are both controllable and observable.
- ERA and balanced POD as data-driven or snapshot-based balanced reduction.
- Comparison of truncation criteria: slow, energetic, input-output relevant, and frequency-local.

---

## Week 9 — POD/KL and Snapshot Methods

**Hand-derivable example:** tiny snapshot matrix / heat equation  
**Recurring engineering example:** Cylinder wake

### Key concepts to learn

- Proper Orthogonal Decomposition as an optimal reconstruction basis.
- Karhunen-Loeve expansion viewpoint.
- Snapshot matrix and singular value decomposition.
- Empirical covariance matrix and correlation operator.
- Energy ranking and cumulative captured variance.
- Weighted inner products and quadrature weights.
- Method of snapshots for high-dimensional data.
- Reconstruction error and rank selection.
- Difference between energetic modes and dynamically invariant modes.
- Randomized, incremental, or streaming POD, if time permits.

---

## Week 10 — Dynamic Mode Decomposition and Variants

**Hand-derivable example:** rotation-decay data  
**Recurring engineering example:** Cylinder wake

### Key concepts to learn

- Snapshot pairs \(X\) and \(Y\) with \(Y\approx AX\).
- Exact DMD and projected DMD.
- Least-squares interpretation of DMD.
- DMD eigenvalues, modes, and amplitudes.
- Continuous-time eigenvalues from discrete-time data.
- Rank truncation and SVD preprocessing.
- Relationship between POD and DMD.
- Noise sensitivity and bias in standard DMD.
- Forward-backward DMD, total-least-squares DMD, and optimized DMD at exposure level.
- Residual diagnostics and validation of DMD modes.
- Difference between reconstruction quality and prediction quality.

---

## Week 11 — Koopman Spectral Theory

**Hand-derivable example:** \(\dot x=-x\), circle rotation, translation  
**Recurring engineering example:** pitch-plunge airfoil, Ginzburg-Landau PDE with tunable non-normality

### Key concepts to learn

- Koopman operator for maps and flows.
- Koopman generator \(\mathcal{L}g=f\cdot\nabla g\).
- Koopman eigenfunctions as nonlinear observable coordinates.
- Point spectrum and eigenfunction evolution.
- Linear systems as a special case of Koopman analysis.
- Koopman spectrum for circle rotations and quasiperiodic systems.
- Continuous spectrum and why not all dynamics admit a clean countable modal expansion.
- Spectral measures and their relation to autocorrelation and broadband spectra.
- Motivation for rigged Hilbert spaces \(\Phi\subset H\subset \Phi'\).
- Generalized eigenfunctions and distributional modes, using Fourier/translation analogies.
- Galerkin approximation of Koopman action on a dictionary, and its connection to EDMD.
- Dictionary choice, regularization, and spectral pollution.
- Residual checks for approximate Koopman eigenpairs.
- Interpretation of DMD-type spectra for chaotic, broadband, or mixed-spectrum systems.

---

## Week 12 — SPOD and Resolvent Analysis

**Hand-derivable example:** forced scalar or 2D oscillator  
**Recurring engineering example:** pitch-plunge airfoil, Ginzburg-Landau PDE with tunable non-normality

### Key concepts to learn

- Frequency-domain view of modal analysis.
- Fourier transform of stationary time-series data.
- Cross-spectral density matrix/operator.
- Welch estimation, windowing, and overlap.
- Spectral Proper Orthogonal Decomposition eigenproblem.
- SPOD modes as frequency-conditioned energetic structures.
- Resolvent operator \((i\omega I-A)^{-1}\).
- Forcing modes, response modes, and resolvent gains.
- SVD of the resolvent.
- Relationship between SPOD and resolvent modes under white or structured forcing.
- Difference between data-statistical modes and input-output amplification modes.
- Connections to non-normality and transient growth from Week 3.

---

## Week 13 — Nonlinear Normal Modes

**Hand-derivable example:** Duffing oscillator or pendulum  
**Recurring engineering example:** Nonlinear aeroelastic model

- Amplitude-dependent frequency.
- Backbone curves.
- Rosenberg nonlinear normal modes.
- Invariant-manifold viewpoint of nonlinear modal manifolds.
- Relation between linear modal subspaces and nonlinear modal manifolds.
- Internal resonance and modal interaction.
- Shooting, harmonic balance, continuation, and parameterization methods at exposure level.

---

## Week 14 — Modes on Manifolds

**Hand-derivable example:** Dynamics on S^1
**Recurring engineering example:** Rigid body dynamics

- State spaces beyond Euclidean space: \(S^1\), \(S^2\), \(SO(3)\), \(SE(3)\).
- Tangent spaces and local modal directions.
- Linearization on manifolds.
- Exponential and logarithm maps.
- Modes in tangent or Lie algebra coordinates.
- Coordinate dependence of Euclidean modal analysis.
- Manifold-aware POD/DMD caveats.


---

# Modal Method Comparison Table

| Method | Main object | Modes identify | Typical use |
|---|---|---|---|
| Eigenanalysis | \(A\) or generalized \((K,M)\) | invariant linear directions | stability and vibration |
| Schur/pseudospectral analysis | \(A\), \((zI-A)^{-1}\) | robust spectral/amplification behavior | non-normal systems |
| Floquet analysis | \(\Phi(T,0)\) | periodic-system modes | parametric and periodic dynamics |
| Lyapunov/CLV analysis | tangent cocycle | trajectory-dependent stable/unstable directions | chaotic or nonlinear dynamics |
| Modal truncation | selected eigenmodes | low-frequency or weakly damped subspaces | structural ROM |
| Balanced truncation | Gramians / Hankel singular values | controllable and observable directions | input-output ROM |
| POD/KL | covariance operator | energetic data directions | compression and reconstruction |
| DMD | fitted linear evolution map | growth/decay/frequency modes | data-driven dynamics |
| Koopman/EDMD | Koopman operator/generator | nonlinear observable coordinates | nonlinear spectral analysis |
| SPOD | cross-spectral density | frequency-conditioned energetic structures | stationary flow/field data |
| Resolvent analysis | \((i\omega I-A)^{-1}\) | amplified forcing-response directions | input-output amplification |
