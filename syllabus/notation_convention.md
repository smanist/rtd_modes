Below is a notation convention I would use for the course notes. It is designed to work across classical modal analysis, LTV/Floquet theory, POD/DMD, Koopman theory, SPOD/resolvent, stochastic/statistical notation, and model reduction.

# 1. Guiding principle

Use **font/style** to indicate the mathematical category:

| Style             | Meaning                                                                   | Examples                                                                  |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| italic lowercase  | variables, scalar components, vector-valued states when unambiguous       | (x(t)), (u(t)), (y(t)), (x_i)                                             |
| italic uppercase  | finite-dimensional matrices or matrix-valued functions                    | (A), (B), (C), (M), (K), (A(t))                                           |
| bold lowercase    | realized data vectors / numerical column vectors                          | (\mathbf{x}_k), (\mathbf{u}_k), (\boldsymbol{\eta}_k)                     |
| bold uppercase    | data matrices / finite sampled arrays                                     | (\mathbf{X}), (\mathbf{Y}), (\mathbf{\Psi}), (\mathbf{G})                 |
| Greek lowercase   | modal coordinates, eigenvalues, functions, parameters                     | (\lambda), (\omega), (\phi), (\varphi), (\eta), (\theta)                  |
| Greek uppercase   | covariance, spectra, diagonal modal matrices, operators when conventional | (\Sigma), (\Lambda), (\Phi), (\Psi)                                       |
| (\mathbb{\cdot})  | standard number spaces / probability expectation                          | (\mathbb{R}), (\mathbb{C}), (\mathbb{N}), (\mathbb{E})                    |
| (\mathcal{\cdot}) | operators, function spaces, manifolds, subspaces                          | (\mathcal{K}), (\mathcal{L}), (\mathcal{H}), (\mathcal{M}), (\mathcal{V}) |
| (\mathrm{\cdot})  | non-variable labels in subscripts/superscripts                            | (A_{\mathrm{r}}), (G_{\mathrm{DMD}}), (x_{\mathrm{eq}})                   |

The most important decision is this:

> Use ordinary italic (x(t)) for the mathematical state, but use bold (\mathbf{x}_k) for a sampled numerical observation/snapshot.

That avoids conflict between continuous theory and data matrices.

---

# 2. States, inputs, outputs, and components

Use

[
x(t)\in \mathbb{R}^n
]

for the mathematical state.

Use

[
u(t)\in \mathbb{R}^m,
\qquad
y(t)\in \mathbb{R}^p
]

for input and output.

Components are indexed by subscripts:

[
x_i(t)
]

means the (i)-th component of (x(t)).

For discrete-time systems, use

[
x_k = x(t_k)
]

when discussing the exact mathematical sequence, but use

[
\mathbf{x}_k
]

when discussing a stored numerical snapshot.

So:

[
x_k
]

is a mathematical state at time step (k), while

[
\mathbf{x}_k
]

is the (k)-th data column in a dataset.

This distinction is useful in DMD/POD.

---

# 3. Data matrices and observations

For snapshot data, use bold uppercase matrices:

[
\mathbf{X}
==========

\begin{bmatrix}
\mathbf{x}_0 & \mathbf{x}*1 & \cdots & \mathbf{x}*{m-1}
\end{bmatrix},
]

[
\mathbf{Y}
==========

\begin{bmatrix}
\mathbf{x}_1 & \mathbf{x}*2 & \cdots & \mathbf{x}*{m}
\end{bmatrix}.
]

For DMD:

[
\mathbf{Y}\approx A\mathbf{X}
]

or, if emphasizing the data-fitted matrix,

[
\mathbf{A}_{\mathrm{DMD}}
=========================

\mathbf{Y}\mathbf{X}^{\dagger}.
]

Use (\mathbf{X}) for data matrices and (X) only for abstract sets or random variables if needed. To avoid ambiguity, I would avoid plain (X) for data.

For multiple trajectories, use parenthesized superscripts:

[
\mathbf{x}^{(r)}_k
]

means snapshot at time index (k) from realization/trajectory (r).

Avoid using (x_i) for the (i)-th observation, because (x_i) is already the (i)-th component.

Recommended:

[
x_i = \text{(i)-th component},
\qquad
\mathbf{x}_k = \text{(k)-th snapshot}.
]

---

# 4. Matrices and finite-dimensional operators

Use italic uppercase letters for matrices:

[
A,\ B,\ C,\ D,\ M,\ K,\ C_d,\ A(t).
]

Examples:

[
\dot{x}=Ax+Bu,
\qquad
y=Cx+Du.
]

For second-order systems:

[
M\ddot{q}+C\dot{q}+Kq=f.
]

Suggested conventions:

| Symbol         | Meaning                                                            |
| -------------- | ------------------------------------------------------------------ |
| (A)            | state matrix / linear generator matrix                             |
| (B)            | input matrix                                                       |
| (C)            | output matrix, except in statistics where use (C_x) for covariance |
| (D)            | feedthrough matrix                                                 |
| (M)            | mass matrix                                                        |
| (K)            | stiffness matrix; avoid using (K) for Koopman                      |
| (G(s))         | transfer function                                                  |
| (R(z)), (R(s)) | resolvent or reduced dynamics, depending on context                |

Because (K) is commonly stiffness in mechanics, I would avoid using (K) for the Koopman operator. Use (\mathcal{K}) instead.

---

# 5. Operators

Use calligraphic letters for infinite-dimensional or abstract operators:

| Symbol                       | Meaning                                                 |
| ---------------------------- | ------------------------------------------------------- |
| (\mathcal{K})                | Koopman operator                                        |
| (\mathcal{K}^t)              | Koopman semigroup                                       |
| (\mathcal{L})                | generator of Koopman semigroup or differential operator |
| (\mathcal{P})                | Perron-Frobenius / transfer operator, if mentioned      |
| (\mathcal{R}(z))             | abstract resolvent operator                             |
| (\mathcal{C})                | covariance/correlation operator                         |
| (\mathcal{A})                | abstract linear operator, especially PDE generator      |
| (\mathcal{B}), (\mathcal{C}) | input/output operators in infinite-dimensional systems  |

For Koopman:

[
\mathcal{K}^t g = g\circ \Phi^t.
]

For the generator:

[
\mathcal{L}g
============

f\cdot \nabla g.
]

For the resolvent:

[
\mathcal{R}(z;\mathcal{A})
==========================

(zI-\mathcal{A})^{-1}.
]

For finite-dimensional resolvent, use

[
R(z;A)=(zI-A)^{-1}.
]

This separates abstract operators from matrices.

---

# 6. Function spaces and manifolds

Use (\mathcal{\cdot}) for general spaces:

[
\mathcal{H},\quad
\mathcal{V},\quad
\mathcal{U},\quad
\mathcal{M}.
]

Use (\mathbb{\cdot}) for standard spaces:

[
\mathbb{R}^n,\quad
\mathbb{C}^n,\quad
\mathbb{T}^d.
]

Suggested conventions:

| Symbol                     | Meaning                                                 |
| -------------------------- | ------------------------------------------------------- |
| (\mathcal{H})              | Hilbert space of observables or states                  |
| (\mathcal{V})              | trial subspace                                          |
| (\mathcal{W})              | test subspace                                           |
| (\mathcal{M})              | manifold / state space                                  |
| (T_x\mathcal{M})           | tangent space at (x)                                    |
| (L^2(\mathcal{M},\mu))     | square-integrable functions with measure (\mu)          |
| (\mathcal{D}(\mathcal{L})) | domain of operator (\mathcal{L})                        |
| (\mathcal{S})              | Schwartz/test space, if rigged-space discussion appears |
| (\mathcal{S}')             | dual/distribution space                                 |

For rigged Hilbert space, use

[
\mathcal{S}\subset \mathcal{H}\subset \mathcal{S}'.
]

---

# 7. Modes and modal coordinates

Use Greek letters for modes and modal quantities.

## Eigenmodes

Right eigenvectors:

[
A\phi_j=\lambda_j\phi_j.
]

Left eigenvectors:

[
\psi_j^*A=\lambda_j\psi_j^*.
]

Biorthogonality:

[
\psi_i^*\phi_j=\delta_{ij}.
]

Use:

| Symbol      | Meaning                         |
| ----------- | ------------------------------- |
| (\lambda_j) | eigenvalue                      |
| (\phi_j)    | right eigenvector / mode shape  |
| (\psi_j)    | left eigenvector / adjoint mode |
| (\omega_j)  | natural frequency               |
| (\zeta_j)   | damping ratio                   |
| (\eta_j(t)) | modal coordinate                |
| (\Phi_r)    | matrix of retained modes        |
| (\Psi_r)    | matrix of adjoint/test modes    |

For modal expansion:

[
x(t)\approx \sum_{j=1}^r \phi_j \eta_j(t)
=========================================

\Phi_r \eta(t).
]

Here:

[
\Phi_r =
\begin{bmatrix}
\phi_1 & \cdots & \phi_r
\end{bmatrix}.
]

Use (\eta(t)) for modal coordinates to avoid conflict with the physical state (x(t)).

---

# 8. POD, DMD, and SVD notation

For SVD:

[
\mathbf{X}=U\Sigma V^*.
]

Use:

| Symbol     | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| (U)        | left singular vectors / POD modes in data coordinates |
| (\Sigma)   | singular values                                       |
| (V)        | right singular vectors / temporal coefficients        |
| (\sigma_j) | singular value                                        |
| (r)        | truncation rank                                       |

For POD modes,

[
u_j = \text{POD mode},
]

and reserve (\phi_j) for eigenmodes when possible.

For DMD:

[
\mathbf{Y}\approx \mathbf{A}_{\mathrm{DMD}}\mathbf{X}.
]

DMD eigenpairs:

[
\mathbf{A}_{\mathrm{DMD}}\phi_j^{\mathrm{DMD}}
==============================================

\lambda_j^{\mathrm{DMD}}\phi_j^{\mathrm{DMD}}.
]

Use superscripts to disambiguate only when necessary:

[
\lambda_j^{\mathrm{DMD}},
\qquad
\phi_j^{\mathrm{DMD}}.
]

Continuous-time DMD eigenvalues:

[
\alpha_j
========

\frac{1}{\Delta t}\log \lambda_j^{\mathrm{DMD}}.
]

Use (\alpha_j) for continuous-time growth/oscillation rates if (\lambda_j) is already used for discrete eigenvalues.

---

# 9. Koopman notation

Use:

[
\mathcal{K}^t g = g\circ \Phi^t
]

for continuous-time dynamics, and

[
\mathcal{K}g=g\circ F
]

for discrete-time dynamics.

Koopman eigenfunctions:

[
\mathcal{K}^t\varphi_j
======================

e^{\lambda_j t}\varphi_j,
]

or for maps,

[
\mathcal{K}\varphi_j
====================

\lambda_j\varphi_j.
]

Use:

| Symbol          | Meaning                                |
| --------------- | -------------------------------------- |
| (g)             | observable                             |
| (\varphi_j)     | Koopman eigenfunction                  |
| (\lambda_j)     | Koopman generator eigenvalue           |
| (\mu_j)         | Koopman eigenvalue for maps, if needed |
| (\mathcal{K}^t) | Koopman semigroup                      |
| (\mathcal{L})   | Koopman generator                      |

To avoid ambiguity between continuous-time and discrete-time eigenvalues, use:

[
\mathcal{L}\varphi_j=\lambda_j\varphi_j
]

and

[
\mathcal{K}^{\Delta t}\varphi_j
===============================

\mu_j\varphi_j,
\qquad
\mu_j=e^{\lambda_j\Delta t}.
]

For EDMD dictionaries:

[
\psi(x)
=======

\begin{bmatrix}
\psi_1(x)\
\vdots\
\psi_N(x)
\end{bmatrix}.
]

Use (\psi_j) for dictionary functions and (\varphi_j) for Koopman eigenfunctions.

Data dictionary matrix:

[
\mathbf{\Psi}_X
===============

\begin{bmatrix}
\psi(\mathbf{x}*0) & \cdots & \psi(\mathbf{x}*{m-1})
\end{bmatrix}.
]

---

# 10. LTV, Floquet, Lyapunov notation

For LTV systems:

[
\dot{x}=A(t)x.
]

State-transition matrix:

[
\Phi(t,t_0).
]

and

[
V_r
]

for projection bases when possible.

Recommended:

| Symbol                     | Meaning                           |
| -------------------------- | --------------------------------- |
| (\Phi(t,t_0))              | state-transition matrix           |
| (M_F)                      | monodromy matrix                  |
| (\rho_j)                   | Floquet multiplier                |
| (\nu_j)                    | Floquet exponent                  |
| (v_j(t))                   | Floquet mode                      |
| (\lambda_j^{\mathrm{Lya}}) | Lyapunov exponent                 |
| (\ell_j(t))                | Lyapunov vector or CLV, if needed |

For Floquet:

[
M_F=\Phi(t_0+T,t_0).
]

[
M_F v_j = \rho_j v_j.
]

[
\nu_j=\frac{1}{T}\log \rho_j.
]

Use (\rho_j) for Floquet multipliers.

For Lyapunov exponents, use

[
\chi_j
]

for Lyapunov exponents because it avoids overloading (\lambda).

Thus:

[
\chi_j
======

\lim_{t\to\infty}
\frac{1}{t}
\log
|D\Phi^t(x_0)v_j|.
]

Use (\ell_j(t)) for covariant Lyapunov vectors.

---

# 11. Stochastic variables and statistical quantities

Use uppercase roman or sans-serif cautiously. A clean convention:

| Symbol               | Meaning                                         |
| -------------------- | ----------------------------------------------- |
| (X)                  | random variable / random state                  |
| (x)                  | realization                                     |
| (\mathbf{x}_k)       | observed numerical sample                       |
| (\mu)                | probability measure / invariant measure         |
| (p(x))               | probability density                             |
| (\mathbb{E})         | expectation                                     |
| (\operatorname{Var}) | variance                                        |
| (\operatorname{Cov}) | covariance                                      |
| (C_x)                | covariance matrix/operator of (x)               |
| (R_x(\tau))          | autocorrelation function                        |
| (S_x(\omega))        | power spectral density / cross-spectral density |

Example:

[
C_x
===

\mathbb{E}\left[(X-\bar{x})(X-\bar{x})^*\right].
]

Use (X) only for a random variable when not discussing data matrices. Since (\mathbf{X}) is the snapshot matrix, the boldface distinction matters.

For empirical mean:

[
\bar{\mathbf{x}}
================

\frac{1}{m}\sum_{k=0}^{m-1}\mathbf{x}_k.
]

For centered data:

[
\widetilde{\mathbf{x}}_k
========================

\mathbf{x}_k-\bar{\mathbf{x}},
\qquad
\widetilde{\mathbf{X}}
======================

\begin{bmatrix}
\widetilde{\mathbf{x}}*0 & \cdots & \widetilde{\mathbf{x}}*{m-1}
\end{bmatrix}.
]

---

# 12. SPOD and frequency-domain notation

Use:

| Symbol                | Meaning                       |
| --------------------- | ----------------------------- |
| (\omega)              | angular frequency             |
| (f)                   | ordinary frequency, if needed |
| (\widehat{x}(\omega)) | Fourier transform             |
| (S_x(\omega))         | cross-spectral density        |
| (\phi_j(\omega))      | SPOD mode                     |
| (\lambda_j(\omega))   | SPOD eigenvalue               |
| (R(i\omega;A))        | resolvent matrix              |
| (\sigma_j(\omega))    | resolvent singular value      |
| (u_j(\omega))         | resolvent response mode       |
| (v_j(\omega))         | resolvent forcing mode        |

SPOD eigenproblem:

[
S_x(\omega)\phi_j(\omega)
=========================

\lambda_j(\omega)\phi_j(\omega).
]

Resolvent:

[
R(i\omega;A)
============

(i\omega I-A)^{-1}.
]

SVD:

[
R(i\omega;A)
============

\sum_j
\sigma_j(\omega)
u_j(\omega)v_j(\omega)^*.
]

Use (\lambda_j(\omega)) for SPOD eigenvalues and (\sigma_j(\omega)) for resolvent gains. This avoids confusing energy with amplification.

---

# 13. Reduced-order modeling notation

Use:

[
x\approx V_r a.
]

Here:

| Symbol | Meaning               |
| ------ | --------------------- |
| (V_r)  | trial/reduction basis |
| (W_r)  | test basis            |
| (a(t)) | reduced coordinates   |
| (A_r)  | reduced state matrix  |
| (B_r)  | reduced input matrix  |
| (C_r)  | reduced output matrix |
| (r)    | reduced dimension     |
| (n)    | full dimension        |

Galerkin:

[
A_r=V_r^*AV_r.
]

Petrov-Galerkin:

[
A_r=W_r^*AV_r.
]

Balanced truncation:

[
W_c,\quad W_o
]

for controllability and observability Gramians.

Use:

[
\sigma_j^{\mathrm{H}}
]

for Hankel singular values if there is risk of confusion with ordinary singular values.

Balanced coordinates:

[
W_c=W_o=\Sigma_{\mathrm{H}}.
]

---

# 14. Subscripts and superscripts

This is where consistency matters most.

## Subscripts

Use subscripts for:

| Notation       | Meaning                         |
| -------------- | ------------------------------- |
| (x_i)          | component (i) of vector (x)     |
| (\mathbf{x}_k) | snapshot at time index (k)      |
| (\phi_j)       | mode (j)                        |
| (A_r)          | reduced matrix of dimension (r) |
| (V_r)          | basis with (r) columns          |
| (t_k)          | (k)-th time sample              |
| (\lambda_j)    | (j)-th eigenvalue               |

If both component and time are needed:

[
x_i(t_k)
]

or

[
(\mathbf{x}_k)_i.
]

Avoid (x_{i,k}) unless writing code-like expressions.

---

## Superscripts

Use superscripts for:

| Notation                 | Meaning                       |
| ------------------------ | ----------------------------- |
| (x^{(r)})                | (r)-th trajectory/realization |
| (A^*)                    | conjugate transpose / adjoint |
| (A^T)                    | transpose                     |
| (A^{-1})                 | inverse                       |
| (A^\dagger)              | Moore-Penrose pseudoinverse   |
| (\mathcal{K}^t)          | time-(t) Koopman operator     |
| (\Phi^t)                 | time-(t) flow map             |
| (\lambda^{\mathrm{DMD}}) | DMD eigenvalue label          |

Use parenthesized superscripts for labels or realizations:

[
x^{(r)}
]

instead of

[
x^r
]

when it is not a power.

Use roman superscripts for method labels:

[
\lambda_j^{\mathrm{DMD}},
\qquad
\phi_j^{\mathrm{POD}},
\qquad
A^{\mathrm{EDMD}}.
]

---

# 15. Brackets and inner products

Use angle brackets for inner products:

[
\langle f,g\rangle_{\mathcal{H}}.
]

For finite-dimensional weighted inner products:

[
\langle x,y\rangle_M
====================

x^*My.
]

For expectation:

[
\mathbb{E}[X].
]

For function application, use parentheses:

[
g(x).
]

For operator application, either

[
\mathcal{K}g
]

or

[
(\mathcal{K}g)(x).
]

Use the second form when clarity is needed.

---

# 16. Recommended notation table for the notes

A compact style guide could begin with this table:

| Quantity                | Recommended notation |
| ----------------------- | -------------------- |
| continuous-time state   | (x(t))               |
| discrete-time state     | (x_k)                |
| numerical snapshot      | (\mathbf{x}_k)       |
| component of state      | (x_i)                |
| snapshot matrix         | (\mathbf{X})         |
| shifted snapshot matrix | (\mathbf{Y})         |
| input/output            | (u(t), y(t))         |
| state matrix            | (A)                  |
| input/output matrices   | (B,C,D)              |
| mass/damping/stiffness  | (M,C,K)              |
| mode shape/eigenvector  | (\phi_j)             |
| adjoint mode            | (\psi_j)             |
| eigenvalue              | (\lambda_j)          |
| natural frequency       | (\omega_j)           |
| modal coordinate        | (\eta_j(t))          |
| modal basis             | (\Phi_r) or (V_r)    |
| reduction basis         | (V_r)                |
| test basis              | (W_r)                |
| reduced state           | (a(t))               |
| Koopman operator        | (\mathcal{K}^t)      |
| Koopman generator       | (\mathcal{L})        |
| observable              | (g)                  |
| Koopman eigenfunction   | (\varphi_j)          |
| state-transition matrix | (\Phi(t,t_0))        |
| monodromy matrix        | (M_F)                |
| Floquet multiplier      | (\rho_j)             |
| Floquet exponent        | (\nu_j)              |
| Lyapunov exponent       | (\chi_j)             |
| CLV                     | (\ell_j(t))          |
| covariance              | (C_x)                |
| cross-spectral density  | (S_x(\omega))        |
| resolvent               | (R(i\omega;A))       |
| Hilbert space           | (\mathcal{H})        |
| manifold                | (\mathcal{M})        |
| invariant measure       | (\mu)                |
| expectation             | (\mathbb{E})         |

---

# 17. One important recommendation

I would avoid trying to make **italic versus bold** mean “scalar versus vector” everywhere. In theoretical dynamics, it is common and cleaner to write

[
x(t)\in \mathbb{R}^n
]

without boldface. Then use boldface mainly for **data arrays and numerical samples**.

So the convention becomes:

* (x(t)): abstract mathematical state, possibly vector-valued.
* (x_i(t)): component.
* (\mathbf{x}_k): numerical snapshot.
* (\mathbf{X}): snapshot matrix.

This is especially good for a course that moves between differential equations, operators, and data.

---

# 18. Suggested rule of thumb for students

A short version for the notes:

> Plain italic symbols describe mathematical objects in the model.
> Bold symbols describe sampled numerical data or assembled arrays.
> Calligraphic symbols describe operators and spaces.
> Blackboard-bold symbols describe standard number spaces or expectations.
> Subscripts index components, time steps, or modes; parenthesized superscripts index realizations or labels.

This should be robust enough for the whole course.
