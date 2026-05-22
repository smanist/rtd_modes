# POD, KL, and Snapshot Methods

Proper Orthogonal Decomposition (POD) answers a different question from an
eigenanalysis of the governing dynamics. Instead of asking for invariant
directions of a matrix or propagator, it asks for the orthonormal directions
that best reconstruct a given dataset. The same construction appears in
statistics as principal component analysis and in random-field theory as the
Karhunen-Loeve (KL) expansion.

This chapter develops POD from the reconstruction problem, connects it to the
singular value decomposition (SVD) of a snapshot matrix, interprets the same
objects through empirical covariance, and explains the method of snapshots for
high-dimensional data. The worked example uses a tiny snapshot matrix so that
every singular value and mode can be derived by hand.

## Snapshot Matrix and the POD Optimization Problem

Suppose $m$ sampled numerical states
$\mathbf{x}_0,\mathbf{x}_1,\dots,\mathbf{x}_{m-1} \in \mathbb{R}^n$ are
assembled into the snapshot matrix

```{math}
:label: eq:chapter9-snapshot-matrix

\mathbf{X}
=
\begin{bmatrix}
\mathbf{x}_0 & \mathbf{x}_1 & \cdots & \mathbf{x}_{m-1}
\end{bmatrix}.
```

POD seeks an $r$-dimensional orthonormal basis
$\Phi_r = \begin{bmatrix}\phi_1 & \cdots & \phi_r\end{bmatrix}$ with
$\Phi_r^\top \Phi_r = I_r$ that minimizes the total squared reconstruction
error

```{math}
:label: eq:chapter9-pod-optimization

\min_{\Phi_r^\top \Phi_r = I_r}
\left\|
\mathbf{X} - \Phi_r \Phi_r^\top \mathbf{X}
\right\|_F^2.
```

The matrix $\Phi_r \Phi_r^\top \mathbf{X}$ is the orthogonal projection of all
snapshots onto the $r$-dimensional subspace spanned by the columns of
$\Phi_r$. The leading POD modes are therefore the directions that give the
smallest average squared projection error over the dataset.

This is a data-dependent definition. Changing the snapshots changes the POD
modes. Changing the inner product changes them as well, which matters when the
state represents a discretized field rather than a vector with a natural
Euclidean metric.

## SVD of the Snapshot Matrix

For the Euclidean inner product, the POD basis is obtained from the thin SVD

```{math}
:label: eq:chapter9-svd

\mathbf{X} = U \Sigma V^\top,
```

where
$U \in \mathbb{R}^{n \times p}$ and $V \in \mathbb{R}^{m \times p}$ have
orthonormal columns,
$\Sigma = \operatorname{diag}(\sigma_1,\dots,\sigma_p)$,
$\sigma_1 \ge \sigma_2 \ge \cdots \ge \sigma_p \ge 0$, and
$p = \operatorname{rank}(\mathbf{X})$.

The columns of $U$ are the POD modes, the right singular vectors in $V$ encode
temporal or sample-to-sample coefficients, and the singular values measure how
strongly each mode appears in the dataset. Keeping only the first $r$ singular
triples gives

```{math}
:label: eq:chapter9-rank-r-svd

\mathbf{X}_r
=
U_r \Sigma_r V_r^\top
=
\sum_{j=1}^r \sigma_j u_j v_j^\top.
```

The Eckart-Young theorem states that $\mathbf{X}_r$ is the best rank-$r$
approximation to $\mathbf{X}$ in the Frobenius norm. Therefore the POD problem
in {eq}`eq:chapter9-pod-optimization` is solved by taking
$\Phi_r = U_r$.

Each snapshot then has reduced coordinates

```{math}
:label: eq:chapter9-modal-coordinates

a_k = \Phi_r^\top \mathbf{x}_k,
\qquad
\mathbf{x}_k \approx \Phi_r a_k.
```

## KL Viewpoint and Empirical Covariance

The KL viewpoint starts from a random state $x$ in a Hilbert space
$\mathcal{H}$ and asks for orthonormal directions that diagonalize the
covariance operator of the fluctuations $x - \mathbb{E}[x]$. In finite
dimensions, that viewpoint becomes an eigenproblem for the covariance matrix.

If the snapshots are already fluctuations about a mean state, or if one has
centered the data by replacing $\mathbf{x}_k$ with
$\mathbf{x}_k - \bar{\mathbf{x}}$, then the empirical covariance is

```{math}
:label: eq:chapter9-covariance

C_x = \frac{1}{m}\mathbf{X}\mathbf{X}^\top.
```

Using the SVD from {eq}`eq:chapter9-svd`,

```{math}
:label: eq:chapter9-covariance-eigendecomposition

C_x
=
\frac{1}{m} U \Sigma^2 U^\top.
```

Thus the POD modes are also eigenvectors of $C_x$, and the empirical variances
along those directions are $\sigma_j^2/m$. In the KL language, one writes the
fluctuation field as an expansion in orthonormal covariance eigenfunctions,
ordered from largest variance to smallest variance.

This interpretation clarifies the meaning of POD:

- it is optimal for representing the observed second-order statistics;
- it is not, by itself, a statement about dynamical invariance;
- it depends on whether one includes the mean or analyzes only the
  fluctuations.

## Energy Ranking, Captured Variance, and Reconstruction Error

The total snapshot energy in the Euclidean norm is

```{math}
:label: eq:chapter9-total-energy

\|\mathbf{X}\|_F^2 = \sum_{j=1}^p \sigma_j^2.
```

The fraction captured by the first $r$ POD modes is

```{math}
:label: eq:chapter9-captured-energy

\gamma_r
=
\frac{\sum_{j=1}^r \sigma_j^2}{\sum_{j=1}^p \sigma_j^2}.
```

The neglected energy, which is also the optimal squared reconstruction error
for a rank-$r$ approximation, is

```{math}
:label: eq:chapter9-reconstruction-error

\left\|
\mathbf{X} - \mathbf{X}_r
\right\|_F^2
=
\sum_{j=r+1}^p \sigma_j^2.
```

These formulas motivate standard rank-selection rules: keep enough modes to
reach a target captured variance, look for a spectral gap in the singular
values, or stop when the remaining singular values are comparable to a known
noise floor.

## Weighted Inner Products

In discretized mechanics or partial differential equations, the Euclidean inner
product may not approximate the physically relevant energy or $L^2$ norm. Let
$W \in \mathbb{R}^{n \times n}$ be symmetric positive definite and define

```{math}
:label: eq:chapter9-weighted-inner-product

\langle \mathbf{x}, \mathbf{y} \rangle_W
=
\mathbf{x}^\top W \mathbf{y},
\qquad
\|\mathbf{x}\|_W^2 = \mathbf{x}^\top W \mathbf{x}.
```

The POD problem becomes

```{math}
:label: eq:chapter9-weighted-pod

\min_{\Phi_r^\top W \Phi_r = I_r}
\left\|
W^{1/2}\bigl(\mathbf{X} - \Phi_r \Phi_r^\top W \mathbf{X}\bigr)
\right\|_F^2.
```

Equivalently, one forms the weighted data matrix
$\widetilde{\mathbf{X}} = W^{1/2}\mathbf{X}$, computes its SVD, and maps the
left singular vectors back to the original coordinates. The resulting modes
satisfy $\Phi_r^\top W \Phi_r = I_r$, and the reduced coordinates are

```{math}
:label: eq:chapter9-weighted-coordinates

a_k = \Phi_r^\top W \mathbf{x}_k.
```

This weighted form is important when $W$ contains quadrature weights, a mass
matrix, or another discretization-dependent metric.

## Method of Snapshots

When the state dimension $n$ is very large but the number of snapshots $m$ is
moderate, directly diagonalizing $\mathbf{X}\mathbf{X}^\top$ is wasteful. The
method of snapshots replaces the $n \times n$ eigenproblem with the smaller
correlation matrix, with $W = I$ in the Euclidean case,

```{math}
:label: eq:chapter9-snapshot-correlation

G = \mathbf{X}^\top W \mathbf{X}
\in \mathbb{R}^{m \times m}.
```

Solve

```{math}
:label: eq:chapter9-snapshot-eigenproblem

G v_j = \sigma_j^2 v_j,
\qquad
v_i^\top v_j = \delta_{ij}.
```

For each nonzero singular value $\sigma_j$, recover the spatial POD mode by

```{math}
:label: eq:chapter9-snapshot-mode-recovery

\phi_j = \frac{\mathbf{X}v_j}{\sigma_j}.
```

In the weighted case, these recovered modes satisfy

```{math}
:label: eq:chapter9-snapshot-orthogonality

\phi_i^\top W \phi_j = \delta_{ij}.
```

So the computational recipe is concrete:

1. assemble the snapshot matrix, and center it first if the fluctuations are
   the object of interest;
2. choose the metric $W$;
3. form $G = \mathbf{X}^\top W \mathbf{X}$;
4. compute its eigenpairs and sort them by descending $\sigma_j^2$;
5. recover the spatial modes with
   {eq}`eq:chapter9-snapshot-mode-recovery`.

The method of snapshots is especially attractive when $n \gg m$, because the
dominant cost is moved to an $m \times m$ problem.

## Worked Example: A Tiny Snapshot Matrix

Consider two snapshots in $\mathbb{R}^3$,

```{math}
:label: eq:chapter9-example-snapshots

\mathbf{x}_0 =
\begin{bmatrix}
1 \\ 0 \\ 1
\end{bmatrix},
\qquad
\mathbf{x}_1 =
\begin{bmatrix}
0 \\ 1 \\ 1
\end{bmatrix},
\qquad
\mathbf{X}
=
\begin{bmatrix}
1 & 0 \\
0 & 1 \\
1 & 1
\end{bmatrix}.
```

The method of snapshots uses the $2 \times 2$ Gram matrix

```{math}
:label: eq:chapter9-example-gram

G
=
\mathbf{X}^\top \mathbf{X}
=
\begin{bmatrix}
2 & 1 \\
1 & 2
\end{bmatrix}.
```

Its eigenvalues are $3$ and $1$, with orthonormal eigenvectors

```{math}
:label: eq:chapter9-example-right-vectors

v_1
=
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\ 1
\end{bmatrix},
\qquad
v_2
=
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\ -1
\end{bmatrix}.
```

Therefore the singular values are
$\sigma_1 = \sqrt{3}$ and $\sigma_2 = 1$. Recovering the left singular vectors
from {eq}`eq:chapter9-snapshot-mode-recovery` gives

```{math}
:label: eq:chapter9-example-pod-modes

\phi_1
=
\frac{\mathbf{X}v_1}{\sigma_1}
=
\frac{1}{\sqrt{6}}
\begin{bmatrix}
1 \\ 1 \\ 2
\end{bmatrix},
\qquad
\phi_2
=
\frac{\mathbf{X}v_2}{\sigma_2}
=
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\ -1 \\ 0
\end{bmatrix}.
```

The full SVD reconstruction is exact:

```{math}
:label: eq:chapter9-example-full-reconstruction

\mathbf{X}
=
\sqrt{3}\,\phi_1 v_1^\top + \phi_2 v_2^\top.
```

If only the leading mode is kept, the captured variance is

```{math}
:label: eq:chapter9-example-captured-variance

\gamma_1 = \frac{\sigma_1^2}{\sigma_1^2 + \sigma_2^2} = \frac{3}{4},
```

so one POD mode captures $75\%$ of the snapshot energy. The optimal rank-one
approximation error is

```{math}
:label: eq:chapter9-example-rank-one-error

\left\|\mathbf{X} - \mathbf{X}_1\right\|_F^2
=
\sigma_2^2
=
1.
```

This small example shows all of the main ideas at once:

- the POD modes are orthonormal spatial directions;
- the singular values rank their importance by captured energy;
- the method of snapshots recovers the same modes from the smaller matrix
  $\mathbf{X}^\top \mathbf{X}$.

## Energetic Modes Versus Dynamically Invariant Modes

POD modes are optimal for reconstruction in a chosen metric, not for advancing
the dynamics exactly. A POD mode need not satisfy an eigenvalue equation for a
state matrix $A$, a propagator $\Phi(t,t_0)$, or any other evolution operator.

That distinction matters in reduced modeling:

- a mode with large $\sigma_j^2$ is prominent in the data, but it may mix with
  other POD modes under time evolution;
- a dynamically invariant mode may be low energy if it is weakly excited in the
  sampled dataset;
- good compression and good prediction are related goals, but they are not the
  same goal.

This is why POD often appears alongside projection-based reduced-order models
or alongside dynamic decompositions such as DMD. POD supplies an efficient
basis for representing data; additional modeling assumptions are needed if one
wants a reduced system whose coordinates evolve approximately autonomously.
