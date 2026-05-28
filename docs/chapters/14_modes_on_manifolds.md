# Modes on Manifolds

Many state spaces are not naturally Euclidean. A phase variable lives on the
circle $S^1$, an attitude lives on the rotation group $SO(3)$, and a rigid
body pose lives on $SE(3)$. In such cases the state does not evolve in a
single vector space $\mathbb{R}^n$, so some standard modal operations lose
their global meaning. In particular, adding states, subtracting distant
states, and forming global linear superpositions depend on a coordinate choice
or an ambient embedding.

This chapter keeps the viewpoint deliberately local. The main question is not
whether modal ideas disappear on a manifold $\mathcal{M}$, but where they
live. The short answer is that they live in tangent spaces, local coordinate
charts, or Lie algebra coordinates, and their interpretation is only locally
coordinate independent.

## State Spaces Beyond Euclidean Space

Consider a smooth autonomous system

```{math}
\ddf{x}{t} = f(x),
\qquad
x(t) \in \mathcal{M},
```

where $\mathcal{M}$ is a manifold. Typical examples are:

- $S^1$ for a phase angle;
- $S^2$ for a unit direction vector;
- $SO(3)$ for rigid-body orientation;
- $SE(3)$ for rigid-body position and orientation together.

The vector field $f(x)$ is not another point on $\mathcal{M}$. Instead,
$f(x)$ belongs to the tangent space $T_x\mathcal{M}$ attached to the current
state. This already marks a difference from Euclidean modal analysis: the
velocity at two different points belongs to two different vector spaces.

For that reason, a manifold-valued system does not usually admit one global
set of fixed modal directions in the same sense as a linear system on
$\mathbb{R}^n$. Modal ideas become local statements about nearby perturbations
or about coordinates chosen relative to a reference point or trajectory.

## Tangent Spaces and Local Modal Directions

At each $x \in \mathcal{M}$, the tangent space $T_x\mathcal{M}$ is an ordinary
vector space. Local modal analysis therefore begins by moving from the manifold
itself to a tangent description near a reference state.

Suppose $x_\ast \in \mathcal{M}$ is an equilibrium, so $f(x_\ast)=0$. Choose a
local coordinate chart $\chi$ with $\chi(x_\ast)=0$, and write
$\xi=\chi(x)\in\mathbb{R}^n$. In these coordinates the dynamics take the form

```{math}
:label: eq:chapter14-local-linearization

\dot{\xi} = A \xi + \mathcal{O}(\|\xi\|^2),
```

where $A$ is the Jacobian of the coordinate representation at the equilibrium.
The eigenvalues of $A$ give the local growth, decay, and oscillation rates,
while its eigenvectors describe tangent-space modal directions. Thus the modal
objects are attached to $T_{x_\ast}\mathcal{M}$, not to the full manifold as a
global linear subspace.

Along a non-equilibrium trajectory $x(t)$, the same idea leads to a tangent
linear system, but now the perturbation lives in the moving tangent space
$T_{x(t)}\mathcal{M}$. Comparing modal directions at different times then
requires additional geometric structure to transport vectors between tangent
spaces, so a single fixed Euclidean basis is generally unavailable.

## Exponential and Logarithm Maps

The exponential and logarithm maps provide a standard way to move between a
manifold and a tangent space near a reference point. For a base point
$x_\ast\in\mathcal{M}$, the exponential map sends a tangent vector
$\xi\in T_{x_\ast}\mathcal{M}$ to a nearby point on the manifold,

```{math}
x = \exp_{x_\ast}(\xi),
```

while the logarithm map reverses that relation locally,

```{math}
\xi = \log_{x_\ast}(x).
```

These maps replace the Euclidean idea that one may write $x=x_\ast+\xi$
globally. Near $x_\ast$, one may analyze the dynamics in the tangent
coordinates $\xi$, compute local modes there, and then interpret the result on
the manifold through $\exp_{x_\ast}$.

For matrix Lie groups such as $SO(3)$ or $SE(3)$, the same idea is often
written with Lie algebra coordinates,

```{math}
x = x_\ast \exp(\xi),
\qquad
\xi \in \mathfrak{g},
```

where $\mathfrak{g}$ is the Lie algebra. Modal directions are then described
in the linear space $\mathfrak{g}$ rather than directly in the curved group.
This is useful, but still local: large excursions can cross chart boundaries,
encounter branch ambiguities in the logarithm, or make one tangent-space
description inadequate.

The geometric distinction is easiest to see on $S^1$. In the next explorer, the
gray chord is the ambient Euclidean difference between two points on the circle,
while the orange vector is the wrapped logarithm map in the tangent space at the
chosen base point. The midpoint marker shows how an ambient average can leave
the manifold.

:::{course-interactive}
:data-example: chapter14-tangent-versus-ambient

Interactive example loading...
:::

## Coordinate Dependence of Euclidean Modal Analysis

A local linearization such as {eq}`eq:chapter14-local-linearization` is
intrinsic at the level of eigenvalues, but its coordinate representation is
not. If one changes local coordinates from $\xi$ to $\eta$, then the Jacobian
matrix changes accordingly. At linear order this acts like a similarity
transformation, so the spectrum is preserved, but the coordinate components of
the modes change with the chosen chart.

This matters because Euclidean modal workflows often assume that snapshot
differences and linear combinations have an immediate state-space meaning. On a
manifold, that assumption is only justified after choosing coordinates,
an embedding, or a base point. Different choices can produce different mode
shapes even when they describe the same underlying dynamics.

The practical lesson is modest but important: for manifold-valued dynamics,
modal analysis should be interpreted as a statement about a representation of
the dynamics, not automatically as a coordinate-free global decomposition of
the state space.

## Caveats for POD and DMD on Manifolds

The same caution applies to data-driven methods such as POD and DMD. Standard
versions of those methods assume snapshots live in a vector space, so that one
can form means, residuals, covariance matrices, and least-squares linear fits
by ordinary addition and subtraction.

If the snapshots lie on a manifold, several caveats appear:

- an ambient-space average need not remain on the manifold;
- a straight Euclidean difference between two points may not represent the
  intrinsic displacement along $\mathcal{M}$;
- the result can depend strongly on the chosen coordinates or embedding;
- one tangent space may be accurate for tightly clustered data but poor for
  data spread over a large curved region.

One common workaround is to choose a reference point $\bar{x}$, map snapshots
$x_k$ into tangent coordinates $\mathbf{\xi}_k=\log_{\bar{x}}(x_k)$, and then
apply Euclidean POD or DMD to the tangent-space data. This can be useful, but
it does not remove all geometry. The outcome depends on the reference point,
the locality of the logarithm map, and how well one tangent space represents
the dataset. For broad or topologically nontrivial motion, no single tangent
space can capture the full geometry faithfully.

## Worked Example: Dynamics on $S^1$

The circle $S^1$ is the simplest manifold-valued state space. Let the state be
an angle $\theta(t)$ defined modulo $2\pi$, and consider

```{math}
:label: eq:chapter14-circle-system

\ddf{\theta}{t} = -\sin \theta.
```

This is a well-defined dynamical system on $S^1$ because the right-hand side is
$2\pi$-periodic. The equilibria satisfy $\sin \theta_\ast=0$, so

```{math}
\theta_\ast = 0 \quad \text{or} \quad \theta_\ast = \pi
\qquad
(\mathrm{mod}\ 2\pi).
```

To linearize near an equilibrium, introduce a local tangent coordinate
$\eta=\log_{\theta_\ast}(\theta)$. On $S^1$, this is just the wrapped angular
difference from $\theta_\ast$. Locally one may write $\theta=\theta_\ast+\eta$,
so

```{math}
\dot{\eta}
=
-\sin(\theta_\ast+\eta)
=
-\sin\theta_\ast - \cos\theta_\ast\,\eta + \mathcal{O}(\eta^2).
```

Because $\sin\theta_\ast=0$ at an equilibrium, the tangent dynamics reduce to

```{math}
:label: eq:chapter14-circle-linearization

\dot{\eta} = -\cos\theta_\ast\,\eta + \mathcal{O}(\eta^2).
```

Hence:

- at $\theta_\ast=0$, one has $\dot{\eta}=-\eta+\mathcal{O}(\eta^2)$, so the
  equilibrium is locally stable;
- at $\theta_\ast=\pi$, one has $\dot{\eta}=+\eta+\mathcal{O}(\eta^2)$, so the
  equilibrium is locally unstable.

The tangent space of $S^1$ is one-dimensional, so there is only one local
modal direction at each equilibrium: the direction tangent to the circle. The
modal information is therefore not a nontrivial shape vector but the local
growth or decay rate in that tangent coordinate.

The exponential and logarithm maps are especially simple here:

```{math}
\exp_{\theta_\ast}(\eta) = \theta_\ast + \eta \pmod{2\pi},
\qquad
\log_{\theta_\ast}(\theta) = \text{wrapped angle difference}.
```

This example shows both the value and the limit of Euclidean intuition. Near an
equilibrium, the dynamics look exactly like a scalar linear system in the
tangent coordinate $\eta$. Globally, however, the state is periodic, the angle
is only defined modulo $2\pi$, and there is no single Euclidean coordinate that
represents the manifold without singular or redundant choices.

The next explorer keeps that worked example on $S^1$ and compares the nonlinear
circle trajectory with the local tangent linearization about either
$\theta_\ast = 0$ or $\theta_\ast = \pi$.

:::{course-interactive}
:data-example: chapter14-circle-tangent-dynamics

Interactive example loading...
:::

## Summary

- Modal ideas on manifolds are usually local and live in tangent spaces or Lie
  algebra coordinates.
- Linearization remains meaningful, but it is attached to a reference point or
  trajectory rather than to one global vector space.
- Euclidean modal decompositions can depend on the chosen coordinates,
  embedding, or base point.
- Tangent-space POD or DMD can be useful local approximations, but they should
  not be mistaken for a geometry-free global theory.
