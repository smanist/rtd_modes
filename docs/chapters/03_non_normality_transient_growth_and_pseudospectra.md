# Non-normality, Transient Growth, and Pseudospectra

Eigenvalues are a natural first summary of a linear system, but they do not
always determine the behavior that matters most in applications. When the
governing operator is non-normal, decaying eigenmodes can interfere
constructively, small perturbations can move eigenvalues substantially, and
harmonic forcing can be strongly amplified even though every eigenvalue lies in
the stable half-plane.

:::{course-interactive}
:data-example: chapter3-nonlinear-phase-plane
Interactive example loading...
:::


:::{course-interactive}
:data-example: chapter3-transient-energy
Interactive example loading...
:::


:::{course-interactive}
:data-example: chapter3-pseudospectrum
Interactive example loading...
:::


:::{course-interactive}
:data-example: chapter3-initial-gain
Interactive example loading...
:::


This chapter develops those ideas with a single hand-derivable example,

```{math}
:label: eq:chapter3-example-matrix

A =
\begin{bmatrix}
-1 & K \\
0 & -2
\end{bmatrix},
\qquad K > 0,
```

viewed in the continuous-time system

```{math}
:label: eq:chapter3-state-equation

\ddf{x}{t} = Ax,
\qquad x(t) \in \mathbb{R}^2.
```

The eigenvalues of $A$ are fixed at $-1$ and $-2$, so the system is
asymptotically stable for every $K>0$. The interesting question is what changes
when the off-diagonal coupling $K$ becomes large.

## Eigenvector Nonorthogonality and Modal Interference

The right eigenvectors of $A$ may be chosen as

```{math}
:label: eq:chapter3-right-eigenvectors

\phi_1 =
\begin{bmatrix}
1 \\
0
\end{bmatrix},
\qquad
\phi_2 =
\begin{bmatrix}
-K \\
1
\end{bmatrix},
```

with eigenvalues $\lambda_1=-1$ and $\lambda_2=-2$. A compatible biorthogonal
set of adjoint modes is

```{math}
:label: eq:chapter3-left-eigenvectors

\psi_1 =
\begin{bmatrix}
1 \\
K
\end{bmatrix},
\qquad
\psi_2 =
\begin{bmatrix}
0 \\
1
\end{bmatrix},
```

so that $\psi_i^* \phi_j = \delta_{ij}$. The modal expansion is therefore

```{math}
:label: eq:chapter3-modal-expansion

x(t)
= \eta_1(0)e^{-t}\phi_1 + \eta_2(0)e^{-2t}\phi_2,
\qquad
\eta_j(0) = \psi_j^* x(0).
```

Because $\psi_1$ contains the factor $K$, a modest initial state can have a
large coefficient $\eta_1(0)$. For example, if

```{math}

x(0) =
\begin{bmatrix}
0 \\
1
\end{bmatrix},
```

then $\eta_1(0)=K$ and $\eta_2(0)=1$. The first mode enters with a coefficient
that grows linearly with the non-normal coupling.

This is the basic mechanism of modal interference: the eigendirections
themselves decay, but the nonorthogonal eigenbasis can require large modal
coefficients whose partial cancellation at $t=0$ disappears at later times.


The practical implication of modal interference is that: the system may enter
nonlinear region before it stabilizes to the equilibrium; in fact, once it
enters the nonlinear region, the system may not be able to return to the
equilibrium anymore.

In other words, we need to differentiate two types of stability:

+ Linear stability: we are interested in the **minimum** critical parameter above which a specific initial condition of **infinitesimal** amplitude grows exponentially
+ Energy stability: we are interested in the **maximum** critical parameter below which a general initial condition of **finite** amplitude decays monotonically


## Normal and Non-normal Operators

For a complex matrix, normality means

```{math}
:label: eq:chapter3-normality

A^*A = AA^*.
```

Normal matrices are unitarily diagonalizable, so their eigenvectors can be
chosen orthonormally. In that case the modal directions do not interfere
through the geometry of the basis. Growth and decay are then controlled cleanly
by the eigenvalues.

The matrix in {eq}`eq:chapter3-example-matrix` is different. Its adjoint is

```{math}

A^* =
\begin{bmatrix}
-1 & 0 \\
K & -2
\end{bmatrix},
```

and direct multiplication gives

```{math}

A^*A =
\begin{bmatrix}
1 & -K \\
-K & K^2+4
\end{bmatrix},
\qquad
AA^* =
\begin{bmatrix}
K^2+1 & -2K \\
-2K & 4
\end{bmatrix}.
```

These are unequal unless $K=0$, so the operator is non-normal for every
$K>0$.

The point is not merely algebraic. Non-normality means the eigenvectors need
not be orthogonal, so the eigenvalue picture alone no longer captures how state
components can combine.

## Transient Growth Despite Asymptotic Stability

The propagator for {eq}`eq:chapter3-state-equation` is

```{math}
:label: eq:chapter3-propagator

e^{At}
=
\begin{bmatrix}
e^{-t} & K\left(e^{-t}-e^{-2t}\right) \\
0 & e^{-2t}
\end{bmatrix}.
```

Applying this to the initial state above gives

```{math}
:label: eq:chapter3-example-trajectory

x(t)
=
\begin{bmatrix}
K\left(e^{-t}-e^{-2t}\right) \\
e^{-2t}
\end{bmatrix}.
```

Each exponential factor decays. Even so, the first component can become much
larger than its initial value because the difference
$e^{-t}-e^{-2t}$ is positive for $t>0$. Its maximum occurs at
$t=\log 2$, where

```{math}
:label: eq:chapter3-first-component-peak

x_1(\log 2) = \frac{K}{4}.
```

Thus a stable system can exhibit order-$K$ amplification over finite times
before the eventual exponential decay takes over.

This behavior is invisible if one inspects only the eigenvalues
$\lambda_1=-1$ and $\lambda_2=-2$. Those eigenvalues correctly predict the
long-time fate $x(t)\to 0$, but they do not bound the size of intermediate
responses.

## Singular Values of the Propagator

The Euclidean norm of the largest possible finite-time amplification is

```{math}
:label: eq:chapter3-transient-growth

G(t) := \max_{x(0)\neq 0}\frac{\lVert x(t)\rVert_2}{\lVert x(0)\rVert_2}
= \left\lVert e^{At}\right\rVert_2
= \sigma_{\max}\!\left(e^{At}\right).
```

For the upper-triangular propagator

```{math}

e^{At} =
\begin{bmatrix}
a & b \\
0 & d
\end{bmatrix},
\qquad
a=e^{-t},
\quad
b=K\left(e^{-t}-e^{-2t}\right),
\quad
d=e^{-2t},
```

the squared singular values are the eigenvalues of $(e^{At})^*e^{At}$, namely

```{math}
:label: eq:chapter3-singular-values

\sigma_{\pm}^2\!\left(e^{At}\right)
= \frac{\tau \pm \sqrt{\tau^2 - 4a^2d^2}}{2},
\qquad
\tau = a^2+b^2+d^2.
```

When $K$ is large, the off-diagonal term $b$ makes
$\sigma_{\max}(e^{At})$ substantially larger than either $e^{-t}$ or
$e^{-2t}$. The singular-value viewpoint is therefore the right way to quantify
optimal transient growth: it asks for the most amplified initial direction, not
for the decay rate of a single eigenmode.

## Resolvent Norm and Frequency-Dependent Amplification

Transient growth is a time-domain statement. Its frequency-domain counterpart is
the resolvent

```{math}
:label: eq:chapter3-resolvent-definition

R(i\omega;A) := (i\omega I-A)^{-1}.
```

For the example matrix,

```{math}
:label: eq:chapter3-resolvent-example

R(i\omega;A)
=
\begin{bmatrix}
\dfrac{1}{i\omega+1} &
\dfrac{K}{(i\omega+1)(i\omega+2)} \\
0 &
\dfrac{1}{i\omega+2}
\end{bmatrix}.
```

The diagonal entries reflect the eigenvalues at $-1$ and $-2$, but the
off-diagonal entry shows how forcing in the second state can be transferred and
amplified into the first state. At zero frequency,

```{math}

R(0;A)
\begin{bmatrix}
0 \\
1
\end{bmatrix}
=
\begin{bmatrix}
K/2 \\
1/2
\end{bmatrix},
```

so even steady forcing can produce a response whose norm scales like $K$.

The induced norm $\lVert R(i\omega;A)\rVert_2$ measures the largest harmonic
gain at frequency $\omega$. In non-normal systems that gain can be large even
when no eigenvalue lies close to the imaginary axis. Resolvent amplification is
therefore another reason that eigenvalues alone can be misleading in
input-output problems.

## Pseudospectra and Eigenvalue Sensitivity

The $\varepsilon$-pseudospectrum of $A$ is

```{math}
:label: eq:chapter3-pseudospectrum

\Lambda_{\varepsilon}(A)
:=
\left\{z\in\mathbb{C} :
\left\lVert (zI-A)^{-1}\right\rVert_2 > \frac{1}{\varepsilon}
\right\}.
```

Equivalently, $z\in \Lambda_{\varepsilon}(A)$ if $z$ is an eigenvalue of
$A+E$ for some perturbation $E$ with $\lVert E\rVert_2 < \varepsilon$. For a
normal matrix, pseudospectral contours are nearly circular neighborhoods of the
eigenvalues. For a non-normal matrix they can bulge far away from the spectrum.

The same $2\times 2$ example shows why. Perturb the zero entry in the lower
left corner:

```{math}
:label: eq:chapter3-perturbed-matrix

A_{\delta}
=
\begin{bmatrix}
-1 & K \\
\delta & -2
\end{bmatrix}.
```

Its characteristic polynomial is

```{math}

(\lambda+1)(\lambda+2)-K\delta = 0,
```

so the perturbed eigenvalues are

```{math}
:label: eq:chapter3-perturbed-eigenvalues

\lambda_{\pm}(\delta)
=
\frac{-3 \pm \sqrt{1+4K\delta}}{2}.
```

If $K$ is large, a perturbation of size $\delta=\mathcal{O}(K^{-1})$ produces
an order-one shift in the eigenvalues. The spectrum is therefore highly
sensitive even though the unperturbed eigenvalues are simple and stable. The
pseudospectrum records that sensitivity geometrically.

## Numerical Range and Short-Time Growth Intuition

The numerical range of $A$ is

```{math}
:label: eq:chapter3-numerical-range

W(A)
:=
\left\{x^*Ax : \lVert x\rVert_2=1\right\}.
```

It provides immediate intuition for short-time behavior because

```{math}
:label: eq:chapter3-short-time-growth

\ddf{}{t}\frac{1}{2}\lVert x(t)\rVert_2^2
= x(t)^* \frac{A+A^*}{2} x(t).
```

The Hermitian part is

```{math}
:label: eq:chapter3-hermitian-part

\frac{A+A^*}{2}
=
\begin{bmatrix}
-1 & K/2 \\
K/2 & -2
\end{bmatrix}.
```

Its largest eigenvalue,

```{math}
:label: eq:chapter3-numerical-abscissa

\alpha_{\mathrm{num}}(A)
=
\lambda_{\max}\!\left(\frac{A+A^*}{2}\right)
=
\frac{-3+\sqrt{1+K^2}}{2},
```

is positive when $K>\sqrt{8}$. In that regime the numerical range extends into
the right half-plane, so there exist initial conditions whose norm increases
immediately, even though the eigenvalues of $A$ remain at $-1$ and $-2$.

This criterion is local in time, whereas the propagator singular values describe
finite times. The two viewpoints complement each other: the numerical range
explains how growth can start, and $\sigma_{\max}(e^{At})$ shows how large that
growth can become.

## Why Eigenvalues Alone Can Be Misleading

For normal systems, eigenvalues, eigenvectors, and norm growth fit together
cleanly. For non-normal systems they separate:

- asymptotic decay is set by the eigenvalues;
- finite-time growth is set by singular values of the propagator;
- forced amplification is set by the resolvent norm;
- sensitivity to perturbations is set by the pseudospectrum;
- short-time growth is signaled by the numerical range.

The matrix in {eq}`eq:chapter3-example-matrix` already displays all of these
effects. Its eigenvalues never move from $-1$ and $-2$, yet increasing $K$
makes modal coefficients large, transient responses large, harmonic gains
large, and eigenvalue sensitivity large.

That is the central lesson of non-normality: spectra remain indispensable, but
they are not a complete description of amplification, robustness, or
input-output behavior.
