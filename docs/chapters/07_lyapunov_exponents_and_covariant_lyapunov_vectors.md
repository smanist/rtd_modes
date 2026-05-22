# Lyapunov Exponents and Covariant Lyapunov Vectors

Many nonlinear systems do not admit a single global modal basis that explains
perturbation growth everywhere in state space. Instead, the relevant tangent
directions depend on the trajectory being followed. This chapter studies that
trajectory-dependent structure through tangent linear dynamics, finite-time and
asymptotic Lyapunov exponents, QR-based computation, and covariant Lyapunov
vectors (CLVs). The anchor example is a diagonal linear time-varying system,
which keeps every construction hand derivable while still exposing the main
ideas.

## Tangent Linear Dynamics Along a Trajectory

Consider a nonlinear autonomous system

```{math}
:label: eq:chapter7-nonlinear-system

\ddf{x}{t} = f(x),
\qquad
x(t) \in \mathbb{R}^n.
```

Let $x(t)$ be a reference trajectory. A small perturbation
$\xi(t) \in \mathbb{R}^n$ about that trajectory evolves according to the
tangent linear system

```{math}
:label: eq:chapter7-tangent-linear

\ddf{\xi}{t} = A(t)\xi,
\qquad
A(t) = Df(x(t)).
```

This is a linear time-varying system even when the original dynamics are
autonomous, because the Jacobian is evaluated along a moving trajectory. Its
state-transition matrix $\Phi(t,t_0)$ satisfies

```{math}
:label: eq:chapter7-state-transition

\frac{\mathrm{d}}{\mathrm{d} t}\Phi(t,t_0) = A(t)\Phi(t,t_0),
\qquad
\Phi(t_0,t_0) = I,
```

so that

```{math}
:label: eq:chapter7-perturbation-propagation

\xi(t) = \Phi(t,t_0)\xi(t_0).
```

The operator $\Phi(t,t_0)$ is the fundamental object. Instantaneous eigenvalues
of $A(t)$ do not by themselves determine finite-interval perturbation growth,
because the directions selected by the dynamics rotate and interact over time.

## Finite-Time Lyapunov Exponents

Over a finite window of length $T>0$, the amplification of perturbations is
governed by the singular values of the propagator
$\Phi(t_0+T,t_0)$. Let

```{math}
:label: eq:chapter7-svd

\Phi(t_0+T,t_0) = U \Sigma V^*,
\qquad
\Sigma = \mathrm{diag}(\sigma_1,\dots,\sigma_n),
\qquad
\sigma_1 \ge \cdots \ge \sigma_n > 0.
```

The finite-time Lyapunov exponents (FTLEs) are

```{math}
:label: eq:chapter7-ftle

\chi_j^{(T)}(t_0) = \frac{1}{T}\log \sigma_j\bigl(\Phi(t_0+T,t_0)\bigr),
\qquad
j=1,\dots,n.
```

These quantities answer a finite-horizon optimization problem: the right
singular vector $v_j$ gives an initial perturbation direction at time $t_0$,
and the left singular vector $u_j$ gives the corresponding arrival direction at
time $t_0+T$. In particular,

```{math}
:label: eq:chapter7-max-growth

\max_{\xi(t_0)\neq 0}
\frac{\|\xi(t_0+T)\|}{\|\xi(t_0)\|}
=
\sigma_1\bigl(\Phi(t_0+T,t_0)\bigr).
```

Finite-time singular vectors are therefore optimal growth directions over a
chosen interval. They are not, in general, covariant directions attached to the
trajectory itself.

## Asymptotic Lyapunov Exponents

If the long-time averages stabilize, the asymptotic Lyapunov exponents are
defined by

```{math}
:label: eq:chapter7-asymptotic-le

\chi_j
=
\lim_{T\to\infty}\frac{1}{T}
\log \sigma_j\bigl(\Phi(t_0+T,t_0)\bigr).
```

Under the hypotheses of Oseledets' multiplicative ergodic theorem, these
limits exist for almost every trajectory with respect to an invariant measure
$\mu$, and they are independent of the initial time except on a set of measure
zero. The exponents classify tangent directions by average exponential growth:

- $\chi_j > 0$ indicates an unstable tangent direction.
- $\chi_j < 0$ indicates a stable tangent direction.
- $\chi_j = 0$ indicates a neutral tangent direction.

For an autonomous flow, the vector field itself furnishes a neutral direction,
because perturbations tangent to the trajectory correspond to a time shift:

```{math}
:label: eq:chapter7-neutral-direction

\xi(t) = f(x(t))
\quad \Longrightarrow \quad
\ddf{\xi}{t} = Df(x(t))\xi(t).
```

Thus smooth autonomous systems typically have at least one zero Lyapunov
exponent associated with motion along the orbit.

## Worked Example: A Diagonal LTV System

Consider the diagonal tangent system

```{math}
:label: eq:chapter7-diagonal-system

\ddf{\xi}{t}
=
\begin{bmatrix}
a_1(t) & 0 \\
0 & a_2(t)
\end{bmatrix}
\xi,
\qquad
\xi(t) =
\begin{bmatrix}
\xi_1(t) \\
\xi_2(t)
\end{bmatrix}.
```

Because the system is diagonal, the components decouple:

```{math}
:label: eq:chapter7-diagonal-solutions

\xi_1(t)
=
\exp\!\left(\int_{t_0}^{t} a_1(\tau)\,d\tau\right)\xi_1(t_0),
\qquad
\xi_2(t)
=
\exp\!\left(\int_{t_0}^{t} a_2(\tau)\,d\tau\right)\xi_2(t_0).
```

Hence

```{math}
:label: eq:chapter7-diagonal-propagator

\Phi(t,t_0)
=
\mathrm{diag}\!\left(
\exp\!\left(\int_{t_0}^{t} a_1(\tau)\,d\tau\right),
\exp\!\left(\int_{t_0}^{t} a_2(\tau)\,d\tau\right)
\right).
```

Since the propagator is diagonal with positive entries, its singular values are
those diagonal entries arranged in descending order. The finite-time exponents
are therefore

```{math}
:label: eq:chapter7-diagonal-ftle

\chi_1^{(T)}(t_0)
=
\max\!\left\{
\frac{1}{T}\int_{t_0}^{t_0+T} a_1(\tau)\,d\tau,
\frac{1}{T}\int_{t_0}^{t_0+T} a_2(\tau)\,d\tau
\right\},
```

```{math}
:label: eq:chapter7-diagonal-ftle-2

\chi_2^{(T)}(t_0)
=
\min\!\left\{
\frac{1}{T}\int_{t_0}^{t_0+T} a_1(\tau)\,d\tau,
\frac{1}{T}\int_{t_0}^{t_0+T} a_2(\tau)\,d\tau
\right\}.
```

If the time averages converge,

```{math}
:label: eq:chapter7-diagonal-asymptotic

\bar{a}_j
=
\lim_{T\to\infty}\frac{1}{T}\int_{t_0}^{t_0+T} a_j(\tau)\,d\tau,
```

then the Lyapunov exponents are simply
$\chi_j = \bar{a}_j$, ordered from largest to smallest.

For example, with

```{math}
:label: eq:chapter7-example-coefficients

a_1(t) = \alpha + \varepsilon \sin t,
\qquad
a_2(t) = -\beta,
\qquad
\alpha,\beta > 0,
```

one obtains

```{math}
:label: eq:chapter7-example-averages

\chi_1 = \alpha,
\qquad
\chi_2 = -\beta,
```

because the oscillatory term averages to zero. The first coordinate axis is
unstable, the second is stable, and there is no neutral direction in this
non-autonomous linear example. This calculation is simple, but it already shows
that Lyapunov exponents depend on long-time averages of the propagator rather
than on a snapshot of the coefficient matrix.

In this diagonal example, singular vectors, Gram-Schmidt vectors, and CLVs all
coincide with the coordinate axes. That coincidence is special. It occurs here
because the propagator never mixes the two tangent directions.

## QR-Based Computation of Lyapunov Exponents

Directly multiplying propagators over long times is numerically unstable,
because the most unstable direction overwhelms all others. The standard remedy
is periodic orthonormalization. Suppose the interval is partitioned by times
$t_0 < t_1 < \cdots < t_m$, and let

```{math}
:label: eq:chapter7-step-propagators

F_k = \Phi(t_{k+1},t_k).
```

Given an orthonormal basis $Q_k$, compute the thin QR factorization

```{math}
:label: eq:chapter7-qr-step

F_k Q_k = Q_{k+1} R_k,
```

where $Q_{k+1}^*Q_{k+1}=I$ and $R_k$ is upper triangular with positive diagonal
entries. The Lyapunov exponents are approximated by time averages of the
logarithms of those diagonal entries:

```{math}
:label: eq:chapter7-qr-le

\chi_j
\approx
\frac{1}{t_m-t_0}
\sum_{k=0}^{m-1}\log (R_k)_{jj}.
```

This algorithm computes growth rates attached to an orthonormalized basis, not
yet the covariant directions themselves. The columns of $Q_k$ are often called
backward Lyapunov vectors or Gram-Schmidt vectors because they are selected by
growth from the past under forward integration.

## Forward, Backward, and Covariant Vectors

Three different kinds of tangent directions are commonly discussed:

- Right and left singular vectors of a finite-time propagator describe optimal
  growth over a chosen interval and are orthonormal at the beginning and end of
  that interval.
- Backward Lyapunov vectors are the orthonormal Gram-Schmidt directions
  produced by forward QR iteration; they reflect how growth from the past is
  filtered through orthonormalization.
- Forward Lyapunov vectors are obtained by reversing the viewpoint in time and
  describe directions selected by contraction from the future.

CLVs are different from all three. For a simple exponent $\chi_j$, the
$j$-th CLV $\ell_j(t)$ is a nonzero tangent vector satisfying the covariance
property

```{math}
:label: eq:chapter7-clv-covariance

\Phi(t_2,t_1)\ell_j(t_1)
=
\gamma_j(t_2,t_1)\ell_j(t_2),
```

for some nonzero scalar factor $\gamma_j(t_2,t_1)$. A CLV is therefore mapped
into the corresponding CLV at the later time by the true dynamics, without
reorthogonalization. This is the defining distinction from Gram-Schmidt
vectors.

For simple spectra, the CLV can be characterized as the intersection of a
backward and a forward flag:

```{math}
:label: eq:chapter7-clv-intersection

\mathrm{span}\{\ell_j(t)\}
=
\mathcal{S}_j^-(t)\cap \mathcal{S}_j^+(t),
```

where $\mathcal{S}_j^-(t)$ is built from backward vectors up to index $j$, and
$\mathcal{S}_j^+(t)$ is built from forward vectors from index $j$ onward. In
practice, CLV algorithms combine a forward QR sweep with a backward triangular
recursion to recover these intersections.

## Oseledets Splitting and Tangent Directions

Oseledets' theorem provides an invariant decomposition of tangent space into
subspaces associated with distinct Lyapunov exponents. Let
$\mathcal{F}^\tau$ denote the nonlinear flow map generated by
{eq}`eq:chapter7-nonlinear-system`. When the exponents are simple, one obtains
one-dimensional covariant subspaces
$E_j(x(t)) = \mathrm{span}\{\ell_j(t)\}$ and a direct sum

```{math}
:label: eq:chapter7-oseledets-splitting

T_{x(t)}\mathcal{M}
=
E_1(x(t)) \oplus \cdots \oplus E_r(x(t)),
```

with the invariance property

```{math}
:label: eq:chapter7-oseledets-invariance

D\mathcal{F}^\tau_{x(t)} E_j(x(t))
=
E_j(\mathcal{F}^\tau(x(t))).
```

These subspaces separate perturbations by long-time growth rate. Summing the
subspaces with positive exponents gives the unstable tangent bundle, summing
those with negative exponents gives the stable tangent bundle, and zero
exponents define the neutral bundle.

This is the natural trajectory-dependent analogue of an eigenbasis for a fixed
linear system. The crucial difference is that the basis changes along the
trajectory and is defined through asymptotic propagation rather than a single
matrix eigenproblem.

```{note}
The syllabus map mentions Lorenz-style numerical exploration as a possible
extension. That is useful for computation and visualization, but it is not
required for the present implementation scope. The essential theory already
appears in the tangent-system and diagonal-LTV constructions above.
```

## Summary

Lyapunov exponents quantify average exponential growth rates of tangent
perturbations, while CLVs identify the covariant directions carrying those
rates along a trajectory. Finite-time singular vectors answer an optimization
question over a selected interval, Gram-Schmidt vectors arise from stable
numerical orthonormalization, and CLVs recover the invariant tangent geometry
that persists under the true dynamics. For nonlinear systems with
trajectory-dependent instability, that distinction is the central modal idea.
