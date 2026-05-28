# Koopman Spectral Theory

Koopman theory studies nonlinear dynamics by evolving observables rather than
states. That shift is useful because the Koopman operator is linear even when
the underlying state equation is not. The gain is a framework for nonlinear
observable coordinates with simple temporal evolution. The cost is that the
spectral problem lives in a function space, so discrete modal expansions need
not exist globally and numerical approximations require care.

This chapter introduces Koopman operators for maps and flows, the Koopman
generator, eigenfunctions as nonlinear coordinates, and the distinction between
true Koopman spectral objects and data-driven approximations. The worked
examples stay deliberately simple: scalar decay, circle rotation, and
translation.

## Koopman Operators for Maps and Flows

For a discrete-time system

```{math}
:label: eq:chapter11-map

x_{k+1} = F(x_k),
\qquad
x_k \in \mathcal{M},
```

the Koopman operator acts on a scalar observable $g:\mathcal{M}\to\mathbb{C}$
by composition with the state update:

```{math}
:label: eq:chapter11-koopman-map

(\mathcal{K}g)(x) = g(F(x)).
```

Thus $\mathcal{K}$ advances measurements, not states. If $g(x)=x_i$ is one
coordinate function, then $(\mathcal{K}g)(x)$ is the next-step value of that
coordinate evaluated at the current state.

For a continuous-time nonlinear system

```{math}
:label: eq:chapter11-flow-system

\ddf{x}{t} = f(x),
```

let $\Phi^t$ denote the flow map, so that $x(t)=\Phi^t(x_0)$. The Koopman
semigroup is

```{math}
:label: eq:chapter11-koopman-flow

(\mathcal{K}^t g)(x) = g(\Phi^t(x)).
```

The family $\{\mathcal{K}^t\}_{t\ge 0}$ is linear and satisfies the semigroup
property

```{math}
:label: eq:chapter11-koopman-semigroup

\mathcal{K}^{t+s} = \mathcal{K}^t \mathcal{K}^s,
\qquad
\mathcal{K}^0 = I.
```

Linearity here refers to the observable argument:

```{math}
\mathcal{K}^t(ag_1 + bg_2) = a\mathcal{K}^t g_1 + b\mathcal{K}^t g_2.
```

That linearity does not mean the state dynamics are linear. It means the
observable evolution is organized by a linear operator on a typically
infinite-dimensional function space.

## Koopman Eigenfunctions and the Generator

For a map, a Koopman eigenfunction $\varphi$ with eigenvalue $\mu$ satisfies

```{math}
:label: eq:chapter11-map-eigenfunction

\mathcal{K}\varphi = \mu \varphi.
```

Along a trajectory this gives

```{math}
:label: eq:chapter11-map-evolution

\varphi(x_k) = \mu^k \varphi(x_0).
```

For a flow, a Koopman eigenfunction with exponent $\lambda$ satisfies

```{math}
:label: eq:chapter11-flow-eigenfunction

\mathcal{K}^t \varphi = e^{\lambda t}\varphi
\qquad
\text{for all } t \ge 0,
```

so that

```{math}
:label: eq:chapter11-flow-evolution

\varphi(x(t)) = e^{\lambda t}\varphi(x_0).
```

The key interpretation is that $\varphi(x)$ is a nonlinear observable
coordinate whose time dependence is exactly exponential. If we define
$z(t)=\varphi(x(t))$, then $z$ evolves by the scalar linear equation
$\dot z = \lambda z$ even though $x(t)$ may satisfy a nonlinear state equation.

For smooth observables, the infinitesimal generator of the Koopman semigroup is

```{math}
:label: eq:chapter11-generator

\mathcal{L}g = f \cdot \nabla g.
```

Indeed, differentiating {eq}`eq:chapter11-koopman-flow` at $t=0$ gives

```{math}
:label: eq:chapter11-generator-limit

\mathcal{L}g
=
\left.\frac{d}{dt} g(\Phi^t(x))\right|_{t=0}
=
\nabla g(x)\cdot f(x).
```

If $\varphi$ is a Koopman eigenfunction of the flow, then it also satisfies the
generator eigenvalue problem

```{math}
:label: eq:chapter11-generator-eigenfunction

\mathcal{L}\varphi = \lambda \varphi.
```

The generator formulation is often more convenient analytically because it
replaces the family $\mathcal{K}^t$ by one differential operator.

## Worked Example: Scalar Decay

Consider

```{math}
:label: eq:chapter11-scalar-decay

\ddf{x}{t} = -x.
```

The flow is $\Phi^t(x)=e^{-t}x$, so

```{math}
(\mathcal{K}^t g)(x) = g(e^{-t}x).
```

The generator is

```{math}
:label: eq:chapter11-scalar-generator

\mathcal{L}g = -x \ddf{g}{x}.
```

Now take the monomials $\varphi_m(x)=x^m$ for $m\in\mathbb{N}$. Then

```{math}
:label: eq:chapter11-scalar-monomials

\mathcal{L}\varphi_m
=
-x \frac{d}{dx}(x^m)
=
-m x^m
=
-m \varphi_m.
```

Hence each $\varphi_m$ is a Koopman eigenfunction with exponent
$\lambda_m=-m$, and

```{math}
:label: eq:chapter11-scalar-monomial-evolution

\varphi_m(x(t)) = e^{-mt}\varphi_m(x_0).
```

Two lessons are immediate:

- The basic state coordinate $\varphi_1(x)=x$ is one Koopman eigenfunction,
  but it is not the only one.
- Nonlinear observables such as $x^2$ and $x^3$ also evolve exponentially, with
  rates inherited from the nonlinear observable transformation rather than from
  a different state equation.

The next interactive keeps this scalar system fixed and asks how the observable
view changes as one moves from $x$ to higher monomials $\varphi_m(x)=x^m$.

:::{course-interactive}
:data-example: chapter11-scalar-decay-eigenfunctions

Interactive example loading...
:::

Near a stable equilibrium, this is the template behind nonlinear modal
coordinates: one looks for observable coordinates that evolve linearly even
when the state variables do not decouple linearly.

## Point Spectrum, Koopman Modes, and Linear Systems

An eigenvalue belongs to the **point spectrum** if there is a nonzero
eigenfunction associated with it. If an observable can be expanded as

```{math}
:label: eq:chapter11-koopman-expansion

g(x) = \sum_{j=1}^{\infty} \varphi_j(x) v_j,
```

where the $\varphi_j$ are Koopman eigenfunctions and $v_j \in \mathbb{C}^p$ are
constant coefficient vectors, then

```{math}
:label: eq:chapter11-koopman-expansion-evolution

g(x(t)) = \sum_{j=1}^{\infty} e^{\lambda_j t}\varphi_j(x_0) v_j.
```

The vectors $v_j$ are **Koopman modes** of the vector-valued observable $g$.
They are not eigenfunctions, and they are not automatically the same as state
space eigenvectors.

This distinction matters:

- A **Koopman eigenfunction** $\varphi_j$ is a scalar observable coordinate.
- A **Koopman mode** $v_j$ is a coefficient vector in the expansion of a chosen
  vector observable.
- A **DMD mode** is an eigenvector of a fitted finite-dimensional linear map
  built from data.
- An **EDMD or Galerkin eigenvalue** is an approximation whose meaning depends
  on the dictionary, sampling, and projection.

These objects may coincide in special cases, but they should not be collapsed
into one definition.

The cleanest special case is a diagonalizable linear system

```{math}
:label: eq:chapter11-linear-system

\ddf{x}{t} = Ax.
```

Let $v_j$ and $\psi_j$ be right and left eigenvectors of $A$,

```{math}
:label: eq:chapter11-linear-eigenvectors

Av_j = \lambda_j v_j,
\qquad
\psi_j^\ast A = \lambda_j \psi_j^\ast,
\qquad
\psi_i^\ast v_j = \delta_{ij}.
```

Then

```{math}
:label: eq:chapter11-linear-eigenfunctions

\varphi_j(x) = \psi_j^\ast x
```

is a Koopman eigenfunction, because

```{math}
:label: eq:chapter11-linear-eigenfunction-proof

\varphi_j(x(t))
=
\psi_j^\ast e^{At}x_0
=
e^{\lambda_j t}\psi_j^\ast x_0
=
e^{\lambda_j t}\varphi_j(x_0).
```

For the state observable $g(x)=x$, one therefore has

```{math}
:label: eq:chapter11-linear-state-expansion

x = \sum_{j=1}^n \varphi_j(x)v_j.
```

In this special case, the Koopman modes of the state observable are the usual
right eigenvectors of $A$. That identification is convenient, but it is a
special property of linear finite-dimensional systems rather than a general
fact of Koopman theory.

## Circle Rotations and Quasiperiodic Systems

Consider the circle map

```{math}
:label: eq:chapter11-circle-map

\theta_{k+1} = \theta_k + \omega \pmod{2\pi},
\qquad
\theta_k \in \mathbb{T}^1.
```

For the Fourier observable $\varphi_m(\theta)=e^{im\theta}$,

```{math}
:label: eq:chapter11-circle-eigenfunctions

(\mathcal{K}\varphi_m)(\theta)
=
\varphi_m(\theta+\omega)
=
e^{im\omega}\varphi_m(\theta).
```

Thus each Fourier mode is a Koopman eigenfunction with eigenvalue

```{math}
:label: eq:chapter11-circle-eigenvalues

\mu_m = e^{im\omega},
\qquad
m \in \mathbb{Z}.
```

This is a pure point spectrum generated by harmonic observables on the circle.
If $\omega/(2\pi)$ is rational, trajectories are periodic. If it is irrational,
trajectories are dense on the circle, yet the Koopman spectrum remains pure
point because the Fourier basis still diagonalizes the operator.

The same idea extends to torus flows

```{math}
:label: eq:chapter11-torus-flow

\ddf{\theta}{t} = \Omega,
\qquad
\theta \in \mathbb{T}^d,
```

for which

```{math}
:label: eq:chapter11-torus-eigenfunctions

\varphi_k(\theta) = e^{i k \cdot \theta},
\qquad
\lambda_k = i k \cdot \Omega,
\qquad
k \in \mathbb{Z}^d.
```

Quasiperiodic motion therefore admits a countable set of Koopman frequencies
assembled from integer combinations of the basic rotation frequencies.

The next interactive compares the state-space rotation with the observable
sequence $\varphi_m(\theta_k)=e^{i m \theta_k}$ so that the eigenvalue
$\mu_m=e^{i m \omega}$ appears as a one-step multiplier in the complex plane.

:::{course-interactive}
:data-example: chapter11-circle-rotation-observables

Interactive example loading...
:::

## Continuous Spectrum and the Limits of Discrete Modal Expansions

Not all dynamics admit a clean decomposition into isolated Koopman
eigenfunctions. A standard example is translation on the line:

```{math}
:label: eq:chapter11-translation

\ddf{x}{t} = 1,
\qquad
\Phi^t(x) = x+t.
```

The Koopman action is

```{math}
:label: eq:chapter11-translation-koopman

(\mathcal{K}^t g)(x) = g(x+t),
\qquad
\mathcal{L}g = \ddf{g}{x}.
```

For each real wavenumber $\beta$, the plane wave

```{math}
:label: eq:chapter11-translation-plane-wave

\varphi_\beta(x) = e^{i\beta x}
```

satisfies

```{math}
:label: eq:chapter11-translation-eigenrelation

\mathcal{L}\varphi_\beta = i\beta \varphi_\beta,
\qquad
\mathcal{K}^t \varphi_\beta = e^{i\beta t}\varphi_\beta.
```

If one works on a space of bounded or continuous observables, these plane waves
provide an uncountable family of Koopman eigenfunctions indexed by
$\beta\in\mathbb{R}$. However, the Hilbert-space setting used below is
different. On $\mathcal{H}=L^2(\mathbb{R})$, the functions
$e^{i\beta x}$ are not square-integrable, so they are not ordinary Koopman
eigenfunctions in $\mathcal{H}$. Instead, Fourier analysis shows that the
translation group has continuous spectrum along the imaginary axis, with plane
waves playing the role of generalized eigenfunctions.

That observation matters beyond translation. Chaotic or mixing systems often
have observables whose temporal behavior includes a broadband part. In such
cases a short sum of exponentials may fit data over a finite window, but that
fit should not be mistaken for a global countable Koopman mode expansion.

## Spectral Measures and Broadband Content

For measure-preserving systems acting on a Hilbert space of observables such as
$\mathcal{H}=L^2(\mu)$, the Koopman operator is unitary. The spectral theorem
then associates to each observable $g\in\mathcal{H}$ a spectral measure
$\nu_g$ such that

```{math}
:label: eq:chapter11-spectral-measure

\langle g,\mathcal{K}^t g\rangle_{\mathcal{H}}
=
\int_{\mathbb{R}} e^{i\omega t}\,d\nu_g(\omega).
```

Equation {eq}`eq:chapter11-spectral-measure` is an operator-theoretic version
of the Fourier representation of autocorrelation.

- Atoms of $\nu_g$ correspond to discrete frequencies and point spectrum.
- An absolutely continuous part corresponds to broadband spectral density.
- A mixed measure indicates that an observable contains both coherent
  quasiperiodic content and broadband content.

This is why one should separate "the system has some recurring frequencies"
from "the observable lies in a finite-dimensional Koopman-invariant subspace."
The former can occur even when the latter fails.

## Motivation for Rigged Hilbert Spaces

```{note}
This section is motivational rather than fully developed. The goal is to
explain why generalized eigenfunctions can be useful even when they are not
ordinary elements of the observable Hilbert space.
```

Continuous-spectrum problems often require objects that behave like
eigenfunctions but do not belong to $\mathcal{H}$. A common framework is a
rigged Hilbert space

```{math}
:label: eq:chapter11-rigged-hilbert

\Phi \subset \mathcal{H} \subset \Phi',
```

where $\Phi$ is a space of test observables and $\Phi'$ is its dual space of
continuous linear functionals or distributions.

The translation example is the guiding analogy. Plane waves
$e^{i\beta x}$ diagonalize the derivative operator in the Fourier sense, but
they are not square-integrable on $\mathbb{R}$. In the
$L^2(\mathbb{R})$ spectral-theorem setting they are therefore better treated
as generalized eigenfunctions, not ordinary observables. Koopman operators
with continuous spectrum can require the same broader viewpoint:
distributional modes may organize the observable evolution even when ordinary
Hilbert-space eigenfunctions are absent.

## Galerkin Approximation and EDMD

In computation, one usually approximates Koopman action on a finite dictionary
of observables

```{math}
:label: eq:chapter11-dictionary

\Psi(x)
=
\begin{bmatrix}
\psi_1(x) \\
\psi_2(x) \\
\vdots \\
\psi_q(x)
\end{bmatrix}.
```

The span of $\{\psi_1,\dots,\psi_q\}$ is a trial space for a Galerkin or
least-squares approximation. For snapshot pairs

```{math}
:label: eq:chapter11-snapshot-pairs

y_k = F(x_k),
\qquad
k=1,\dots,m,
```

one common EDMD construction forms

```{math}
:label: eq:chapter11-edmd-matrices

G = \frac{1}{m}\sum_{k=1}^m \Psi(x_k)\Psi(x_k)^\ast,
\qquad
A = \frac{1}{m}\sum_{k=1}^m \Psi(x_k)\Psi(y_k)^\ast,
```

and then uses the finite matrix

```{math}
:label: eq:chapter11-edmd-operator

K_q = G^\dagger A
```

as an approximate Koopman representation on the dictionary span.

If the dictionary consists only of linear state coordinates, this construction
reduces to a DMD-like linear fit on the measured observable. More expressive
dictionaries can approximate nonlinear eigenfunctions, but they also introduce
new failure modes.

Three cautions are central.

- **Dictionary choice:** If the span is too small, important eigenfunctions are
  missed. If it is too large or poorly scaled, the approximation becomes ill
  conditioned.
- **Regularization:** Truncated SVD, Tikhonov regularization, or sparsity
  promotion may stabilize the fit, but they also modify the apparent spectrum.
- **Spectral pollution:** Eigenvalues of $K_q$ need not converge to true
  Koopman spectral points. Spurious eigenvalues can appear and move as the
  dictionary, data window, or regularization changes.

For generator approximations, the same caution applies: one approximates
$\mathcal{L}$ on a finite trial space and must distinguish robust spectral
features from projection artifacts.

## Residual Checks and Interpretation of DMD-Like Spectra

Suppose an approximate eigenfunction is represented by

```{math}
:label: eq:chapter11-approx-eigenfunction

\hat{\varphi}(x) = w^\ast \Psi(x).
```

For a map, a natural residual diagnostic on data is

```{math}
:label: eq:chapter11-map-residual

\eta_{\mathrm{map}}
=
\frac{
\left(
\sum_{k=1}^m
\left|
\hat{\varphi}(y_k) - \mu \hat{\varphi}(x_k)
\right|^2
\right)^{1/2}
}{
\left(
\sum_{k=1}^m
\left|
\hat{\varphi}(x_k)
\right|^2
\right)^{1/2}
}.
```

For a flow with a differentiable approximation, one may instead check the
generator residual

```{math}
:label: eq:chapter11-generator-residual

\eta_{\mathrm{gen}}
=
\frac{\|f\cdot\nabla \hat{\varphi} - \lambda \hat{\varphi}\|}{\|\hat{\varphi}\|}.
```

Residual checks are useful because eigenvalue plots alone are easy to
over-interpret. In particular:

- Small residuals that remain stable across different windows, sample sets, and
  dictionary refinements support the interpretation of an isolated point
  spectrum component.
- Clouds or arcs of eigenvalues that drift with rank truncation or dictionary
  choice often signal continuous spectrum, mixed spectrum, or spectral
  pollution rather than a set of genuine Koopman modes.
- A DMD mode can still be useful for short-window reconstruction even when it
  is not a true Koopman mode of the underlying system.
- In broadband or chaotic systems, forcing a discrete exponential fit may
  produce visually persuasive spectra without identifying global nonlinear
  observable coordinates.

The practical lesson is conservative interpretation. True Koopman
eigenfunctions, Koopman modes, DMD outputs, and finite-dimensional Galerkin
spectra answer related but different questions. The analyst should keep those
questions separate before attaching physical meaning to any observed
eigenvalue-frequency pattern.
