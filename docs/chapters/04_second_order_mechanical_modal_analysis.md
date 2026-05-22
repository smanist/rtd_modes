# Second-Order Mechanical Modal Analysis

Many vibrating structures are modeled more naturally in second-order form than
in first-order state space. The matrices $M$, $C$, and $K$ encode inertia,
damping, and stiffness directly, and the modal structure of the system is often
visible before any state augmentation is introduced. This chapter develops the
classical modal analysis of
$M \ddot{q} + C \dot{q} + K q = f$ and uses a hand-derivable
two-degree-of-freedom system to connect the theory to explicit calculations.

## Mechanical Second-Order Form

Let $q(t) \in \mathbb{R}^n$ denote the vector of generalized displacements.
The forced linear mechanical model is

```{math}
:label: eq:chapter4-second-order-system

M \ddot{q}(t) + C \dot{q}(t) + K q(t) = f(t),
```

where $M \in \mathbb{R}^{n \times n}$ is the mass matrix,
$C \in \mathbb{R}^{n \times n}$ is the damping matrix,
$K \in \mathbb{R}^{n \times n}$ is the stiffness matrix, and
$f(t) \in \mathbb{R}^n$ is the applied force. In structural vibration,
$M$ is typically symmetric positive definite and $K$ is symmetric positive
semidefinite or positive definite after rigid-body constraints have been
removed.

The second-order form separates physical effects cleanly:

- $M$ determines how accelerations are penalized;
- $K$ determines elastic restoring forces;
- $C$ determines how velocity-dependent dissipation enters the dynamics.

One can rewrite {eq}`eq:chapter4-second-order-system` as a first-order system
in the state $x = (q, \dot{q})^\top$, but doing so hides the mechanical
structure that makes modal analysis especially transparent.

## Undamped Modes and the Generalized Eigenvalue Problem

Set $C = 0$ and $f = 0$. Seeking harmonic solutions of the form
$q(t) = \phi e^{i \omega t}$ gives

```{math}
:label: eq:chapter4-generalized-eigenproblem

K \phi = \omega^2 M \phi.
```

This is a generalized eigenvalue problem. The eigenvector $\phi_j$ is a mode
shape, and the eigenvalue $\omega_j^2$ gives the squared natural frequency.
For symmetric $M$ and $K$, distinct modes are orthogonal with respect to the
$M$ inner product and also with respect to the $K$ bilinear form. To see this,
suppose

```{math}

K \phi_i = \omega_i^2 M \phi_i,
\qquad
K \phi_j = \omega_j^2 M \phi_j.
```

Left-multiply the second relation by $\phi_i^\top$ and use symmetry:

```{math}
:label: eq:chapter4-orthogonality-identity

\phi_i^\top K \phi_j
= \omega_j^2 \phi_i^\top M \phi_j
= \phi_j^\top K \phi_i
= \omega_i^2 \phi_i^\top M \phi_j.
```

If $\omega_i^2 \neq \omega_j^2$, then

```{math}
:label: eq:chapter4-mass-orthogonality

\phi_i^\top M \phi_j = 0,
\qquad
\phi_i^\top K \phi_j = 0.
```

The modes can therefore be chosen to be mass normalized:

```{math}
:label: eq:chapter4-mass-normalization

\phi_j^\top M \phi_j = 1.
```

Collecting the mass-normalized modes into
$\Phi = [\phi_1 \ \phi_2 \ \cdots \ \phi_n]$, one obtains

```{math}
:label: eq:chapter4-modal-diagonalization

\Phi^\top M \Phi = I,
\qquad
\Phi^\top K \Phi = \Omega^2,
\qquad
\Omega^2 = \mathrm{diag}(\omega_1^2,\dots,\omega_n^2).
```

The second identity shows that the undamped stiffness couples only through the
modal frequencies when the coordinates are expressed in the modal basis.

## Worked Example: A Two-Degree-of-Freedom Mass-Spring System

Consider two equal masses $m$ connected to ground by springs of stiffness $k$
and coupled by a spring of stiffness $k_c$. Let
$q(t) = (q_1(t), q_2(t))^\top$. Then

```{math}
:label: eq:chapter4-2dof-matrices

M =
\begin{bmatrix}
m & 0 \\
0 & m
\end{bmatrix},
\qquad
K =
\begin{bmatrix}
k + k_c & -k_c \\
-k_c & k + k_c
\end{bmatrix}.
```

The generalized eigenproblem {eq}`eq:chapter4-generalized-eigenproblem`
becomes

```{math}

\begin{bmatrix}
k + k_c & -k_c \\
-k_c & k + k_c
\end{bmatrix}
\phi
=
\omega^2
\begin{bmatrix}
m & 0 \\
0 & m
\end{bmatrix}
\phi.
```

Two mode shapes are immediate:

```{math}
:label: eq:chapter4-example-unnormalized-modes

\phi_1^{\ast} =
\begin{bmatrix}
1 \\
1
\end{bmatrix},
\qquad
\phi_2^{\ast} =
\begin{bmatrix}
1 \\
-1
\end{bmatrix}.
```

The first is the in-phase mode and the second is the out-of-phase mode. The
corresponding natural frequencies satisfy

```{math}
:label: eq:chapter4-example-frequencies

\omega_1^2 = \frac{k}{m},
\qquad
\omega_2^2 = \frac{k + 2 k_c}{m}.
```

Mass normalization gives

```{math}
:label: eq:chapter4-example-normalized-modes

\phi_1 =
\frac{1}{\sqrt{2m}}
\begin{bmatrix}
1 \\
1
\end{bmatrix},
\qquad
\phi_2 =
\frac{1}{\sqrt{2m}}
\begin{bmatrix}
1 \\
-1
\end{bmatrix},
```

so that $\Phi^\top M \Phi = I$ and
$\Phi^\top K \Phi = \mathrm{diag}(\omega_1^2,\omega_2^2)$.

The example already shows why modal coordinates are useful. The symmetric and
antisymmetric deformation patterns are dynamically independent in the undamped
system even though the physical coordinates $q_1$ and $q_2$ are coupled.

## Modal Coordinates for Undamped Forced Motion

Expand the displacement in modal form,

```{math}
:label: eq:chapter4-modal-expansion

q(t) = \Phi \eta(t),
```

where $\eta(t) = (\eta_1(t),\dots,\eta_n(t))^\top$ contains the modal
coordinates. Substituting into {eq}`eq:chapter4-second-order-system` with
$C = 0$ and left-multiplying by $\Phi^\top$ yields

```{math}
:label: eq:chapter4-undamped-modal-system

\ddot{\eta}(t) + \Omega^2 \eta(t) = \Phi^\top f(t).
```

The system has decoupled into $n$ scalar oscillators,

```{math}
:label: eq:chapter4-undamped-modal-scalar

\ddot{\eta}_j(t) + \omega_j^2 \eta_j(t) = \phi_j^\top f(t).
```

For the two-degree-of-freedom example,

```{math}
:label: eq:chapter4-example-modal-coordinates

\eta_1 = \phi_1^\top M q
= \sqrt{\frac{m}{2}} (q_1 + q_2),
\qquad
\eta_2 = \phi_2^\top M q
= \sqrt{\frac{m}{2}} (q_1 - q_2).
```

These coordinates separate the symmetric and antisymmetric content of the
motion. If the forcing is symmetric,
$f(t) = b_{\mathrm{s}} u(t)$ with
$b_{\mathrm{s}} = (1,1)^\top$, then
$\phi_2^\top b_{\mathrm{s}} = 0$, so the antisymmetric mode is not excited. If
the forcing is antisymmetric,
$f(t) = b_{\mathrm{a}} u(t)$ with
$b_{\mathrm{a}} = (1,-1)^\top$, then
$\phi_1^\top b_{\mathrm{a}} = 0$, so only the second mode participates.

## Proportional Damping and Modal Decoupling

The most convenient damped case is proportional damping, often written as

```{math}
:label: eq:chapter4-rayleigh-damping

C = \alpha M + \beta K,
```

with scalar coefficients $\alpha,\beta \ge 0$. Because the same modal basis
diagonalizes $M$ and $K$, it also diagonalizes $C$:

```{math}
:label: eq:chapter4-modal-damping-matrix

\Phi^\top C \Phi
= \alpha I + \beta \Omega^2
= \mathrm{diag}(c_1,\dots,c_n),
\qquad
c_j = \alpha + \beta \omega_j^2.
```

The modal equations remain decoupled,

```{math}
:label: eq:chapter4-proportionally-damped-modes

\ddot{\eta}_j + c_j \dot{\eta}_j + \omega_j^2 \eta_j = \phi_j^\top f(t).
```

Writing $c_j = 2 \zeta_j \omega_j$ gives the familiar damping ratio

```{math}
:label: eq:chapter4-damping-ratio

\zeta_j = \frac{\alpha + \beta \omega_j^2}{2 \omega_j}.
```

For the two-degree-of-freedom system, the undamped mode shapes remain valid
under proportional damping. The damping changes the decay rate and resonance
width of each mode, but not the real modal basis itself.

More generally, modal decoupling occurs whenever $\Phi^\top C \Phi$ is
diagonal. Rayleigh damping is a convenient sufficient condition, not the only
one.

## Non-Proportional Damping and Complex Modes

If $C$ is not diagonal in the undamped modal basis, the scalar modal equations
couple through damping. In that case there is generally no real matrix $\Phi$
that simultaneously diagonalizes $M$, $C$, and $K$. The appropriate spectral
problem becomes the quadratic eigenvalue problem

```{math}
:label: eq:chapter4-quadratic-eigenproblem

(\lambda^2 M + \lambda C + K)\phi = 0.
```

Each eigenpair $(\lambda_j,\phi_j)$ defines a complex mode. Equivalently, one
may introduce the state
$x = (q,\dot{q})^\top$ and write

```{math}
:label: eq:chapter4-state-space-mechanical

\dot{x} = A x + B f,
\qquad
A =
\begin{bmatrix}
0 & I \\
-M^{-1} K & -M^{-1} C
\end{bmatrix},
\qquad
B =
\begin{bmatrix}
0 \\
M^{-1}
\end{bmatrix}.
```

The eigenvalues of $A$ occur in complex conjugate pairs for real mechanical
systems. The associated mode shapes carry relative phase information between
coordinates, not just relative amplitudes. For this reason, a non-proportionally
damped structure can display motion in which different components of $q(t)$ are
not exactly in phase or exactly out of phase even near a single resonance.

The price of generality is that orthogonality is no longer expressed by the
simple relations in {eq}`eq:chapter4-mass-orthogonality`. One instead works
with right and left eigenvectors of a linearized first-order system, or with
specialized biorthogonality relations for the quadratic pencil.

## Frequency Response Functions and Modal Participation

For harmonic forcing
$f(t) = \Re(\hat{f} e^{i \omega t})$, seek a steady response of the form
$q(t) = \Re(\hat{q} e^{i \omega t})$. Substituting into
{eq}`eq:chapter4-second-order-system` gives

```{math}
:label: eq:chapter4-frf-definition

\hat{q} = H(i \omega) \hat{f},
\qquad
H(i \omega)
=
\left(
-\omega^2 M + i \omega C + K
\right)^{-1}.
```

The matrix $H(i \omega)$ is the receptance frequency response function. It
maps force amplitudes to displacement amplitudes at frequency $\omega$.

Under proportional damping and mass normalization, the modal expansion is

```{math}
:label: eq:chapter4-modal-frf

H(i \omega)
=
\sum_{j=1}^n
\frac{\phi_j \phi_j^\top}
{\omega_j^2 - \omega^2 + i \omega c_j}.
```

This expression makes resonance structure explicit: the denominator for each
mode becomes small when $\omega$ approaches $\omega_j$ and damping is weak.

If the forcing has a fixed spatial pattern $b$ so that $f(t) = b u(t)$, then
the scalar quantity

```{math}
:label: eq:chapter4-participation-factor

\Gamma_j = \phi_j^\top b
```

is the modal participation factor for that input direction in mass-normalized
coordinates. In the two-degree-of-freedom example,

```{math}

\Gamma_1(b_{\mathrm{s}}) = \sqrt{\frac{2}{m}},
\qquad
\Gamma_2(b_{\mathrm{s}}) = 0,
\qquad
\Gamma_1(b_{\mathrm{a}}) = 0,
\qquad
\Gamma_2(b_{\mathrm{a}}) = \sqrt{\frac{2}{m}}.
```

The symmetric input excites only the symmetric mode, and the antisymmetric
input excites only the antisymmetric mode. Modal participation is therefore not
just a property of the structure; it depends on how the structure is forced and
measured.

## Modal Truncation and Its Limits

A reduced model retains only the first $r$ modes:

```{math}
:label: eq:chapter4-modal-truncation

q(t) \approx \Phi_r a(t),
\qquad
\Phi_r = [\phi_1 \ \cdots \ \phi_r].
```

For proportionally damped systems, the retained modal coordinates satisfy

```{math}
:label: eq:chapter4-reduced-modal-system

\ddot{a} + C_r \dot{a} + \Omega_r^2 a = \Phi_r^\top f,
```

where $C_r = \Phi_r^\top C \Phi_r$ and
$\Omega_r^2 = \mathrm{diag}(\omega_1^2,\dots,\omega_r^2)$.

Modal truncation is effective when omitted modes are weakly excited over the
frequency band of interest and when the measured outputs depend mostly on the
retained deformation patterns. It has clear limits:

- forcing near an omitted resonance can invalidate the reduced model;
- localized forcing or sensing can depend strongly on higher modes even when
  low modes dominate global displacement;
- truncated modal sums underestimate static compliance unless residual
  flexibility from omitted modes is accounted for.

The two-degree-of-freedom example makes the last two points concrete. If one
keeps only $\phi_1$, then a symmetric forcing direction is represented well
near $\omega_1$, but an antisymmetric forcing direction produces
$\Phi_1^\top b_{\mathrm{a}} = 0$, so the one-mode model predicts no response at
all even though the full system has a clear resonance at $\omega_2$. A reduced
model can therefore fail because of mode selection, not because the retained
mode is computed inaccurately.

For undamped mass-normalized modes, the static flexibility satisfies

```{math}
:label: eq:chapter4-static-flexibility

K^{-1}
=
\sum_{j=1}^n \frac{\phi_j \phi_j^\top}{\omega_j^2},
```

so truncating the modal sum also truncates the quasi-static deformation
contributed by higher modes. This is one reason structural reduced-order models
often augment low-frequency modal truncation with residual flexibility or other
correction terms when forced response accuracy matters.
