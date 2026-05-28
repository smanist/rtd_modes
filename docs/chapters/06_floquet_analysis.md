# Floquet Analysis

Periodic linear time-varying systems sit between autonomous modal analysis and
the stability theory of nonlinear periodic motion. Their coefficients change in
time, but they do so with a repeating pattern, so one period of evolution
contains the essential spectral information. Floquet analysis packages that
information into the monodromy matrix and uses its eigenvalues to describe
growth, decay, oscillation, and orbital stability.

## Periodic Linear Time-Varying Systems

Consider the homogeneous linear system

```{math}
:label: eq:chapter6-periodic-ltv

\ddf{x}{t} = A(t)x,
\qquad
A(t+T) = A(t),
\qquad
x(t) \in \mathbb{R}^n.
```

The coefficient matrix is not constant, so ordinary eigenvectors of a single
matrix no longer describe the dynamics. Instead, one uses the
state-transition matrix $\Phi(t,t_0)$ defined by

```{math}
:label: eq:chapter6-state-transition

\frac{d}{dt}\Phi(t,t_0) = A(t)\Phi(t,t_0),
\qquad
\Phi(t_0,t_0) = I,
```

so that every solution satisfies
$x(t) = \Phi(t,t_0)x(t_0)$. The semigroup property

```{math}
:label: eq:chapter6-semigroup

\Phi(t_2,t_0) = \Phi(t_2,t_1)\Phi(t_1,t_0)
```

implies that evolution over many periods is obtained by repeated
matrix multiplication once the one-period map is known.

Periodicity of $A(t)$ does not mean that $\Phi(t,t_0)$ is periodic. Instead,
periodicity implies the covariance relation

```{math}
:label: eq:chapter6-period-shift

\Phi(t+T,t_0+T) = \Phi(t,t_0).
```

That identity is the starting point for Floquet theory.

## Monodromy Matrix and Floquet Multipliers

Choose a reference phase, commonly $t_0 = 0$, and define the monodromy matrix

```{math}
:label: eq:chapter6-monodromy

M_F = \Phi(T,0).
```

The matrix $M_F$ maps an initial perturbation to its value one period later:
$x(T) = M_F x(0)$. By the semigroup property,

```{math}
:label: eq:chapter6-multiple-periods

x(mT) = M_F^m x(0),
\qquad
m \in \mathbb{N}.
```

The eigenvalues $\rho_j$ of $M_F$ are the Floquet multipliers,

```{math}
:label: eq:chapter6-multipliers

M_F \phi_j = \rho_j \phi_j.
```

They play for periodic systems the role that ordinary eigenvalues play for
autonomous systems sampled once per period.

The basic stability test is discrete:

- If $|\rho_j| < 1$ for every $j$, the zero solution is asymptotically stable.
- If any multiplier satisfies $|\rho_j| > 1$, the zero solution is unstable.
- If $|\rho_j| = 1$ for some $j$, stability depends on semisimplicity and on
  how those unit-modulus multipliers interact with forcing or nonlinear terms.

This criterion follows directly from the fact that the period-to-period
evolution is governed by repeated applications of $M_F$.

Before returning to the worked oscillator, it is useful to separate the two
pieces of multiplier data: distance from the unit circle and angular advance
per period. The next interactive uses a representative conjugate pair
$\rho_\pm = r e^{\pm i \theta}$ to show how the unit-circle test controls
sampled growth and how the same pair sets the principal Floquet exponents.

:::{course-interactive}
:data-example: chapter6-floquet-multiplier-explorer
Interactive example loading...
:::

## Floquet Exponents and Floquet Form

Floquet theory states that the state-transition matrix can be factored as

```{math}
:label: eq:chapter6-floquet-form

\Phi(t,0) = P(t)e^{Rt},
\qquad
P(t+T) = P(t),
```

for a periodic matrix $P(t)$ and a constant matrix $R$. Evaluating at one
period shows that

```{math}
:label: eq:chapter6-monodromy-factor

M_F = \Phi(T,0) = P(0)e^{RT}.
```

With the common normalization $P(0) = I$, this simplifies to
$M_F = e^{RT}$. The eigenvalues $\nu_j$ of $R$ are Floquet exponents, related
to the multipliers by

```{math}
:label: eq:chapter6-exponent-multiplier

\rho_j = e^{\nu_j T}.
```

Because the complex logarithm is multivalued, the exponent is not unique:

```{math}
:label: eq:chapter6-branch-ambiguity

\nu_j
= \frac{1}{T}\log(\rho_j)
= \frac{1}{T}\bigl(\log|\rho_j| + i(\arg \rho_j + 2\pi k)\bigr),
\qquad
k \in \mathbb{Z}.
```

Its real part is unique modulo that imaginary shift and gives the average
exponential growth rate per unit time:
$\mathrm{Re}(\nu_j) < 0$ implies decay, and
$\mathrm{Re}(\nu_j) > 0$ implies growth.

## Stability, Parametric Resonance, and Periodic Coefficients

Periodic coefficients can inject or remove energy even when the instantaneous
system matrices appear stable. This is the mechanism of parametric resonance:
the instability is caused by time variation in the coefficients rather than by
an external forcing term.

The classical example is the Mathieu equation

```{math}
:label: eq:chapter6-mathieu

\ddot{q} + \bigl(\delta + \epsilon \cos(\Omega t)\bigr) q = 0,
```

which is a second-order periodic system. When rewritten as a first-order system
in the state $x = (q,\dot{q})^\top$, it takes the form
{eq}`eq:chapter6-periodic-ltv`. Its Floquet multipliers organize the familiar
stability and instability tongues in parameter space. The boundaries of those
regions occur when multipliers collide on the unit circle, after which they may
move off the circle and create exponential growth from one period to the next.

This viewpoint clarifies the distinction between a periodic coefficient and a
periodic solution. In Floquet analysis of
{eq}`eq:chapter6-periodic-ltv`, the equation itself has periodic coefficients.
For a nonlinear system linearized about a periodic orbit, the periodicity comes
from evaluating the Jacobian along the orbit.

## Relation to Poincare Maps and Periodic Orbits

Consider a nonlinear autonomous system

```{math}
:label: eq:chapter6-nonlinear-system

\ddf{x}{t} = f(x),
```

and let $x_\ast(t)$ be a $T$-periodic orbit:
$x_\ast(t+T) = x_\ast(t)$. A perturbation
$\xi(t) = x(t) - x_\ast(t)$ satisfies the linearized equation

```{math}
:label: eq:chapter6-orbit-linearization

\ddf{\xi}{t} = Df\bigl(x_\ast(t)\bigr)\xi,
```

where the Jacobian is $T$-periodic because the base orbit is periodic. The
monodromy matrix of {eq}`eq:chapter6-orbit-linearization` determines the
orbital stability of the limit cycle.

Two facts are especially important:

1. An autonomous periodic orbit always has a neutral phase direction. Indeed,
   $\dot{x}_\ast(t)$ solves the variational equation, so the monodromy matrix
   always has a multiplier $\rho = 1$ associated with time shift along the
   orbit.
2. The remaining multipliers are transverse multipliers. Their moduli determine
   whether perturbations normal to the cycle decay or grow from one return to
   the next.

This is the direct bridge to the Poincare map. If a transverse section
$\Sigma$ intersects the orbit once per period and $P:\Sigma \to \Sigma$ is the
return map, then the Jacobian $DP$ at the fixed point has eigenvalues equal to
the nontrivial Floquet multipliers. The phase multiplier $\rho = 1$ is absent
because the Poincare section quotients out motion along the orbit.

## Worked Example: A Piecewise-Periodic Oscillator

To keep the calculation explicit, consider the scalar second-order equation

```{math}
:label: eq:chapter6-piecewise-oscillator

\ddot{q} + \kappa(t)q = 0,
```

with piecewise-periodic stiffness

```{math}
:label: eq:chapter6-piecewise-stiffness

\kappa(t) =
\begin{cases}
\omega_1^2, & 0 \le t < T/2, \\
\omega_2^2, & T/2 \le t < T,
\end{cases}
\qquad
\kappa(t+T) = \kappa(t).
```

Introduce the first-order state
$x = (q,\dot{q})^\top$. On each half-period the system is autonomous with

```{math}
:label: eq:chapter6-piecewise-first-order

\ddf{x}{t} = A_j x,
\qquad
A_j =
\begin{bmatrix}
0 & 1 \\
-\omega_j^2 & 0
\end{bmatrix},
\qquad
j \in \{1,2\}.
```

For a constant-frequency oscillator, the propagation matrix over a time interval
$\tau$ is

```{math}
:label: eq:chapter6-oscillator-propagator

e^{A_j \tau}
=
\begin{bmatrix}
\cos(\omega_j \tau) & \dfrac{\sin(\omega_j \tau)}{\omega_j} \\
-\omega_j \sin(\omega_j \tau) & \cos(\omega_j \tau)
\end{bmatrix}.
```

Therefore the monodromy matrix is the product of the two half-period
propagators,

```{math}
:label: eq:chapter6-piecewise-monodromy

M_F
= \Phi(T,0)
= e^{A_2 T/2} e^{A_1 T/2}.
```

Let
$c_j = \cos(\omega_j T/2)$ and $s_j = \sin(\omega_j T/2)$. Multiplying the two
matrices gives

```{math}
:label: eq:chapter6-piecewise-monodromy-expanded

M_F
=
\begin{bmatrix}
c_2 c_1 - \dfrac{\omega_1}{\omega_2}s_2 s_1 &
\dfrac{c_2 s_1}{\omega_1} + \dfrac{s_2 c_1}{\omega_2} \\
-\omega_2 s_2 c_1 - \omega_1 c_2 s_1 &
c_2 c_1 - \dfrac{\omega_2}{\omega_1}s_2 s_1
\end{bmatrix}.
```

Since each half-step matrix has determinant one, $\det(M_F)=1$. The Floquet
multipliers therefore satisfy

```{math}
:label: eq:chapter6-piecewise-characteristic

\rho^2 - \mathrm{tr}(M_F)\rho + 1 = 0.
```

The trace is

```{math}
:label: eq:chapter6-piecewise-trace

\mathrm{tr}(M_F)
= 2 c_1 c_2
- \left(\frac{\omega_1}{\omega_2} + \frac{\omega_2}{\omega_1}\right)s_1 s_2.
```

Equation {eq}`eq:chapter6-piecewise-characteristic` shows the stability test
explicitly:

- If $|\mathrm{tr}(M_F)| < 2$, the multipliers form a complex-conjugate pair on
  the unit circle and the motion is bounded.
- If $|\mathrm{tr}(M_F)| > 2$, the multipliers are real and reciprocal, with one
  outside the unit circle, so the zero solution is unstable.
- If $|\mathrm{tr}(M_F)| = 2$, the system lies on a transition boundary between
  the two behaviors.

The next interactive evaluates the exact matrix
{eq}`eq:chapter6-piecewise-monodromy` for this piecewise-periodic oscillator.
It shows both the one-period image of the unit circle and the sampled orbit
$x_{m+1} = M_F x_m$, so the discrete Floquet map can be read directly in the
phase plane.

:::{course-interactive}
:data-example: chapter6-piecewise-monodromy-map
Interactive example loading...
:::

Even though each half-period is an undriven oscillator, alternating the
stiffness can create net amplification over a full cycle. That is the same
Floquet mechanism that underlies parametric resonance in smoother systems such
as the Mathieu equation.

## Interpretation for Modal Analysis

Floquet analysis does not produce stationary spatial modes in the same sense as
an autonomous eigenvalue problem. Instead, it separates the dynamics into:

- a periodic part $P(t)$ that describes how the modal shapes vary within one
  period;
- an exponential part $e^{Rt}$ that describes the average growth, decay, and
  rotation from period to period.

For periodic orbits, this separation is especially useful. The neutral phase
mode describes reparameterization along the cycle, while the transverse modes
measure whether nearby trajectories are attracted toward or repelled away from
the cycle. In that sense, Floquet multipliers are the natural spectral objects
for periodic motion, just as eigenvalues are the natural spectral objects for
equilibria.
