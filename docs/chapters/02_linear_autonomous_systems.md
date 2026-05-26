# Linear Autonomous Systems

Linear autonomous systems are the classical setting in which modal analysis is
most explicit. The dynamics are governed by a fixed linear operator, so the
questions of growth, decay, oscillation, and state reconstruction can be tied
directly to eigenvalues and eigenvectors. This chapter develops that connection
for both continuous-time and discrete-time systems, then uses a hand-derivable
two-degree-of-freedom oscillator to make the modal picture concrete.

## Continuous-Time and Discrete-Time Models

An autonomous continuous-time linear system has the form

```{math}
:label: eq:chapter2-continuous-time

\ddf{x}{t} = Ax,
\qquad
x(t) \in \mathbb{R}^n.
```

Its solution is determined by the matrix exponential,

```{math}
:label: eq:chapter2-matrix-exponential

x(t) = e^{A(t-t_0)}x(t_0),
\qquad
e^{At} = \sum_{m=0}^{\infty}\frac{t^m}{m!}A^m.
```

An autonomous discrete-time linear system has the form

```{math}
:label: eq:chapter2-discrete-time

x_{k+1} = A_{\mathrm{d}} x_k,
\qquad
x_k \in \mathbb{R}^n.
```

Its solution is obtained by repeated multiplication,

```{math}
:label: eq:chapter2-discrete-solution

x_k = A_{\mathrm{d}}^k x_0.
```

The adjective *autonomous* means that the evolution law does not depend
explicitly on time or on an external input. Once the initial condition is
given, the trajectory is completely determined by $A$ or $A_{\mathrm{d}}$.

## Right and Left Eigenvectors

For the continuous-time matrix $A$, a right eigenvector $\phi_j$ and eigenvalue
$\lambda_j$ satisfy

```{math}
:label: eq:chapter2-right-eigenvector

A\phi_j = \lambda_j \phi_j.
```

A left eigenvector $\psi_j$ satisfies

```{math}
:label: eq:chapter2-left-eigenvector

\psi_j^* A = \lambda_j \psi_j^*,
```

where $^*$ denotes conjugate transpose. The left eigenvectors are therefore
right eigenvectors of $A^*$, and they supply the projections needed to recover
modal coordinates from the state.

If $A$ is diagonalizable, its right eigenvectors can be assembled into the modal
basis matrix

```{math}
:label: eq:chapter2-modal-basis

V =
\begin{bmatrix}
\phi_1 & \phi_2 & \cdots & \phi_n
\end{bmatrix},
\qquad
AV = V\Lambda,
```

with diagonal eigenvalue matrix

```{math}
:label: eq:chapter2-eigenvalue-diagonal

\Lambda = \mathrm{diag}(\lambda_1,\lambda_2,\ldots,\lambda_n).
```

If the left eigenvectors are collected as columns of
$W = [\psi_1,\psi_2,\ldots,\psi_n]$, one can normalize them so that

```{math}
:label: eq:chapter2-biorthogonality

W^*V = I.
```

This biorthogonality relation is the natural replacement for orthogonality in a
non-normal system. It implies that the modal coordinates are

```{math}
:label: eq:chapter2-modal-coordinates

\eta(t) = W^*x(t),
\qquad
x(t) = V\eta(t).
```

Each scalar component $\eta_j(t) = \psi_j^*x(t)$ measures the amplitude of the
$j$-th right eigenvector in the state expansion.

## Modal Expansion and State Reconstruction

When $A$ is diagonalizable, substituting $x(t)=V\eta(t)$ into
{eq}`eq:chapter2-continuous-time` yields the decoupled modal system

```{math}
:label: eq:chapter2-decoupled-modal-system

\ddf{\eta}{t} = \Lambda \eta.
```

Thus each modal coordinate evolves independently:

```{math}
:label: eq:chapter2-modal-coordinate-evolution

\eta_j(t) = e^{\lambda_j (t-t_0)}\eta_j(t_0).
```

Reconstructing the state gives the classical modal expansion

```{math}
:label: eq:chapter2-modal-expansion

x(t)
= \sum_{j=1}^n e^{\lambda_j (t-t_0)}
\phi_j \psi_j^* x(t_0).
```

The same idea applies to a diagonalizable discrete-time map
$A_{\mathrm{d}} = V\Lambda_{\mathrm{d}}W^*$, where
$\Lambda_{\mathrm{d}} = \mathrm{diag}(\mu_1,\ldots,\mu_n)$. Then

```{math}
:label: eq:chapter2-discrete-modal-expansion

x_k
= \sum_{j=1}^n \mu_j^k \phi_j \psi_j^* x_0,
\qquad
\eta_{j,k} = \mu_j^k \eta_{j,0}.
```

The eigenvalues determine the temporal law, while the eigenvectors determine
how that law is expressed in state space.

## Stability and the Meaning of Eigenvalues

For the continuous-time system $\dot{x}=Ax$, the real part of each eigenvalue
governs exponential growth or decay:

- If $\mathrm{Re}(\lambda_j) < 0$ for every $j$, the equilibrium $x=0$ is
  asymptotically stable.
- If any eigenvalue has $\mathrm{Re}(\lambda_j) > 0$, the equilibrium is
  unstable.
- If all eigenvalues satisfy $\mathrm{Re}(\lambda_j) \le 0$, then stability
  depends on the eigenstructure associated with the imaginary axis. Semisimple
  eigenvalues on the imaginary axis produce bounded oscillation, whereas Jordan
  blocks there produce polynomial growth.

For the discrete-time system $x_{k+1}=A_{\mathrm{d}}x_k$, the role of
$\mathrm{Re}(\lambda_j)$ is replaced by $|\mu_j|$:

- If $|\mu_j| < 1$ for every $j$, the origin is asymptotically stable.
- If any eigenvalue satisfies $|\mu_j| > 1$, the origin is unstable.
- If all eigenvalues satisfy $|\mu_j| \le 1$, then the behavior of eigenvalues
  on the unit circle again depends on whether the corresponding Jordan blocks
  are semisimple.

An eigenvalue is therefore not just a number. Its location and its algebraic
structure determine how perturbations evolve.

The phase portrait classes below connect those eigenvalue statements to actual
trajectories. The selected initial condition is highlighted, while the other
curves show how the same matrix organizes nearby states.

:::{course-interactive}
:data-example: chapter2-phase-portrait
Interactive example loading...
:::

## Diagonalization, Jordan Form, and Schur Form

Diagonalization is the simplest situation:

```{math}
:label: eq:chapter2-diagonalization

A = V\Lambda V^{-1}.
```

Then $e^{At} = Ve^{\Lambda t}V^{-1}$, and the dynamics separate exactly into
independent scalar exponentials. This is the ideal modal picture, but it is not
guaranteed.

If $A$ does not have a complete set of eigenvectors, it can still be written in
Jordan form,

```{math}
:label: eq:chapter2-jordan-form

A = VJV^{-1},
```

where $J$ is block diagonal with Jordan blocks
$J_r(\lambda) = \lambda I + N_r$, and $N_r$ is nilpotent. The exponential of a
Jordan block is

```{math}
:label: eq:chapter2-jordan-block-exponential

e^{J_r(\lambda)t}
= e^{\lambda t}
\left(
I + tN_r + \frac{t^2}{2!}N_r^2 + \cdots
+ \frac{t^{r-1}}{(r-1)!}N_r^{r-1}
\right).
```

The extra polynomial factors show why a repeated eigenvalue can lead to growth
even when $\mathrm{Re}(\lambda)=0$. In discrete time, the analogous powers of a
Jordan block generate terms proportional to $\mu^k$, $k\mu^k$, and higher-order
polynomials in $k$.

For analysis and computation, Schur form is often more robust than Jordan form.
Every complex matrix admits a unitary Schur factorization

```{math}
:label: eq:chapter2-complex-schur

A = QTQ^*,
```

where $Q$ is unitary and $T$ is upper triangular. The diagonal entries of $T$
are the eigenvalues of $A$. If $A$ is real, one may instead use the real Schur
form, in which $Q$ is orthogonal and $T$ is block upper triangular with $1
\times 1$ real blocks and $2 \times 2$ blocks for complex-conjugate pairs.

Jordan form exposes algebraic multiplicity and defectiveness exactly, but it is
highly sensitive to perturbation. Schur form is less explicit about individual
eigenvectors, yet it is much more stable numerically and still reveals
invariant subspaces.

## Real and Complex Modes

Even when $A$ is real, its eigenvectors need not be real. If
$\lambda = \alpha + i\beta$ is an eigenvalue of a real matrix, then
$\overline{\lambda} = \alpha - i\beta$ is also an eigenvalue, with conjugate
eigenvector $\overline{\phi}$. A real trajectory combines the pair:

```{math}
:label: eq:chapter2-real-from-complex-pair

x(t)
= c e^{(\alpha+i\beta)t}\phi
+ \overline{c}\, e^{(\alpha-i\beta)t}\overline{\phi}
= 2e^{\alpha t}\mathrm{Re}\!\left(c e^{i\beta t}\phi\right).
```

The real part $\alpha$ gives decay or growth, while $\beta$ gives oscillation.
Complex modes are therefore not a complication to be removed; they are the
natural representation of oscillatory dynamics. Real-valued coordinates can be
recovered by combining each conjugate pair into sine-cosine form or, in real
Schur form, into a two-dimensional invariant plane.

## Spectral Mapping Between Continuous and Discrete Time

Suppose the continuous-time system is sampled every $\Delta t > 0$. Then the
exact discrete-time map is

```{math}
:label: eq:chapter2-exact-sampled-map

x_{k+1} = e^{A\Delta t}x_k.
```

If $A\phi_j = \lambda_j \phi_j$, then the same eigenvector is an eigenvector of
$e^{A\Delta t}$ with eigenvalue

```{math}
:label: eq:chapter2-spectral-mapping

\mu_j = e^{\lambda_j \Delta t}.
```

This spectral mapping theorem connects the continuous and discrete viewpoints.
Stable continuous-time eigenvalues with $\mathrm{Re}(\lambda_j)<0$ map inside
the unit disk, imaginary-axis eigenvalues map to the unit circle, and unstable
eigenvalues map outside the unit disk.

The mapping also explains a limitation of sampled data: the inverse relation
$\lambda_j = \Delta t^{-1}\log(\mu_j)$ is not single valued because the complex
logarithm has multiple branches. Distinct continuous-time frequencies can
therefore appear identical after sampling if the sampling rate is too low.

## Multiplicity, Defectiveness, and Sensitivity

Repeated eigenvalues require care. A repeated eigenvalue may still be harmless
if its geometric multiplicity matches its algebraic multiplicity, so that a full
eigenbasis exists inside the repeated eigenspace. The more delicate case is a
defective eigenvalue, where the eigenspace is too small and generalized
eigenvectors are required.

Even when a repeated eigenvalue is diagonalizable, the associated eigenvectors
need not be well conditioned. Small perturbations can rotate them strongly or
split the repeated eigenvalue into a nearby cluster. A nearly defective matrix
may therefore have modal coordinates that are extremely sensitive to modeling
errors, parameter uncertainty, or roundoff. This is one reason to distinguish
between:

- the existence of an eigen-decomposition in exact algebra;
- the conditioning of that decomposition in finite precision; and
- the physical interpretability of the resulting modes.

Later chapters show that this sensitivity is closely tied to non-normality and
transient amplification. For now, the important point is that eigenvalues alone
do not guarantee a well-behaved modal basis.

## Worked Example: A 2-DOF Oscillator

Consider two equal unit masses connected by unit springs, with the outer ends
attached to fixed walls. Let $q(t) = [q_1(t), q_2(t)]^\top$ denote the
displacement vector. The undamped equations of motion are

```{math}
:label: eq:chapter2-2dof-second-order

M\ddot{q} + Kq = 0,
\qquad
M =
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix},
\qquad
K =
\begin{bmatrix}
2 & -1 \\
-1 & 2
\end{bmatrix}.
```

Seeking harmonic motion $q(t)=\widehat{q}e^{i\omega t}$ yields the generalized
eigenvalue problem

```{math}
:label: eq:chapter2-2dof-generalized-eigenproblem

K\widehat{q} = \omega^2 M\widehat{q}.
```

Because $M=I$, this reduces to an ordinary eigenvalue problem for $K$. The
eigenpairs are

```{math}
:label: eq:chapter2-2dof-eigenpairs

\omega_1^2 = 1,
\qquad
u_1 =
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\
1
\end{bmatrix},
\qquad
\omega_2^2 = 3,
\qquad
u_2 =
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\
-1
\end{bmatrix}.
```

The first mode moves the masses in phase, while the second mode moves them out
of phase. Expanding the displacement in modal coordinates,

```{math}
:label: eq:chapter2-2dof-modal-expansion

q(t) = \eta_1(t)u_1 + \eta_2(t)u_2,
```

and using the orthonormality of $u_1$ and $u_2$ gives two uncoupled scalar
oscillators:

```{math}
:label: eq:chapter2-2dof-decoupled

\ddot{\eta}_1 + \omega_1^2 \eta_1 = 0,
\qquad
\ddot{\eta}_2 + \omega_2^2 \eta_2 = 0.
```

Thus the displacement is reconstructed from two independent modal coordinates,
each with its own natural frequency.

To connect this example to first-order state-space form, define
$x(t) = [q_1, q_2, \dot{q}_1, \dot{q}_2]^\top$. Then

```{math}
:label: eq:chapter2-2dof-state-space

\ddf{x}{t}
=
\begin{bmatrix}
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1 \\
-2 & 1 & 0 & 0 \\
1 & -2 & 0 & 0
\end{bmatrix}
x
= Ax.
```

The eigenvalues of $A$ are

```{math}
:label: eq:chapter2-2dof-state-eigenvalues

\lambda_{1,2} = \pm i\omega_1 = \pm i,
\qquad
\lambda_{3,4} = \pm i\omega_2 = \pm i\sqrt{3}.
```

Each second-order vibration mode therefore becomes a complex-conjugate pair of
first-order state-space modes. Since the eigenvalues lie on the imaginary axis
and the system is diagonalizable, the motion is bounded and purely oscillatory.

The next interactive keeps the same two mode shapes $u_1$ and $u_2$, fixes the
initial modal velocities to zero, and lets you vary the initial modal
coordinates. This makes the projection $q(0)=\eta_1(0)u_1+\eta_2(0)u_2$
visible in both physical and modal coordinates.

:::{course-interactive}
:data-example: chapter2-modal-superposition
Interactive example loading...
:::

If the trajectories are sampled every $\Delta t$, the exact discrete-time
eigenvalues are

```{math}
:label: eq:chapter2-2dof-discrete-eigenvalues

\mu_{1,2} = e^{\pm i\Delta t},
\qquad
\mu_{3,4} = e^{\pm i\sqrt{3}\Delta t},
```

which lie on the unit circle, exactly as predicted by
{eq}`eq:chapter2-spectral-mapping`.

## Summary

Linear autonomous systems provide the cleanest setting for modal analysis.
Right eigenvectors describe modal directions, left eigenvectors recover modal
coordinates, and eigenvalues determine growth, decay, and oscillation. When a
system is diagonalizable, the state is reconstructed from independent modal
coordinates. When it is defective or nearly defective, Jordan structure and
conditioning matter, and Schur form becomes an important alternative viewpoint.

The two-degree-of-freedom oscillator shows how these ideas appear in a
hand-derivable model: modal coordinates decouple the dynamics, complex
state-space modes encode oscillation, and sampling maps imaginary-axis
eigenvalues to the unit circle in discrete time.
