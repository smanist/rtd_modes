# Model Truncation and Reduced-Order Modeling

Reduced-order modeling asks how to replace a high-dimensional dynamical system
with a smaller model that preserves the behavior needed for a specific task.
That task may be fast simulation, low-order control design, physical
interpretation, or frequency-response prediction over a limited band. The main
point of this chapter is that there is no single notion of the "best" reduced
model. Modal truncation, projection methods, Krylov reduction, POD reduction,
and balanced truncation keep different kinds of information.

## Why Truncate a Model?

Consider the stable linear time-invariant input-output system

```{math}
:label: eq:chapter8-full-system

\ddf{x}{t} = A x + B u,
\qquad
y = C x,
```

with state $x(t) \in \mathbb{R}^n$, input $u(t) \in \mathbb{R}^m$, and output
$y(t) \in \mathbb{R}^p$. A reduced-order model of dimension $r \ll n$ seeks a
smaller state $a(t) \in \mathbb{R}^r$ whose input-output behavior
approximates that of the full model.

Different reduction viewpoints emphasize different notions of relevance:

- modal truncation keeps dynamically important modes, often the slow or lightly
  damped ones;
- POD reduction keeps energetically dominant directions in data;
- Krylov reduction keeps transfer-function moments near selected frequencies or
  shifts;
- balanced truncation keeps states that are simultaneously controllable and
  observable.

These criteria are related, but they are not equivalent. A direction can be
energetically dominant in a dataset and still be poor for input-output
prediction. A mode can be slow and easy to visualize, yet nearly unobservable
at the output. Reduced-order modeling therefore begins by asking what should be
preserved.

## Projection Ansatz

Many reduced models can be written as projection methods. Choose a trial basis
$V_r \in \mathbb{R}^{n \times r}$ and approximate the full state by

```{math}
:label: eq:chapter8-projection-ansatz

x(t) \approx V_r a(t).
```

Substituting {eq}`eq:chapter8-projection-ansatz` into
{eq}`eq:chapter8-full-system` gives a residual

```{math}
:label: eq:chapter8-residual

r(t) = V_r \ddf{a}{t} - A V_r a - B u.
```

To close the reduced equations, require the residual to be orthogonal to a
test space spanned by $W_r \in \mathbb{R}^{n \times r}$ with
$W_r^\top V_r = I_r$:

```{math}
:label: eq:chapter8-petrov-galerkin-condition

W_r^\top r(t) = 0.
```

This yields the reduced model

```{math}
:label: eq:chapter8-reduced-lti

\ddf{a}{t} = A_r a + B_r u,
\qquad
y_r = C_r a,
```

with

```{math}
:label: eq:chapter8-reduced-matrices

A_r = W_r^\top A V_r,
\qquad
B_r = W_r^\top B,
\qquad
C_r = C V_r.
```

Two common special cases are:

- `Galerkin projection`: $W_r = V_r$, so the same basis is used for trial and
  test spaces.
- `Petrov-Galerkin projection`: $W_r \neq V_r$, which allows different trial
  and test spaces and is common in Krylov and nonsymmetric reductions.

If the columns of $V_r$ span an invariant subspace of $A$, then the reduced
dynamics reproduce the evolution inside that subspace exactly. Otherwise the
quality of the ROM depends on how well the chosen basis captures the relevant
state and input-output directions.

## Modal Truncation

Suppose $A$ is diagonalizable, $A = V \Lambda V^{-1}$, and the state is written
in modal coordinates. Modal truncation keeps only selected columns of $V$,
usually those associated with slow decay, low frequency, or dominant resonance.
This is the oldest reduced-order modeling idea: keep the modes one expects to
matter most dynamically and discard the rest.

For first-order systems, modal truncation is most natural when the modal basis
has a clear physical interpretation and the neglected modes are well separated
from the retained ones. Its limitation is equally important: a mode that is
slow or weakly damped is not automatically important for the chosen input and
output pair.

### Second-Order Modal Truncation

In structural dynamics, it is often better to reduce the second-order model
directly:

```{math}
:label: eq:chapter8-second-order

M \ddot{q}(t) + C \dot{q}(t) + K q(t) = B u(t).
```

If the undamped modes are collected in $\Phi$ and one keeps the first
$r$ columns $\Phi_r$, the displacement is approximated by

```{math}
:label: eq:chapter8-second-order-trial

q(t) \approx \Phi_r \eta_r(t).
```

Projecting onto the same modal basis gives

```{math}
:label: eq:chapter8-second-order-rom

M_r \ddot{\eta}_r + C_r \dot{\eta}_r + K_r \eta_r = B_r u,
```

where

```{math}
:label: eq:chapter8-second-order-rom-matrices

M_r = \Phi_r^\top M \Phi_r,
\qquad
C_r = \Phi_r^\top C \Phi_r,
\qquad
K_r = \Phi_r^\top K \Phi_r,
\qquad
B_r = \Phi_r^\top B.
```

For mass-normalized undamped modes, $M_r = I_r$ and
$K_r = \Omega_r^2$ is diagonal. The reduced coordinates are then modal
amplitudes. This is why low-frequency modal truncation is so effective for many
lightly damped structures.

### Static Correction and Residual Flexibility

Pure modal truncation can misrepresent forced response, especially at low
frequency, because the neglected high-frequency modes still contribute static
compliance. In the undamped case,

```{math}
:label: eq:chapter8-static-flexibility

K^{-1}
=
\Phi \Omega^{-2} \Phi^\top
\approx
\Phi_r \Omega_r^{-2} \Phi_r^\top + R_{\mathrm{f}},
```

where

```{math}
:label: eq:chapter8-residual-flexibility

R_{\mathrm{f}}
=
K^{-1} - \Phi_r \Omega_r^{-2} \Phi_r^\top
```

is the residual flexibility. A static-correction approximation augments the
truncated modal response by

```{math}
:label: eq:chapter8-static-correction

q(t) \approx \Phi_r \eta_r(t) + R_{\mathrm{f}} B u(t).
```

This does not restore the full omitted dynamics, but it does restore the
quasi-static effect of the neglected modes on forced displacement.

## Worked Example: A Two-State Input-Output System

To compare reduction criteria concretely, consider the stable two-state system

```{math}
:label: eq:chapter8-example-system

\ddf{x}{t}
=
\begin{bmatrix}
-1 & 0 \\
0 & -10
\end{bmatrix}
x
+
\begin{bmatrix}
1 \\
1
\end{bmatrix} u,
\qquad
y
=
\begin{bmatrix}
1 & 1
\end{bmatrix} x.
```

The first state is slow and the second is fast, but both are actuated and both
are measured. The transfer function is

```{math}
:label: eq:chapter8-example-transfer

G(s)
=
C (s I - A)^{-1} B
=
\frac{1}{s+1} + \frac{1}{s+10}
=
\frac{2 s + 11}{s^2 + 11 s + 10}.
```

This small model already shows the main ambiguity in reduction. If one keeps
only the slow state, one preserves the dominant time scale. If one reduces near
$s = 0$, one should also preserve the steady-state gain. If one reduces for
input-output control design, one should rank states by joint controllability
and observability.

## Modal Truncation on the Worked Example

The eigenvectors of $A$ are the coordinate axes, so modal truncation that keeps
the slow mode produces the one-state ROM

```{math}
:label: eq:chapter8-example-modal-rom

\ddf{a}{t} = -a + u,
\qquad
y_r = a,
```

with transfer function

```{math}
:label: eq:chapter8-example-modal-transfer

G_{\mathrm{mt}}(s) = \frac{1}{s+1}.
```

This retains the dominant pole at $-1$ and gives a reasonable long-time decay
rate, but it underestimates the zero-frequency gain:

```{math}
:label: eq:chapter8-example-modal-dc

G(0) = \frac{11}{10},
\qquad
G_{\mathrm{mt}}(0) = 1.
```

The missing contribution is the static effect of the fast state. In this
example, "slow" and "input-output important" are close, but they are not
identical.

## Krylov Subspaces and Moment Matching

The transfer function viewpoint starts from

```{math}
:label: eq:chapter8-transfer-general

G(s) = C (s I - A)^{-1} B.
```

If one wants accuracy near a chosen shift $s_0$, then one expands $G(s)$ in
moments about that point. Around $s_0 = 0$ for a stable system,

```{math}
:label: eq:chapter8-moment-expansion

G(s)
=
- C A^{-1} B
- s C A^{-2} B
- s^2 C A^{-3} B - \cdots.
```

The coefficients are built from repeated applications of $A^{-1}$ to the input
and output directions, which leads to Krylov subspaces such as

```{math}
:label: eq:chapter8-right-krylov

\mathcal{K}_r(A^{-1}, A^{-1} B)
=
\operatorname{span}\left\{
A^{-1} B,\,
A^{-2} B,\,
\dots,\,
A^{-r} B
\right\}.
```

The corresponding left space is built from $A^{-\top}$ and $C^\top$:

```{math}
:label: eq:chapter8-left-krylov

\mathcal{K}_r(A^{-\top}, A^{-\top} C^\top)
=
\operatorname{span}\left\{
A^{-\top} C^\top,\,
A^{-2\top} C^\top,\,
\dots,\,
A^{-r\top} C^\top
\right\}.
```

With appropriately paired left and right spaces, Petrov-Galerkin projection
matches the first transfer-function moments about the chosen shift. This is why
Krylov ROMs are often described as `moment-matching` or `frequency-local`
reductions.

For the worked example,

```{math}
:label: eq:chapter8-example-a-inverse-b

A^{-1} B
=
\begin{bmatrix}
-1 \\
-\frac{1}{10}
\end{bmatrix},
```

so a one-dimensional right Krylov basis at $s_0 = 0$ is aligned with the
low-frequency resolvent direction. Taking the normalized basis

```{math}
:label: eq:chapter8-example-krylov-basis

V_1 = W_1
=
\frac{1}{\sqrt{101}}
\begin{bmatrix}
10 \\
1
\end{bmatrix},
```

and projecting with {eq}`eq:chapter8-reduced-matrices` gives

```{math}
:label: eq:chapter8-example-krylov-rom

\ddf{a}{t}
=
-\frac{110}{101} a + \frac{11}{\sqrt{101}} u,
\qquad
y_r = \frac{11}{\sqrt{101}} a.
```

Its transfer function is

```{math}
:label: eq:chapter8-example-krylov-transfer

G_{\mathrm{k}}(s)
=
\frac{121/101}{s + 110/101}.
```

Now the steady-state gain matches exactly:

```{math}
:label: eq:chapter8-example-krylov-dc

G_{\mathrm{k}}(0) = \frac{11}{10} = G(0).
```

This ROM is not obtained by simply keeping the slow state. Instead, it keeps
the state combination that matters to the transfer function near the expansion
point. That is the characteristic strength of Krylov reduction.

## Controllability, Observability, and Balanced Truncation

For stable systems, controllability and observability are quantified by the
Gramians

```{math}
:label: eq:chapter8-gramians

A P + P A^\top + B B^\top = 0,
\qquad
A^\top Q + Q A + C^\top C = 0.
```

The controllability Gramian $P$ measures how easily state directions are
reached by the input, while the observability Gramian $Q$ measures how strongly
state directions appear in the output. Balanced coordinates are chosen so that
both become equal and diagonal:

```{math}
:label: eq:chapter8-balanced-coordinates

T^{-1} P T^{-\top}
=
T^\top Q T
=
\Sigma_{\mathrm{H}}
=
\operatorname{diag}(\sigma_{\mathrm{H},1},\dots,\sigma_{\mathrm{H},n}),
```

where $\sigma_{\mathrm{H},j}$ are the Hankel singular values. A state with a
large Hankel singular value is both easy to excite and easy to observe. A small
Hankel singular value indicates a state that contributes little to the
input-output map.

Balanced truncation keeps the balanced states associated with the largest
Hankel singular values. Its viewpoint is therefore different from that of
modal truncation:

- modal truncation ranks states by intrinsic dynamics;
- balanced truncation ranks them by joint input-output relevance.

For the worked example, solving {eq}`eq:chapter8-gramians` gives

```{math}
:label: eq:chapter8-example-gramians

P = Q
=
\begin{bmatrix}
\frac{1}{2} & \frac{1}{11} \\
\frac{1}{11} & \frac{1}{20}
\end{bmatrix}.
```

Because $P = Q$ in this symmetric example, the Hankel singular values are the
eigenvalues of $P$:

```{math}
:label: eq:chapter8-example-hsv

\sigma_{\mathrm{H},1} \approx 0.518,
\qquad
\sigma_{\mathrm{H},2} \approx 0.032.
```

The large gap shows that one balanced coordinate dominates the input-output
behavior. Balanced truncation would therefore keep one combined state direction
that is concentrated mostly on the slow state but still contains a correction
from the fast state. This is more consistent with the transfer function than
pure slow-mode truncation.

## POD Reduction and Balanced POD

POD reduction chooses a basis that best reconstructs a dataset in a chosen
inner product. If $\mathbf{X}$ is a snapshot matrix, the leading POD modes are
the left singular vectors of $\mathbf{X}$. A POD-Galerkin ROM then applies the
projection formula from {eq}`eq:chapter8-reduced-matrices` using those modes as
the trial basis.

This is powerful when the main goal is low reconstruction error or low-energy
state approximation, but it answers a different question from balanced
truncation. POD keeps energetically dominant directions in data. Balanced
truncation keeps directions that matter to the input-output operator. These
coincide only in special situations.

Two important bridges between these viewpoints are:

- `ERA` (Eigensystem Realization Algorithm), which identifies a balanced
  realization from impulse-response Markov parameters;
- `balanced POD`, which approximates balanced truncation from primal and
  adjoint snapshots when solving the full Gramian equations is too expensive.

Both methods aim to capture balanced, input-output-relevant coordinates without
forming dense Gramians explicitly for very large systems.

## Comparing Truncation Criteria

The main reduced-order modeling viewpoints can be summarized as follows.

| Method | What it preserves or optimizes | Typical strength | Typical blind spot |
| --- | --- | --- | --- |
| Modal truncation | slow, lightly damped, or resonant modes | interpretable dynamics and structure-preserving second-order reduction | may miss static or input-output effects of discarded modes |
| POD reduction | largest snapshot energy or variance | compact basis for reconstruction and simulation on sampled data | basis need not be dynamically invariant or input-output relevant |
| Krylov reduction | transfer-function moments near selected shifts | accurate local frequency response and rational approximation | accuracy is localized near chosen frequencies or interpolation points |
| Balanced truncation | states that are both controllable and observable | global input-output approximation with error metrics for stable LTI systems | less tied to direct physical modal interpretation |

The distinctions can also be phrased in terms of reduction criteria:

- `slow` means long-lived or low-frequency dynamical content;
- `energetic` means large variance or large norm contribution in data;
- `input-output relevant` means important to actuation and measurement;
- `frequency-local` means accurate near selected interpolation points or bands.

Reduced-order modeling is therefore not a single method but a family of
methods. The projection ansatz unifies many of them, yet the basis-selection
criterion changes what the reduced states mean and what the ROM does well.
