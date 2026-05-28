# Dynamic Mode Decomposition and Variants

Dynamic Mode Decomposition (DMD) is a data-driven spectral fit for time-ordered
snapshots. Instead of diagonalizing a known state matrix, it identifies the
best-fit linear map that advances one snapshot to the next and then analyzes
that fitted map by eigenvalue decomposition. The resulting modes are useful for
describing coherent growth, decay, and oscillation patterns in data.

This chapter develops the standard DMD construction from snapshot pairs,
interprets it as a least-squares problem, explains projected and exact DMD,
connects DMD to POD-based rank truncation, and then introduces common
noise-aware variants. The worked example uses planar rotation-decay data so
that the fitted map, its eigenvalues, and its continuous-time interpretation
can all be derived by hand.

## Snapshot Pairs and the Best-Fit Linear Map

Suppose sampled numerical states
$\mathbf{x}_0,\mathbf{x}_1,\dots,\mathbf{x}_m \in \mathbb{R}^n$ are measured at
uniform spacing $\Delta t$. DMD organizes them into the snapshot-pair matrices

```{math}
:label: eq:chapter10-snapshot-pairs

\mathbf{X}
=
\begin{bmatrix}
\mathbf{x}_0 & \mathbf{x}_1 & \cdots & \mathbf{x}_{m-1}
\end{bmatrix},
\qquad
\mathbf{Y}
=
\begin{bmatrix}
\mathbf{x}_1 & \mathbf{x}_2 & \cdots & \mathbf{x}_m
\end{bmatrix}.
```

If the data came exactly from a linear autonomous system sampled every
$\Delta t$, then there would exist a matrix $A$ such that
$\mathbf{Y} = A\mathbf{X}$. For nonlinear, noisy, or truncated data, one
instead seeks a matrix that makes

```{math}
:label: eq:chapter10-shift-relation

\mathbf{Y} \approx A\mathbf{X}
```

as accurate as possible in a least-squares sense.

The interpretation is different from POD:

- POD asks for an orthonormal basis that reconstructs the dataset efficiently.
- DMD asks for a linear evolution rule that advances the dataset in time.

Those goals overlap, but they are not the same. A highly energetic direction
need not evolve autonomously, and a dynamically coherent mode need not capture
most of the snapshot energy.

## Least-Squares Interpretation of Standard DMD

The standard DMD matrix is the minimizer of

```{math}
:label: eq:chapter10-least-squares

\min_{A \in \mathbb{R}^{n \times n}}
\left\|
\mathbf{Y} - A\mathbf{X}
\right\|_F^2.
```

The minimum-norm least-squares solution is

```{math}
:label: eq:chapter10-dmd-map

A_{\mathrm{DMD}} = \mathbf{Y}\mathbf{X}^+,
```

where $\mathbf{X}^+$ is the Moore-Penrose pseudoinverse.

This formula is exact but often not the best computational viewpoint:

- if $n$ is large, forming $A_{\mathrm{DMD}} \in \mathbb{R}^{n \times n}$ is
  wasteful;
- if the snapshots are noisy, small singular values of $\mathbf{X}$ can
  amplify the noise through $\mathbf{X}^+$;
- if the effective dynamics are low rank, it is more stable to work in a
  truncated POD basis.

These facts motivate the SVD-based DMD algorithm.

## SVD Preprocessing and Rank Truncation

Let the thin SVD of the snapshot matrix be

```{math}
:label: eq:chapter10-svd

\mathbf{X} = U \Sigma V^\top.
```

If the data are well represented by rank $r$, truncate to

```{math}
:label: eq:chapter10-rank-r-svd

\mathbf{X}_r = U_r \Sigma_r V_r^\top,
```

where $U_r \in \mathbb{R}^{n \times r}$ has orthonormal columns,
$\Sigma_r \in \mathbb{R}^{r \times r}$ is diagonal with the leading singular
values, and $V_r \in \mathbb{R}^{m \times r}$ contains the leading right
singular vectors.

Using $\mathbf{X}_r^+ = V_r \Sigma_r^{-1} U_r^\top$, the rank-$r$ fitted map is

```{math}
:label: eq:chapter10-rank-r-map

A_r = \mathbf{Y}V_r\Sigma_r^{-1}U_r^\top.
```

Rank truncation serves two roles at once:

- it limits the fit to the dominant data subspace identified by POD;
- it regularizes the pseudoinverse by discarding very small singular values.

Choosing $r$ is therefore a modeling decision, not just a numerical detail. A
small $r$ may miss weak but dynamically important behavior, while a large $r$
may let noise contaminate the spectrum.

## Projected DMD

Because the columns of $U_r$ span the retained POD subspace, one can represent
the fitted dynamics on that basis by the reduced matrix

```{math}
:label: eq:chapter10-reduced-operator

\widetilde{A}
=
U_r^\top A_r U_r
=
U_r^\top \mathbf{Y}V_r\Sigma_r^{-1}.
```

Projected DMD computes eigenpairs of this small $r \times r$ matrix,

```{math}
:label: eq:chapter10-reduced-eigenproblem

\widetilde{A} w_j = \mu_j w_j,
```

and then lifts the reduced eigenvectors back to the state space as

```{math}
:label: eq:chapter10-projected-modes

\widehat{\phi}_j = U_r w_j.
```

The eigenvalues $\mu_j$ are the discrete-time DMD eigenvalues. They describe
how modal coordinates change from one sample to the next:

```{math}
\eta_{j,k+1} \approx \mu_j \eta_{j,k}.
```

Projected DMD is attractive because the expensive eigenproblem is reduced from
$n \times n$ to $r \times r$. It also makes the connection to POD explicit:
the DMD modes are assembled from a POD basis, but their coefficients are chosen
to approximate time advancement rather than variance maximization.

## Exact DMD

Projected modes lie in the column space of $U_r$. Exact DMD uses the same
reduced eigenvectors $w_j$ and eigenvalues $\mu_j$, but lifts them with the
image of the fitted map instead:

```{math}
:label: eq:chapter10-exact-modes

\phi_j
=
\frac{1}{\mu_j}\mathbf{Y}V_r\Sigma_r^{-1}w_j,
\qquad
\mu_j \ne 0.
```

These exact DMD modes are eigenvectors of the fitted rank-$r$ map $A_r$:

```{math}
:label: eq:chapter10-exact-mode-eigenrelation

A_r \phi_j = \mu_j \phi_j.
```

In practice the distinction is:

- projected DMD emphasizes the retained POD subspace;
- exact DMD emphasizes eigenvectors of the fitted evolution map itself.

When the retained subspace is nearly invariant, the two versions are close. If
the image $A_r U_r$ leans outside the retained left singular subspace, the mode
shapes can differ noticeably.

## DMD Eigenvalues, Modes, and Amplitudes

Collect the selected DMD modes in

```{math}
:label: eq:chapter10-mode-matrix

\Phi_r
=
\begin{bmatrix}
\phi_1 & \phi_2 & \cdots & \phi_r
\end{bmatrix},
\qquad
\Lambda
=
\operatorname{diag}(\mu_1,\dots,\mu_r).
```

If the fitted model is diagonalizable and the initial snapshot is represented
as

```{math}
:label: eq:chapter10-amplitudes

\mathbf{x}_0 \approx \Phi_r b,
```

then the DMD reconstruction has the form

```{math}
:label: eq:chapter10-dmd-reconstruction

\mathbf{x}_k
\approx
\Phi_r \Lambda^k b
=
\sum_{j=1}^r \phi_j b_j \mu_j^k.
```

The coefficients $b_j$ are the DMD amplitudes. A common choice is to fit them
from the first snapshot by

```{math}
:label: eq:chapter10-amplitude-fit

b = \Phi_r^+ \mathbf{x}_0,
```

but one may also estimate them from multiple snapshots if the first snapshot is
not representative or is strongly contaminated by noise.

This expansion shows the basic meaning of a DMD mode:

- $\phi_j$ is the spatial pattern;
- $\mu_j$ determines step-to-step growth, decay, and phase rotation;
- $b_j$ determines how strongly that mode is excited in the chosen fit.

For real-valued data, complex eigenvalues typically appear in conjugate pairs.
Those pairs correspond to real oscillatory patterns when the two complex modes
are combined.

## Continuous-Time Eigenvalues from Discrete-Time Data

The DMD eigenvalues $\mu_j$ are discrete-time quantities. When the snapshots
are sampled uniformly with spacing $\Delta t$, one often converts them to
continuous-time exponents

```{math}
:label: eq:chapter10-continuous-time

\lambda_j = \frac{\log(\mu_j)}{\Delta t}.
```

If $\mu_j = |\mu_j|e^{i\theta_j}$, then

```{math}
:label: eq:chapter10-growth-frequency

\operatorname{Re}(\lambda_j) = \frac{\log |\mu_j|}{\Delta t},
\qquad
\operatorname{Im}(\lambda_j) = \frac{\theta_j + 2\pi \ell}{\Delta t},
\quad
\ell \in \mathbb{Z}.
```

Thus:

- $|\mu_j|<1$ corresponds to decay per sample;
- $|\mu_j|>1$ corresponds to growth per sample;
- $\arg(\mu_j)$ encodes discrete oscillation frequency;
- the complex logarithm introduces branch ambiguity in the continuous-time
  frequency.

That ambiguity matters when the sampling rate is too low. Frequencies separated
by integer multiples of $2\pi/\Delta t$ produce the same discrete phase
advance, so discrete-time data alone cannot distinguish them without additional
information.

## Worked Example: Rotation-Decay Data

Consider the planar update

```{math}
:label: eq:chapter10-rotation-decay-map

\mathbf{x}_{k+1} = A\mathbf{x}_k,
\qquad
A
=
\rho
\begin{bmatrix}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{bmatrix},
\qquad
0 < \rho < 1.
```

This is a rotation by angle $\theta$ followed by decay by factor $\rho$ each
sample. Start from

```{math}
:label: eq:chapter10-example-initial

\mathbf{x}_0 =
\begin{bmatrix}
1 \\ 0
\end{bmatrix}.
```

Then

```{math}
:label: eq:chapter10-example-snapshots

\mathbf{x}_1
=
\rho
\begin{bmatrix}
\cos \theta \\ \sin \theta
\end{bmatrix},
\qquad
\mathbf{x}_2
=
\rho^2
\begin{bmatrix}
\cos 2\theta \\ \sin 2\theta
\end{bmatrix}.
```

Use the two snapshot pairs

```{math}
:label: eq:chapter10-example-pairs

\mathbf{X}
=
\begin{bmatrix}
\mathbf{x}_0 & \mathbf{x}_1
\end{bmatrix},
\qquad
\mathbf{Y}
=
\begin{bmatrix}
\mathbf{x}_1 & \mathbf{x}_2
\end{bmatrix}.
```

When $\sin \theta \ne 0$, the matrix $\mathbf{X}$ is invertible, so the DMD fit
recovers the exact map:

```{math}
:label: eq:chapter10-example-map-recovery

A_{\mathrm{DMD}}
=
\mathbf{Y}\mathbf{X}^{-1}
=
A.
```

The eigenvalues of $A$ are

```{math}
:label: eq:chapter10-example-eigenvalues

\mu_\pm = \rho e^{\pm i\theta}.
```

Hence the continuous-time exponents are

```{math}
:label: eq:chapter10-example-continuous

\lambda_\pm
=
\frac{\log \rho}{\Delta t}
\pm i \frac{\theta + 2\pi \ell}{\Delta t},
\qquad
\ell \in \mathbb{Z}.
```

Using the principal branch $\ell=0$, the decay rate is
$\log \rho / \Delta t < 0$ and the oscillation frequency is
$\theta / \Delta t$.

One eigenvector choice is

```{math}
:label: eq:chapter10-example-modes

\phi_+
=
\begin{bmatrix}
1 \\ -i
\end{bmatrix},
\qquad
\phi_-
=
\begin{bmatrix}
1 \\ i
\end{bmatrix}.
```

Writing $\Phi = \begin{bmatrix}\phi_+ & \phi_-\end{bmatrix}$ and solving
$\mathbf{x}_0 = \Phi b$ gives

```{math}
:label: eq:chapter10-example-amplitudes

b
=
\frac{1}{2}
\begin{bmatrix}
1 \\ 1
\end{bmatrix}.
```

Therefore the DMD expansion is

```{math}
:label: eq:chapter10-example-expansion

\mathbf{x}_k
=
\frac{1}{2}\phi_+ \mu_+^k
+
\frac{1}{2}\phi_- \mu_-^k.
```

Combining the conjugate pair recovers the real trajectory

```{math}
:label: eq:chapter10-example-real-trajectory

\mathbf{x}_k
=
\rho^k
\begin{bmatrix}
\cos(k\theta) \\ \sin(k\theta)
\end{bmatrix}.
```

This example is instructive because it separates two effects cleanly:

- the magnitude $\rho$ controls modal decay;
- the phase $\theta$ controls modal rotation frequency.

It also shows why DMD is often said to identify rotating and decaying coherent
structures from data alone.

Use the interactive below to vary the decay factor, rotation angle, and sample
spacing in this worked example. The fit uses only
$\mathbf{x}_0,\mathbf{x}_1,\mathbf{x}_2$, so the discrete eigenvalues and
their continuous-time interpretation can be checked directly against the
hand-derived formulas above.

:::{course-interactive}
:data-example: chapter10-rotation-decay-dmd
Interactive example loading...
:::

## Relationship Between POD and DMD

Chapter 09 showed that POD provides an orthonormal basis
$U_r = \begin{bmatrix}u_1 & \cdots & u_r\end{bmatrix}$ that optimally
reconstructs the snapshot matrix in a least-squares sense. DMD uses that same
basis in a different way:

- the columns of $U_r$ span the retained data subspace;
- the reduced DMD operator $\widetilde{A}$ advances coordinates on that
  subspace;
- the DMD modes are linear combinations of POD modes determined by the
  eigenvectors of $\widetilde{A}$.

The contrast is important:

- POD modes are orthonormal and ranked by captured variance;
- DMD modes are generally not orthogonal and are ranked by spectral relevance
  or fitted amplitude;
- POD is about compression;
- DMD is about approximate temporal evolution.

Neither method dominates the other absolutely. POD is often better for compact
representation, while DMD can be better for isolating oscillatory components
with distinct growth or decay rates. Many workflows use POD as preprocessing
for DMD, precisely because the singular vectors supply a stable reduced
coordinate system.

## Noise Sensitivity and Bias in Standard DMD

Standard DMD treats $\mathbf{X}$ as the regression input and $\mathbf{Y}$ as
the output. The least-squares problem in {eq}`eq:chapter10-least-squares`
therefore assumes that all discrepancy should be attributed to $\mathbf{Y}$.
If both matrices are noisy, that assumption is asymmetric.

Two consequences follow:

- the pseudoinverse can magnify noise associated with small singular values of
  $\mathbf{X}$;
- errors in both $\mathbf{X}$ and $\mathbf{Y}$ create an
  errors-in-variables bias that shifts the estimated eigenvalues.

The bias is often visible as artificial decay or distorted frequencies, even
when the underlying process is neutrally stable or only weakly damped. In
other words, a clean short-window reconstruction does not guarantee an
unbiased spectrum.

This is why DMD should be interpreted with the data pathway in mind:

1. how were the snapshots sampled and aligned;
2. what rank truncation was used;
3. what level of measurement noise or process noise is present;
4. whether the fitted spectrum is stable across window choices and repeated
   experiments.

The common variants below are attempts to reduce this sensitivity while keeping
the base DMD picture interpretable.

The next interactive keeps the same rotation-decay family but fits a longer
noisy snapshot window. Compare rank-1 and rank-2 truncation, inspect the
one-step residual, and note how the inferred spectrum and rollout change when
the data are perturbed.

:::{course-interactive}
:data-example: chapter10-rank-noise-dmd
Interactive example loading...
:::

## Forward-Backward DMD

Forward-backward DMD tries to reduce regression asymmetry by fitting the
dynamics in both time directions. In forward time one fits

```{math}
\mathbf{Y} \approx A_f \mathbf{X},
```

and in backward time one fits

```{math}
\mathbf{X} \approx A_b \mathbf{Y}.
```

If the data were noise free, one would expect $A_b \approx A_f^{-1}$. A common
forward-backward estimate combines both directions through

```{math}
:label: eq:chapter10-fbdmd

A_{\mathrm{fb}} \approx \left(A_f A_b^{-1}\right)^{1/2},
```

or an equivalent symmetrized reduced formulation.

The main idea is not the exact matrix square-root formula itself. The main idea
is that forward and backward fits are used together so that the inferred
spectrum is less biased by one-sided regression error. This tends to improve
frequency and growth-rate estimates when measurement noise perturbs both
snapshot matrices comparably.

## Total-Least-Squares DMD

Total-least-squares DMD (TLS-DMD) addresses the same asymmetry more directly.
Instead of minimizing only $\|\mathbf{Y} - A\mathbf{X}\|_F$, it allows
corrections to both snapshot matrices:

```{math}
:label: eq:chapter10-tls

\min_{A,\Delta \mathbf{X},\Delta \mathbf{Y}}
\left\|
\begin{bmatrix}
\Delta \mathbf{X} \\
\Delta \mathbf{Y}
\end{bmatrix}
\right\|_F
\quad
\text{subject to}
\quad
\mathbf{Y} + \Delta \mathbf{Y}
=
A(\mathbf{X} + \Delta \mathbf{X}).
```

In practice this is implemented by forming an augmented data matrix and
projecting it onto a dominant subspace before solving the DMD eigenproblem.
The conceptual difference from standard DMD is the key point:

- standard DMD treats $\mathbf{X}$ as exact and adjusts only $\mathbf{Y}$;
- TLS-DMD permits consistent corrections to both.

That makes TLS-DMD better aligned with an errors-in-variables interpretation of
experimental data.

## Optimized DMD at Exposure Level

Standard DMD first fits a discrete linear map and then converts its eigenvalues
to continuous-time rates. Optimized DMD instead fits a sum of exponentials
directly to all snapshots:

```{math}
:label: eq:chapter10-optimized-dmd

\mathbf{x}_k
\approx
\sum_{j=1}^r \phi_j b_j e^{\lambda_j t_k}.
```

Here the unknowns are the continuous-time exponents $\lambda_j$, the modes
$\phi_j$, and the amplitudes $b_j$, with the sampling times $t_k$ used
explicitly.

At exposure level, the important distinctions are:

- it is a nonlinear optimization problem rather than a single linear
  least-squares solve;
- it uses all snapshots simultaneously instead of only one-step pairs;
- it works naturally with nonuniform sample times;
- it estimates continuous-time growth rates and frequencies directly.

The tradeoff is computational: optimized DMD is often more accurate in noisy
settings, but it is more expensive and initialization matters.

## Residual Diagnostics and Mode Validation

DMD should not end with a list of eigenvalues. One should check how well the
fitted model explains the observed shift structure and whether individual modes
are credible.

At the matrix level, the one-step residual is

```{math}
:label: eq:chapter10-matrix-residual

R = \mathbf{Y} - A_r \mathbf{X}.
```

The normalized quantity
$\|R\|_F / \|\mathbf{Y}\|_F$ summarizes how well the fitted rank-$r$ model
matches the measured snapshot pairs.

At the modal level, a projected DMD Ritz pair $(\mu_j,w_j)$ can be checked by
the lifted residual

```{math}
:label: eq:chapter10-mode-residual

r_j
=
\left\|
\mathbf{Y}V_r\Sigma_r^{-1}w_j
-
\mu_j U_r w_j
\right\|_2.
```

This quantity vanishes only when the retained subspace is invariant under the
fitted dynamics in that modal direction. Large $r_j$ means the eigenvalue is
numerically present in the reduced operator but poorly respected by the lifted
state-space dynamics.

Useful validation questions include:

- Does the mode persist if the snapshot window is shifted?
- Does it persist under modest changes in truncation rank?
- Is the mode paired with a small residual and a physically plausible
  frequency?
- Does the mode predict held-out data, not just the data used to fit it?

These checks matter because DMD will always return a spectrum. The analyst must
decide whether that spectrum is robust, biased, overfit, or genuinely
informative.

## Reconstruction Quality Versus Prediction Quality

It is easy to overestimate DMD by looking only at in-sample reconstruction.
The expansion in {eq}`eq:chapter10-dmd-reconstruction` can match the training
snapshots well even when the identified eigenvalues are not reliable for future
prediction.

The distinction is straightforward:

- **Reconstruction quality** asks how accurately the fitted modes reproduce the
  snapshots used to estimate them.
- **Prediction quality** asks how accurately the same fitted modes extrapolate
  to later snapshots or new realizations.

These goals differ because small spectral errors accumulate over time. A mode
with slightly incorrect growth rate or frequency may still reconstruct a short
window very well, but it can drift badly in longer prediction. This is
especially important for nearly neutral oscillations, where a tiny bias in
$|\mu_j|$ creates noticeable long-horizon amplitude error.

For that reason, DMD model assessment should include both:

1. in-sample residual and reconstruction checks;
2. out-of-sample prediction checks over additional snapshots.

POD and DMD differ here as well. POD can have excellent compression with no
predictive meaning, while DMD can offer predictive structure only if the fitted
spectrum is stable and the data are informative about the governing dynamics.

## Summary

DMD fits a linear advancement rule from snapshot pairs and interprets that rule
through eigenvalues, modes, and amplitudes. In practice the method is usually
implemented in a truncated POD basis, which gives projected DMD and exact DMD
as two closely related lifted interpretations of the same reduced eigenproblem.

The fitted spectrum encodes discrete growth, decay, and oscillation, while the
complex logarithm maps those quantities to continuous-time rates when the
sampling interval is known. The rotation-decay example shows this interpretation
cleanly.

Standard DMD is easy to teach and compute, but it is sensitive to noise and
regression asymmetry. Forward-backward DMD, TLS-DMD, and optimized DMD are
best understood as attempts to correct that weakness while preserving the
central spectral viewpoint. Residual checks, rank sensitivity, and held-out
prediction tests are therefore part of the method itself, not optional
afterthoughts.
