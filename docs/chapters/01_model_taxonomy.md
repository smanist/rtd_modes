# Modal Taxonomy

Modal analysis is the practice of representing complicated dynamics in terms of
organized patterns. The word *mode* is useful precisely because it appears in
many settings, but it is also a source of confusion: a vibration mode, a POD
mode, a DMD mode, a Koopman mode, and a resolvent response mode are not the same
object. They answer different questions about the same system.

This chapter sets the vocabulary for the rest of the course. The goal is not to
choose one definition of mode and force every method into it. The goal is to
identify what operator, inner product, data measure, or modeling objective makes
each modal object meaningful.

## Why Modes?

Consider a dynamical system written abstractly as

```{math}
:label: eq:chapter1-state-model

\ddf{x}{t} = f(x,u,t),
\qquad
y = h(x,u,t),
```

where $x(t)$ is the mathematical state, $u(t)$ is an input, and $y(t)$ is an
output. A full state trajectory may be high dimensional, strongly coupled, and
difficult to interpret directly. Modal analysis tries to replace that raw
description with a smaller collection of coherent patterns:

- directions in state space that grow, decay, or oscillate in simple ways;
- coordinates that isolate dominant time scales;
- basis vectors that efficiently reconstruct data;
- input-output structures that identify how forcing is amplified;
- nonlinear observables that evolve linearly even when the state dynamics do
  not.

Each of these patterns can be called a mode, but each depends on a different
mathematical construction. A useful first question is therefore:

> A mode of what?

The answer might be a matrix $A$, a propagator $\Phi(t,t_0)$, a covariance
matrix $C_x$, a cross-spectral density $S_x(\omega)$, a resolvent
$R(i\omega;A)$, a Koopman operator $\mathcal{K}^t$, or a fitted data map. The
operator comes first; the interpretation of the mode follows.

## A Small Oscillator as a Reference Example

The simplest place to see modal thinking is a two-dimensional linear oscillator,

```{math}
:label: eq:chapter1-oscillator

\ddot q + \omega^2 q = 0.
```

Introduce the state $x=(q,\dot q)^\top$. Then

```{math}
:label: eq:chapter1-oscillator-state-space

\dot x = Ax,
\qquad
A =
\begin{bmatrix}
0 & 1 \\
-\omega^2 & 0
\end{bmatrix}.
```

The eigenvalues of $A$ are

```{math}
:label: eq:chapter1-oscillator-eigenvalues

\lambda_{1,2} = \pm i\omega.
```

Associated eigenvectors may be chosen as

```{math}
:label: eq:chapter1-oscillator-eigenvectors

\phi_1 =
\begin{bmatrix}
1 \\
i\omega
\end{bmatrix},
\qquad
\phi_2 =
\begin{bmatrix}
1 \\
-i\omega
\end{bmatrix}.
```

For this linear autonomous system, the eigenvectors $\phi_j$ are state-space
modes. They are directions in the complexified state space that evolve by scalar
multiplication:

```{math}
:label: eq:chapter1-state-space-modal-evolution

x(t)
= c_1 e^{i\omega t}\phi_1
+ c_2 e^{-i\omega t}\phi_2.
```

For real initial conditions, the two complex conjugate terms combine into the
familiar real oscillation in $q(t)$. The eigenvectors describe the phase
relation between displacement and velocity, while the eigenvalues describe the
temporal behavior.

The same oscillator can also produce other kinds of modes. If we store sampled
snapshots in a data matrix $\mathbf{X}$, the leading POD mode is a direction
that best reconstructs those snapshots in a chosen inner product. If the
oscillator is forced and observed through a particular input-output pair, a
resolvent mode identifies the forcing and response directions with largest
frequency-domain gain. If we choose nonlinear observables of the state, Koopman
eigenfunctions give coordinates that evolve exponentially in time.

The physical system has not changed. The modal question has.

## Modes as Eigenvectors

The most classical modal object is an eigenvector of a linear operator. For the
autonomous linear system

```{math}
:label: eq:chapter1-linear-autonomous

\dot x = Ax,
```

a right eigenvector satisfies

```{math}
:label: eq:chapter1-right-eigenvector

A\phi_j = \lambda_j \phi_j.
```

If $A$ has a complete set of eigenvectors, the state can be expanded in modal
coordinates,

```{math}
:label: eq:chapter1-modal-expansion

x(t) = \sum_j \eta_j(t)\phi_j,
\qquad
\eta_j(t) = \eta_j(0)e^{\lambda_j t}.
```

This is the setting in which the word *mode* most directly means an eigenvector.
The eigenvalue $\lambda_j$ gives growth or decay through
$\mathrm{Re}(\lambda_j)$ and oscillation through $\mathrm{Im}(\lambda_j)$.

Eigenvectors are not automatically orthogonal, robust, or sufficient for
understanding all behavior. Non-normal systems can have strongly interacting
eigenvectors, repeated eigenvalues may produce defective eigenspaces, and
time-varying or nonlinear systems may not have a fixed matrix $A$ whose
eigenvectors explain the observed dynamics. Later chapters return to these
limitations in detail.

## Modes as Data Directions

In data-driven analysis, one often begins with sampled numerical states
$\mathbf{x}_k$ and assembles a snapshot matrix

```{math}
:label: eq:chapter1-snapshot-matrix

\mathbf{X}
=
\begin{bmatrix}
\mathbf{x}_0 & \mathbf{x}_1 & \cdots & \mathbf{x}_{m-1}
\end{bmatrix}.
```

A POD mode is a direction that captures variance or reconstruction energy in the
data. It is not defined by the dynamics alone. It depends on the snapshots, the
sampling measure, and the inner product used to measure reconstruction error.
For the standard Euclidean inner product, POD modes are left singular vectors of
$\mathbf{X}$, or eigenvectors of the empirical covariance matrix.

DMD modes are different. They are associated with a fitted linear map between
snapshot pairs,

```{math}
:label: eq:chapter1-dmd-fit

\mathbf{Y} \approx A_{\mathrm{DMD}}\mathbf{X},
```

where $\mathbf{Y}$ contains time-shifted snapshots. A DMD mode is tied to the
eigenvectors of this fitted map and is therefore intended to represent coherent
temporal behavior. POD asks for efficient reconstruction. DMD asks for a
low-dimensional linear evolution that approximately advances the data.

These two objectives can agree in special cases, but they do not have to. A
high-energy data direction need not be dynamically invariant, and a dynamically
important direction need not contain the largest variance.

## Modes as Input-Output Structures

For forced linear systems,

```{math}
:label: eq:chapter1-forced-linear-system

\dot x = Ax + Bu,
\qquad
y = Cx + Du,
```

the most important question may not be how the unforced state evolves. It may be
how inputs are amplified into outputs. In the frequency domain, this behavior is
described by the transfer function

```{math}
:label: eq:chapter1-transfer-function

G(i\omega)
=
C(i\omega I-A)^{-1}B + D.
```

Resolvent analysis studies the amplification properties of
$(i\omega I-A)^{-1}$ or the full input-output map $G(i\omega)$. Singular vectors
of these operators define forcing and response modes at each frequency. These
modes depend on $B$, $C$, the norm used to measure inputs and outputs, and the
frequency $\omega$.

This distinction matters in control and sensing. A state-space eigenvector may
be weakly controllable or weakly observable. Conversely, a system can display
large forced response at a frequency even when no eigenvalue lies close to the
imaginary axis, especially when $A$ is non-normal.

## Modes as Nonlinear Observable Coordinates

For nonlinear autonomous dynamics

```{math}
:label: eq:chapter1-nonlinear-autonomous

\dot x = f(x),
```

state-space superposition usually fails. Koopman theory shifts attention from
the state $x(t)$ to observables $g(x(t))$. The Koopman operator evolves
observables by composition with the flow map $\Phi^t$:

```{math}
:label: eq:chapter1-koopman-operator

\mathcal{K}^t g = g \circ \Phi^t.
```

A Koopman eigenfunction satisfies

```{math}
:label: eq:chapter1-koopman-eigenfunction

\mathcal{K}^t \varphi_j = e^{\lambda_j t}\varphi_j.
```

Here the modal coordinate is not a linear projection of the state onto an
eigenvector. It is a nonlinear observable $\varphi_j(x)$. This is one reason
Koopman analysis is attractive: it can expose coordinates with simple temporal
evolution even when the state dynamics are nonlinear. The cost is that
eigenfunctions live in a function space, depend on the chosen observable class,
and can be difficult to compute or even to define cleanly for broadband or
chaotic dynamics.

## What Determines a Mode?

A modal object is never just a pattern. It is a pattern produced by a particular
mathematical problem. Before interpreting a mode, identify the following
ingredients:

- **Operator:** Is the mode associated with $A$, $\Phi(t,t_0)$, $C_x$,
  $S_x(\omega)$, $R(i\omega;A)$, $\mathcal{K}^t$, or a data-fitted map?
- **Space:** Does the mode live in state space, data space, an input-output
  space, a tangent space, or an observable function space?
- **Inner product or norm:** What does it mean for two modes to be orthogonal,
  energetic, or amplified?
- **Measure or data distribution:** Which trajectories, operating conditions,
  or samples define the statistics?
- **Objective:** Is the goal stability analysis, prediction, reduction,
  interpretation, sensing, or control?

Changing any of these ingredients can change the modes. This is not a flaw; it
is the reason modal analysis is useful across so many domains. The important
thing is to avoid mixing interpretations from different modal problems.

## Common Modal Categories

The following taxonomy is a working map for the rest of the course.

| Category | Typical object | Modal quantity | Main question |
| --- | --- | --- | --- |
| State-space modes | Matrix $A$ or propagator $\Phi(t,t_0)$ | Eigenvectors, finite-time singular vectors | How does the state evolve? |
| Mechanical modes | Mass and stiffness matrices $M,K$ | Mode shapes $\phi_j$ and natural frequencies $\omega_j$ | How does a structure vibrate? |
| Statistical modes | Covariance $C_x$ or snapshot matrix $\mathbf{X}$ | POD/SPOD modes | Which patterns dominate the data? |
| Data-dynamic modes | Fitted map $A_{\mathrm{DMD}}$ | DMD eigenvalues and modes | Which coherent patterns advance in time? |
| Input-output modes | Transfer or resolvent operator | Forcing and response singular vectors | Which inputs produce large outputs? |
| Tangent modes | Linearization along a trajectory | Lyapunov vectors and exponents | Which perturbations grow or decay along a path? |
| Koopman modes | Koopman operator $\mathcal{K}^t$ | Eigenfunctions and observable expansions | Which observables evolve linearly? |

The categories overlap, but they should not be collapsed into one definition.
For example, a POD mode and an eigenvector of $A$ may look similar in a lightly
damped oscillator with well-sampled data. In a non-normal shear flow, they may
describe very different structures.

## Summary

Modal analysis is best understood as a family of operator-based representations.
A mode may be an eigenvector, a singular vector, a statistical direction, a
tangent direction, or a nonlinear observable. Its meaning depends on the
operator, the space, the inner product, the data measure, and the modeling
objective.

The next chapter begins with the most classical setting: linear autonomous
systems. There, modes are eigenvectors of a state matrix, and the connection
between eigenvalues, eigenvectors, stability, and modal coordinates can be made
completely explicit.
