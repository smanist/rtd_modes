# Nonlinear Normal Modes

Linear modal analysis identifies invariant subspaces of a linearized system and
represents motion as a superposition of independent modal coordinates. For
nonlinear oscillations, that picture is only a leading-order approximation.
Oscillation frequency can depend on amplitude, distinct modes can interact, and
the relevant geometric objects are curved invariant sets rather than flat
subspaces. Nonlinear normal modes (NNMs) organize that behavior.

Consider an autonomous mechanical system near an equilibrium,

```{math}
:label: eq:chapter13-second-order-system

M \ddot{q}(t) + C \dot{q}(t) + K q(t) + f_{\mathrm{nl}}(q,\dot{q}) = 0,
```

where $q(t)\in\mathbb{R}^n$ and $f_{\mathrm{nl}}$ contains the nonlinear
restoring and damping terms. If $f_{\mathrm{nl}}=0$, Chapter 4 showed that the
motion decomposes into linear modal subspaces. When $f_{\mathrm{nl}}\neq 0$,
those subspaces generally lose exact invariance, and the geometry of modal
motion becomes amplitude dependent.

```{note}
The term "nonlinear normal mode" is used in two closely related ways. In older
structural-dynamics language it often means a family of synchronous periodic
motions. In the more geometric viewpoint it means an invariant modal manifold
that reduces to a linear modal subspace at small amplitude.
```

## Amplitude-Dependent Frequency and Backbone Curves

The simplest departure from linear theory is that the oscillation frequency can
change with amplitude. A standard hand-derivable example is the unforced
Duffing oscillator

```{math}
:label: eq:chapter13-duffing

\ddot{x} + \omega_0^2 x + \alpha x^3 = 0,
```

where $\omega_0>0$ and $\alpha$ measures the cubic stiffness.

To obtain a first approximation, assume the motion is nearly sinusoidal,

```{math}
:label: eq:chapter13-duffing-ansatz

x(t) \approx a \cos(\Omega t),
```

with amplitude $a$. Using
$\cos^3(\Omega t)=\tfrac{3}{4}\cos(\Omega t)+\tfrac{1}{4}\cos(3\Omega t)$,
equation {eq}`eq:chapter13-duffing` becomes

```{math}
:label: eq:chapter13-duffing-balance

\left(-\Omega^2 + \omega_0^2 + \frac{3}{4}\alpha a^2\right)
a \cos(\Omega t)
+ \frac{1}{4}\alpha a^3 \cos(3\Omega t)
\approx 0.
```

Neglecting the third harmonic gives the one-harmonic balance relation

```{math}
:label: eq:chapter13-duffing-frequency

\Omega^2(a)
\approx
\omega_0^2 + \frac{3}{4}\alpha a^2.
```

For weak nonlinearity this becomes

```{math}
:label: eq:chapter13-duffing-frequency-series

\Omega(a)
\approx
\omega_0 + \frac{3\alpha}{8\omega_0}a^2.
```

Thus:

- if $\alpha>0$, the oscillator is hardening and the frequency increases with
  amplitude;
- if $\alpha<0$, the oscillator is softening and the frequency decreases with
  amplitude.

The graph of oscillation frequency versus amplitude for a family of free
periodic motions is called a backbone curve. In linear theory the backbone is
flat because $\Omega(a)=\omega_0$ for all amplitudes. For nonlinear systems it
typically bends, which is one of the clearest signatures that the modal
structure is no longer purely linear.

## Rosenberg Nonlinear Normal Modes

For conservative multi-degree-of-freedom systems, Rosenberg defined a
nonlinear normal mode as a family of synchronous periodic motions in which all
coordinates reach extrema and pass through zero together. A common ansatz is

```{math}
:label: eq:chapter13-rosenberg-ansatz

q(t) = c\, p(t),
```

where $c\in\mathbb{R}^n$ is a fixed configuration vector and $p(t)$ is a
single scalar oscillation. Every component of the motion is then locked to the
same phase; only the overall amplitude evolves in time.

This mirrors the linear normal-mode ansatz, except that the scalar motion
$p(t)$ need not be harmonic and its frequency can depend on amplitude. In
symmetric conservative systems, the synchronous pattern can often be found by
substituting {eq}`eq:chapter13-rosenberg-ansatz` into the equations and
reducing the problem to one nonlinear scalar oscillator.

Rosenberg's definition is most natural when the motion remains periodic and the
system is conservative or only weakly damped. It becomes less flexible when
damping, asymmetry, or resonance destroy the simple synchronous picture.

## Invariant-Manifold Viewpoint

A more general modern viewpoint rewrites the dynamics in first-order form,

```{math}
:label: eq:chapter13-first-order

\dot{z} = f(z),
\qquad
z\in\mathbb{R}^{2n},
```

and looks for a low-dimensional invariant manifold $\mathcal{M}_j$ attached to
one modal family. If the linearization at the equilibrium has an oscillatory
eigenpair associated with mode $j$, then $\mathcal{M}_j$ is sought so that it
is tangent at the equilibrium to the corresponding two-dimensional linear modal
subspace.

One way to write this idea is to parameterize the manifold by reduced
coordinates $a$ and require

```{math}
:label: eq:chapter13-invariance-equation

z = W_j(a),
\qquad
\dot{a} = g_j(a),
\qquad
D W_j(a)\, g_j(a) = f(W_j(a)).
```

The last relation is the invariance equation: the full vector field evaluated
on the manifold must remain tangent to the manifold. Once $\mathcal{M}_j$ is
known, the reduced dynamics $\dot{a}=g_j(a)$ describe the motion restricted to
that modal family.

This viewpoint is broader than Rosenberg's. It can describe damped systems,
curved modal geometry, and amplitude-dependent phase dynamics even when the
motion is not a perfectly synchronous periodic orbit.

## Relation Between Linear Modal Subspaces and Nonlinear Modal Manifolds

The linear modal subspace is the small-amplitude tangent approximation to the
nonlinear modal manifold. Near equilibrium, nonlinear terms are weak, so the
curved manifold $\mathcal{M}_j$ is well approximated by the flat subspace from
the linearized problem. As the amplitude grows, curvature matters:

- the oscillation frequency shifts along the manifold, producing a backbone
  curve;
- the state no longer evolves in a perfectly flat eigenspace;
- superposition of independent modes ceases to be exact.

This relationship explains why linear modal analysis often works well at small
amplitude but degrades as nonlinear effects strengthen. Linear modes are not
wrong; they are the first local approximation to a more complicated invariant
geometry.

## Internal Resonance and Modal Interaction

Two nonlinear modal families can interact strongly when their frequencies
satisfy a near-commensurability such as
$2\omega_1 \approx \omega_2$ or $3\omega_1 \approx \omega_2$. This is called
internal resonance.

Internal resonance matters because the amplitude-dependent frequencies of the
modes can bring the system into resonance even when the small-amplitude linear
frequencies are not exactly commensurate. The consequence is slow energy
exchange between modal coordinates, loss of simple single-mode motion, and the
appearance of coupled branches of periodic or quasiperiodic response.

From the invariant-manifold viewpoint, internal resonance is the case where one
modal manifold can no longer be treated as effectively isolated. Resonant
coupling terms become dynamically important, and reduced models must keep the
interacting modal coordinates together.

## Exposure to Computational Methods

Several standard numerical viewpoints are used to compute NNMs and their
backbone curves:

- `shooting` searches for periodic orbits by matching the state after one
  period to the initial state;
- `harmonic balance` expands the periodic motion in a truncated Fourier series
  and solves for its coefficients and frequency;
- `continuation` traces a family of periodic orbits or invariant objects as
  amplitude or energy varies;
- `parameterization methods` solve the invariance equation
  {eq}`eq:chapter13-invariance-equation` directly for the modal manifold and
  its reduced dynamics.

The Duffing approximation in {eq}`eq:chapter13-duffing-frequency` is already a
tiny harmonic-balance calculation. Full computational workflows use the same
idea more systematically, but in higher dimension and with more harmonics or
more accurate manifold representations.
