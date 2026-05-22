# SPOD and Resolvent Analysis

Chapter 3 showed that non-normal systems can amplify disturbances strongly even
when their eigenvalues are stable. This chapter shifts that same question into
the frequency domain. The main objects are the cross-spectral density
$S_x(\omega)$, which summarizes second-order statistics at each frequency, and
the resolvent $R(i\omega;A)$, which summarizes harmonic input-output gain at
each frequency.

The two viewpoints answer different questions. Spectral Proper Orthogonal
Decomposition (SPOD) extracts the most energetic coherent structures present in
stationary data at a given frequency. Resolvent analysis extracts the forcing
and response directions that maximize linear amplification at that frequency.
Only after those constructions are kept distinct does their relationship become
clear.

## Frequency-Domain View of Stationary Data

Let $x(t)\in\mathbb{C}^n$ be a zero-mean stationary process. For a finite time
window of length $T$, define the Fourier transform

```{math}
:label: eq:chapter12-fourier-transform

\hat{x}_T(\omega)
=
\int_0^T x(t)e^{-i\omega t}\,dt.
```

Stationarity means that second-order statistics do not depend on an absolute
time origin. The frequency-domain second-order object is the cross-spectral
density (CSD),

```{math}
:label: eq:chapter12-csd-definition

S_x(\omega)
:=
\lim_{T\to\infty}
\frac{1}{T}
\mathbb{E}\!\left[\hat{x}_T(\omega)\hat{x}_T(\omega)^*\right].
```

For each frequency $\omega$, the matrix $S_x(\omega)$ is Hermitian positive
semidefinite. Its diagonal entries are power spectra of individual components,
and its off-diagonal entries measure cross-spectral correlations between
components.

This is the frequency-domain analog of a covariance matrix:

- a covariance matrix pools variability over time and ranks energetic spatial
  structures overall;
- a CSD conditions that variability on one frequency and ranks energetic
  structures frequency by frequency.

If the process comes from a stable linear system driven by stationary forcing,
then $S_x(\omega)$ can often be interpreted directly through a transfer
operator, which is where resolvent analysis enters later in the chapter.

## Estimating the Cross-Spectral Density

In practice one does not have the infinite-time limit in
{eq}`eq:chapter12-csd-definition`. Instead, a long record is broken into
$n_b$ blocks, each block is windowed, Fourier transformed, and the resulting
outer products are averaged. A simple Welch estimator is

```{math}
:label: eq:chapter12-welch

\widehat{S}_x(\omega_\ell)
=
\frac{1}{n_b}
\sum_{m=1}^{n_b}
\hat{\mathbf{x}}^{(m)}(\omega_\ell)
\hat{\mathbf{x}}^{(m)}(\omega_\ell)^*,
```

where $\hat{\mathbf{x}}^{(m)}(\omega_\ell)$ is the discrete Fourier coefficient
of block $m$ at frequency bin $\omega_\ell$.

Three ideas matter more than implementation detail:

- Windowing reduces spectral leakage caused by truncating a finite record.
- Overlap increases the number of averaged blocks and therefore reduces
  estimator variance.
- Shorter blocks improve averaging but reduce frequency resolution.

Thus Welch estimation is a bias-variance-resolution compromise, not a new
modal definition. SPOD is defined from the limiting CSD; Welch averaging is
only a practical way to estimate it from finite data.

## SPOD Eigenproblem

SPOD is the frequency-by-frequency analogue of POD. Instead of diagonalizing a
covariance matrix, it diagonalizes the CSD operator. With a positive-definite
weight matrix $W$ defining the inner product, the SPOD modes at frequency
$\omega$ solve

```{math}
:label: eq:chapter12-spod-eigenproblem

S_x(\omega) W \phi_j(\omega)
=
\lambda_j(\omega)\phi_j(\omega),
\qquad
\phi_i(\omega)^* W \phi_j(\omega)=\delta_{ij}.
```

The eigenvalues satisfy

```{math}
\lambda_1(\omega)\ge \lambda_2(\omega)\ge \cdots \ge 0,
```

and quantify the energy carried by each frequency-conditioned mode. The
leading SPOD mode is therefore the most energetic coherent structure present in
the data at that frequency.

This is a statistical definition:

- the operator is $S_x(\omega)$, estimated from data;
- the ranking criterion is energy or variance at fixed frequency;
- the result depends on the forcing statistics and on the chosen inner
  product.

SPOD modes are not defined by maximal input-output gain. They are defined by
what the data actually contains.

For the direct comparison with the ordinary resolvent SVD below, we now
specialize to the Euclidean inner product $W=I$. With a nontrivial weight
matrix, the same comparison must be carried out with a resolvent formulation
that uses the matching weighted inner products.

## Resolvent Analysis

Now consider the stable linear system

```{math}
:label: eq:chapter12-lti-system

\ddf{x}{t} = Ax + Bf,
\qquad
y = Cx,
```

with forcing $f(t)$ and measured output $y(t)$. Taking a Fourier transform of
the steady response gives

```{math}
:label: eq:chapter12-transfer-relation

\hat{y}(\omega)
=
H(i\omega)\hat{f}(\omega),
\qquad
H(i\omega)
:=
C(i\omega I-A)^{-1}B.
```

The state resolvent from Chapter 3 is the special case
$R(i\omega;A)=(i\omega I-A)^{-1}$, introduced in
{eq}`eq:chapter3-resolvent-definition`. The more general transfer operator
$H(i\omega)$ also accounts for where forcing enters and what output is
measured.

Resolvent analysis studies the singular value decomposition

```{math}
:label: eq:chapter12-resolvent-svd

H(i\omega)
=
U(\omega)\Sigma(\omega)V(\omega)^*,
```

where

```{math}
\Sigma(\omega)
=
\operatorname{diag}\!\left(\sigma_1(\omega),\sigma_2(\omega),\dots\right),
\qquad
\sigma_1(\omega)\ge \sigma_2(\omega)\ge \cdots \ge 0.
```

At each frequency:

- the columns of $V(\omega)$ are the forcing modes;
- the columns of $U(\omega)$ are the response modes;
- the singular values $\sigma_j(\omega)$ are the resolvent gains.

The leading gain solves the optimization problem

```{math}
:label: eq:chapter12-resolvent-optimization

\sigma_1(\omega)
=
\max_{\hat{f}\ne 0}
\frac{\|H(i\omega)\hat{f}\|_2}{\|\hat{f}\|_2}.
```

Thus resolvent modes answer an input-output question: which harmonic forcing
direction produces the largest response at frequency $\omega$?

## Worked Example: An Asymmetrically Coupled 2D Oscillator

Consider the stable two-state oscillator

```{math}
:label: eq:chapter12-example-system

\ddf{x}{t}
=
A x + f,
\qquad
A
=
\begin{bmatrix}
-\alpha & \beta+\kappa \\
-\beta & -\alpha
\end{bmatrix},
\qquad
\alpha>0,
\quad
\beta>0,
\quad
\beta+\kappa>0.
```

When $\kappa=0$, the coupling is skew-symmetric apart from the damping
$-\alpha I$, so the system is a normal damped oscillator. When $\kappa\ne 0$,
the off-diagonal couplings are unequal and the matrix is non-normal.

Its eigenvalues are

```{math}
:label: eq:chapter12-example-eigenvalues

\lambda_{\pm}
=
-\alpha \pm i\sqrt{\beta(\beta+\kappa)},
```

so the motion is oscillatory with decay rate $\alpha$.

With $B=C=I$, the resolvent is

```{math}
:label: eq:chapter12-example-resolvent

R(i\omega;A)
=
(i\omega I-A)^{-1}
=
\frac{1}{(i\omega+\alpha)^2+\beta(\beta+\kappa)}
\begin{bmatrix}
i\omega+\alpha & \beta+\kappa \\
-\beta & i\omega+\alpha
\end{bmatrix}.
```

Several points are visible directly:

- The denominator is smallest near the damped natural frequency
  $\omega\approx \sqrt{\beta(\beta+\kappa)}$, so the frequency response peaks
  near resonance.
- The unequal couplings $\beta+\kappa$ and $\beta$ tilt the response away from
  a symmetric normal oscillator.
- For $\kappa\ne 0$, the most amplified forcing direction and the most visible
  response direction need not align with the eigenvectors of $A$.

If the forcing has cross-spectral density $S_f(\omega)$, then the state CSD is

```{math}
:label: eq:chapter12-example-csd

S_x(\omega)
=
R(i\omega;A)S_f(\omega)R(i\omega;A)^*.
```

This one formula already separates the two viewpoints:

- resolvent analysis factors the linear map $R(i\omega;A)$ into optimal
  forcing and response directions;
- SPOD diagonalizes the statistical output $S_x(\omega)$ actually produced by
  that map and the forcing statistics.

## Relationship Between SPOD and Resolvent Modes

Write the resolvent SVD as

```{math}
:label: eq:chapter12-example-svd

R(i\omega;A) = U(\omega)\Sigma(\omega)V(\omega)^*.
```

Substituting this factorization into
{eq}`eq:chapter12-example-csd` yields

```{math}
:label: eq:chapter12-spod-resolvent-relation

S_x(\omega)
=
U(\omega)\Sigma(\omega)
\bigl[V(\omega)^*S_f(\omega)V(\omega)\bigr]
\Sigma(\omega)U(\omega)^*.
```

Under the Euclidean choice $W=I$, this identity explains both the similarity
and the difference between SPOD and resolvent modes.

### White Forcing

If the forcing is white with equal power in all forcing directions,

```{math}
:label: eq:chapter12-white-forcing

S_f(\omega) = q(\omega) I,
```

then {eq}`eq:chapter12-spod-resolvent-relation` becomes

```{math}
:label: eq:chapter12-white-forcing-csd

S_x(\omega)
=
q(\omega)U(\omega)\Sigma(\omega)^2U(\omega)^*.
```

Therefore, in this $W=I$ setting, the SPOD modes are exactly the resolvent
response modes, and the SPOD eigenvalues are proportional to squared
resolvent gains. Under white forcing, the energetic structures seen in the
data are the same directions that maximize linear harmonic amplification.

### Structured Forcing

If the forcing is colored or correlated, then
$V(\omega)^*S_f(\omega)V(\omega)$ is generally not a multiple of the identity.
In that case the forcing statistics weight and mix the resolvent response
directions before they appear in the output CSD.

Two consequences follow:

- If the forcing covariance is diagonal in the resolvent forcing basis, then
  the SPOD modes still coincide with the resolvent response modes, but their
  eigenvalues are reweighted by the forcing power in each forcing mode.
- If the forcing covariance has off-diagonal terms in that basis, then the
  SPOD modes are rotated combinations of resolvent response modes.

This is why SPOD and resolvent analysis should not be treated as synonymous.
SPOD is data-statistical. Resolvent analysis is input-output. In the present
$W=I$ formulation, they agree only when the forcing statistics are compatible
with the resolvent forcing basis.

## Statistical Modes Versus Input-Output Modes

The distinction can be stated cleanly:

- SPOD asks: which structures carry the most output energy at frequency
  $\omega$ in the observed or modeled stochastic response?
- Resolvent analysis asks: which forcing and response directions maximize
  linear gain at frequency $\omega$?

Because these are different optimization problems, their leading modes can
differ even for the same linear system. A weakly amplified direction can appear
strongly in SPOD if it is forced intensely, while a strongly amplified
resolvent direction can be nearly absent from SPOD if the corresponding
forcing is not excited.

This is the same distinction emphasized earlier in the notes between
statistical modes and input-output modes: one ranks what the data contains, the
other ranks what the system could amplify.

## Connection to Non-Normality and Transient Growth

Chapter 3 emphasized that eigenvalues do not fully determine amplification. The
same lesson reappears here.

For a normal matrix $A$, eigenvectors, resolvent singular vectors, and harmonic
response directions are tightly aligned. Large gains then occur mainly because
$i\omega$ lies close to the spectrum. For a non-normal matrix, resolvent
singular vectors can differ substantially from eigenvectors, and large gains
can occur through constructive interference among nonorthogonal modes even when
the eigenvalues are not especially close to the imaginary axis.

Thus:

- transient growth is the time-domain signature of non-normal amplification;
- resolvent peaks are the frequency-domain signature of non-normal
  amplification;
- SPOD reveals which of those amplified directions are actually populated by
  stationary forcing statistics.

The asymmetrically coupled oscillator in
{eq}`eq:chapter12-example-system` shows this progression. The parameter
$\kappa$ leaves the system stable but changes how forcing is converted into
response. As non-normality increases, the leading resolvent gain can become
more pronounced, and under broadband forcing the leading SPOD mode follows that
amplified response direction.

## Summary

SPOD and resolvent analysis both organize frequency-dependent structures, but
they do so from different operators. SPOD diagonalizes the cross-spectral
density and therefore ranks energetic structures present in stationary data.
Resolvent analysis computes the singular vectors of a transfer operator and
therefore ranks optimal forcing and response directions of a linear system.

Their relationship is simple once the forcing statistics are made explicit and
the same inner product is used on both sides: in the Euclidean case $W=I$,
white forcing makes SPOD modes equal resolvent response modes, while
structured forcing reweights or mixes those directions. That distinction is
exactly what connects frequency-domain modal analysis back to non-normal
amplification from Chapter 3.
