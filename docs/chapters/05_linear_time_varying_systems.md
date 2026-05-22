# Linear Time-Varying Systems

Many modal tools begin with a fixed matrix $A$, so one studies the spectrum of

```{math}
\dot x = Ax.
```

That viewpoint is no longer sufficient when the linear dynamics themselves
change in time. In a linear time-varying (LTV) system,

```{math}
:label: eq:chapter5-ltv

\ddf{x}{t} = A(t)x,
\qquad
x(t) \in \mathbb{R}^n,
```

the matrix at one instant does not by itself determine the evolution over a
finite interval. The central object is instead the propagator from an initial
time $t_0$ to a later time $t$.

This chapter develops the state-transition matrix, explains why instantaneous
eigenvalues of $A(t)$ can be misleading, and shows how finite-time growth is
described by singular vectors of the propagator. The worked example uses a
triangular LTV system whose eigenvalues are always stable, yet whose solutions
can still grow over a finite time window.

## Fundamental Solution and State-Transition Matrix

A **fundamental solution matrix** is any matrix-valued solution $X(t)$ of

```{math}
:label: eq:chapter5-fundamental-matrix

\ddf{X}{t} = A(t)X(t)
```

whose columns are linearly independent. If $X(t_0)$ is invertible, then every
solution of {eq}`eq:chapter5-ltv` can be written as

```{math}
:label: eq:chapter5-state-transition-solution

x(t) = \Phi(t,t_0)x(t_0),
\qquad
\Phi(t,t_0) = X(t)X(t_0)^{-1}.
```

The matrix $\Phi(t,t_0)$ is the **state-transition matrix**. It satisfies the
matrix initial-value problem

```{math}
:label: eq:chapter5-state-transition-ivp

\ddf{\Phi(t,t_0)}{t} = A(t)\Phi(t,t_0),
\qquad
\Phi(t_0,t_0) = I.
```

Several identities follow directly from the definition:

```{math}
:label: eq:chapter5-state-transition-properties

\Phi(t,t) = I,
\qquad
\Phi(t_2,t_0) = \Phi(t_2,t_1)\Phi(t_1,t_0),
\qquad
\Phi(t,t_0)^{-1} = \Phi(t_0,t).
```

The composition rule says that propagation over a long interval is built from
propagation over shorter intervals. This is the correct replacement for the
semigroup property $e^{A(t_2-t_0)} = e^{A(t_2-t_1)}e^{A(t_1-t_0)}$ used for
autonomous systems.

If $A(t) \equiv A$ is constant, then

```{math}
:label: eq:chapter5-constant-a

\Phi(t,t_0) = e^{A(t-t_0)}.
```

For genuinely time-varying problems, one cannot usually collapse the solution
to $e^{\int_{t_0}^t A(\tau)\,d\tau}$ because matrices at different times need
not commute. The evolution depends on the ordered accumulation of the dynamics
through the interval.

## Why Instantaneous Eigenvalues Are Not Enough

At each time $t$, one may compute eigenpairs of the matrix $A(t)$,

```{math}
:label: eq:chapter5-instantaneous-eigenproblem

A(t)\phi_j(t) = \lambda_j(t)\phi_j(t).
```

These are **instantaneous** modal objects. They describe the spectrum of the
frozen-time matrix, not the finite-time evolution of the LTV system. In
general, the directions $\phi_j(t)$ themselves vary with time, and their
rotation can matter as much as the values of $\lambda_j(t)$.

Two cautions are important.

First, even if $\mathrm{Re}(\lambda_j(t)) < 0$ for every $t$ and every $j$,
the finite-time propagator can still amplify certain initial conditions over a
window $[t_0,t]$.

Second, even if the eigenvectors of $A(t)$ are known at every time, a solution
cannot usually be obtained by evolving each instantaneous mode independently.
Mode mixing enters through the time dependence of the basis itself.

For LTV systems, the relevant question is therefore not only "what are the
eigenvalues of $A(t)$ right now?" but also "what linear map carries the state
from $t_0$ to $t$, and how much can that map amplify perturbations?"

## Finite-Time Growth and Singular Vectors of the Propagator

Fix a time interval $[t_0,t]$. The amplification of an initial condition is
measured by the norm ratio

```{math}
:label: eq:chapter5-growth-ratio

\frac{\|x(t)\|_2}{\|x(t_0)\|_2}
=
\frac{\|\Phi(t,t_0)x(t_0)\|_2}{\|x(t_0)\|_2}.
```

The largest possible amplification over unit-norm initial conditions is the
largest singular value of the propagator:

```{math}
:label: eq:chapter5-propagator-singular-value

G(t,t_0)
=
\max_{\|x(t_0)\|_2=1}\|\Phi(t,t_0)x(t_0)\|_2
=
\sigma_1\bigl(\Phi(t,t_0)\bigr).
```

If

```{math}
\Phi(t,t_0)v_j = \sigma_j u_j,
```

then $v_1$ is the initial perturbation that experiences the largest
finite-time growth, and $u_1$ is the output direction at time $t$. This is the
LTV analogue of the transient-growth picture from non-normal autonomous
systems, except that the relevant operator is now the finite-time propagator
itself.

Singular vectors answer a different question from eigenvectors. An eigenvector
of $A(t)$ describes a frozen-time spectral direction. A right singular vector
of $\Phi(t,t_0)$ describes the initial state that is most amplified over a
specified interval.

## Tangent Dynamics Along a Nonlinear Trajectory

LTV systems also arise naturally by linearizing a nonlinear system along a
trajectory. Consider

```{math}
:label: eq:chapter5-nonlinear-system

\ddf{x}{t} = f(x,t),
```

and let $x_\star(t)$ be a reference solution. A small perturbation
$\xi(t) = x(t) - x_\star(t)$ satisfies, to first order,

```{math}
:label: eq:chapter5-tangent-linear-system

\ddf{\xi}{t} = Df\bigl(x_\star(t),t\bigr)\xi.
```

This is an LTV system with

```{math}
A(t) = Df\bigl(x_\star(t),t\bigr).
```

The state-transition matrix for this tangent system maps perturbations at time
$t_0$ to perturbations at time $t$. Later chapters use this same object to
define Floquet multipliers for periodic orbits and Lyapunov exponents for
general nonlinear trajectories.

## Numerical Integration of the State-Transition Matrix

Equation {eq}`eq:chapter5-state-transition-ivp` is itself a matrix ordinary
differential equation. A direct numerical approach is to integrate

```{math}
\ddf{\Phi(t,t_0)}{t} = A(t)\Phi(t,t_0)
```

with the identity initial condition. Since the columns of $\Phi(t,t_0)$ each
satisfy the same LTV system with different initial data, one may equivalently
integrate $n$ copies of {eq}`eq:chapter5-ltv`, one for each basis vector of
$\mathbb{R}^n$.

This viewpoint matters in practice:

- the propagator is interval-dependent, so it must be recomputed when $t_0$ or
  $t$ changes;
- the finite-time amplification is extracted from the singular values of the
  numerically computed $\Phi(t,t_0)$;
- long integrations may require periodic rescaling or orthogonalization to
  avoid severe conditioning loss.

For theory, however, the key point is simple: integrating the matrix ODE gives
the object that actually governs finite-time behavior.

## Worked Example: A Triangular LTV System

Consider the state $x(t) = (x_1(t),x_2(t))^\top$ governed by

```{math}
:label: eq:chapter5-example-system

\ddf{x}{t}
=
\begin{bmatrix}
-1 & s(t) \\
0 & -1
\end{bmatrix}
x,
```

where $s(t)$ is a prescribed scalar function. The instantaneous eigenvalues are

```{math}
:label: eq:chapter5-example-eigenvalues

\lambda_1(t) = \lambda_2(t) = -1
```

for every time $t$. A frozen-time eigenvalue check would therefore label the
system as uniformly stable.

That conclusion is incomplete. The second component solves

```{math}
:label: eq:chapter5-example-x2

x_2(t) = e^{-(t-t_0)}x_2(t_0).
```

The first component satisfies

```{math}
\ddf{x_1}{t} = -x_1 + s(t)x_2(t),
```

so an integrating factor gives

```{math}
:label: eq:chapter5-example-x1

x_1(t)
=
e^{-(t-t_0)}
\left[
x_1(t_0)
+
\left(\int_{t_0}^t s(\tau)\,d\tau\right)x_2(t_0)
\right].
```

Define

```{math}
:label: eq:chapter5-example-g

g(t,t_0) = \int_{t_0}^t s(\tau)\,d\tau.
```

Then the state-transition matrix is

```{math}
:label: eq:chapter5-example-propagator

\Phi(t,t_0)
=
e^{-(t-t_0)}
\begin{bmatrix}
1 & g(t,t_0) \\
0 & 1
\end{bmatrix}.
```

The off-diagonal term accumulates shear over the interval. Even though the
instantaneous eigenvalues remain fixed at $-1$, an initial condition with
$x(t_0) = (0,1)^\top$ evolves to

```{math}
\Phi(t,t_0)
\begin{bmatrix}
0 \\
1
\end{bmatrix}
=
e^{-(t-t_0)}
\begin{bmatrix}
g(t,t_0) \\
1
\end{bmatrix},
```

whose norm is

```{math}
:label: eq:chapter5-example-growth

\left\|
\Phi(t,t_0)
\begin{bmatrix}
0 \\
1
\end{bmatrix}
\right\|_2
=
e^{-(t-t_0)}\sqrt{1 + g(t,t_0)^2}.
```

If $g(t,t_0)$ is large enough, this quantity exceeds $1$, so the solution grows
over the interval despite stable instantaneous eigenvalues at every time.

The exact optimal amplification is the largest singular value of
{eq}`eq:chapter5-example-propagator`:

```{math}
:label: eq:chapter5-example-singular-value

\sigma_1\bigl(\Phi(t,t_0)\bigr)
=
e^{-(t-t_0)}
\left[
\frac{
2 + g(t,t_0)^2 + |g(t,t_0)|\sqrt{g(t,t_0)^2 + 4}
}{2}
\right]^{1/2}.
```

Thus the finite-time growth is governed by the accumulated coupling
$g(t,t_0)$, not by the frozen-time eigenvalues alone.

If $s(t) \equiv \beta$ on the interval, then $g(t,t_0) = \beta(t-t_0)$ and the
growth can be checked by hand. This simple example captures the main lesson of
LTV modal analysis: finite-time behavior is controlled by the propagator.

## Main Takeaways

- For an LTV system, the primary evolution object is the state-transition
  matrix $\Phi(t,t_0)$, not the spectrum of $A(t)$ at a single instant.
- Propagator composition expresses how dynamics accumulate across subintervals.
- Instantaneous eigenvalues of $A(t)$ need not predict finite-time
  amplification.
- Singular values and singular vectors of $\Phi(t,t_0)$ identify the strongest
  finite-time growth and the associated initial/output directions.
- Linearization of nonlinear dynamics along a trajectory produces an LTV
  tangent system whose propagator underlies later stability tools.
