import { Section, P, Eq, Callout, Item, Hl } from "./Prose";
import LinearFigure from "./LinearFigure";

export function Hero() {
  return (
    <header className="border-4 border-white-hot bg-char">
      <div className="flex items-stretch justify-between border-b-4 border-white-hot text-xs tracking-widest uppercase">
        <div className="px-4 py-3">CS 375 · Joseph Juchniewicz</div>
        <div className="bg-arc px-4 py-3 font-medium text-char">
          Feature lifting
        </div>
      </div>
      <div className="px-4 py-8 md:px-6 md:py-12">
        <h1 className="text-4xl leading-none font-medium tracking-tight uppercase md:text-7xl">
          A flat cut.
          <br />
          <span className="text-flame">A curved boundary.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed">
          How can a linear model draw a circle? It can&apos;t, until you bend
          the space it lives in. Five short sections, three things to play with.
        </p>
      </div>
    </header>
  );
}

export function Section1() {
  return (
    <Section n="01" title="What is linear classification?">
      <P>
        Binary classification means predicting which of two categories an
        observation belongs to from its measurable attributes. With two
        continuous inputs, every observation is a point (x₁, x₂) on a flat
        plane.
      </P>
      <P>A linear classifier makes the decision with a single straight line:</P>
      <Eq>w₁x₁ + w₂x₂ + b = 0</Eq>
      <ul className="space-y-2">
        <Item k="w">
          The weight vector <Hl>w = [w₁, w₂]ᵀ</Hl> is perpendicular to the line
          and points toward the positive class. The ratio of w₁ to w₂ sets the
          line&apos;s angle.
        </Item>
        <Item k="b">
          The bias <Hl>b</Hl> slides the line toward or away from the origin
          without changing its tilt.
        </Item>
      </ul>
      <P>
        To classify a point <Hl>x</Hl>, compute <Hl>wᵀx + b</Hl>. Positive puts
        it on the Class 1 side, negative on the Class 0 side. When two groups
        sit on opposite sides of a straight boundary, as below, a linear model
        works cleanly.
      </P>
      <LinearFigure />
    </Section>
  );
}

export function Section2Text() {
  return (
    <Section n="02" title="The problem: the non-linear stalemate">
      <P>
        Real data rarely splits into neat halves. Below is a concentric ring
        pattern: an inner cluster of Class 0 points completely encircled by a
        ring of Class 1 points.
      </P>
      <P>
        Drag the angle and offset sliders and try to find a line that separates
        them. Every point the line gets wrong is boxed in <Hl>yellow</Hl>. Then
        press <Hl>Find optimal line</Hl> to let a search try every angle and
        every offset.
      </P>
    </Section>
  );
}

export function Section2After() {
  return (
    <Section n="02" title="Why it stalls">
      <P>
        Even the best line stalls around 70%, nowhere near perfect. A line
        splits the plane into two open half-spaces, so it can never enclose an
        isolated region. To capture the inner cluster, any straight line has to
        slice through the outer ring and misclassify the points on the far side
        of it.
      </P>
      <P>
        This might suggest abandoning linear models for something more complex.
        But what if the limitation isn&apos;t the straight line itself, but the
        two-dimensional space we&apos;re forcing it to live in?
      </P>
    </Section>
  );
}

export function Section3Text() {
  return (
    <Section n="03" title="The concept: feature lifting">
      <P>
        If we can&apos;t separate the classes with a flat cut across the
        original plane, we can change the geometry by lifting the data into a
        higher dimension. Alongside the measured inputs (x₁, x₂), we engineer a
        new coordinate <Hl>z</Hl> computed from them:
      </P>
      <Eq>z = φ(x₁, x₂)</Eq>
      <P>
        Look at what distinguishes the classes here: Class 0 sits close to the
        origin and Class 1 sits farther away. We can use that by defining the
        new height as the squared distance from the center:
      </P>
      <Eq>z = x₁² + x₂²</Eq>
      <Callout label="Try it">
        <ol className="space-y-3">
          <Item k="1.">
            <b className="font-medium text-arc">Lift the data.</b> Drag{" "}
            <Hl>Lift intensity λ</Hl> (or press Play lift) to compute z = λ·(x₁²
            + x₂²). At λ = 0 everything lies flat at z = 0 and the classes are
            still tangled. As λ grows, points near the center barely move while
            the outer ring shoots upward. The flat disc warps into a bowl. The
            faint orange mesh is the surface z = φ(x₁, x₂). It&apos;s where the
            data now lives, not extra data: every point keeps its (x₁, x₂) and
            gains one computed coordinate.
          </Item>
          <Item k="2.">
            <b className="font-medium text-arc">Slice it.</b> Drag{" "}
            <Hl>Plane height c</Hl>. Once the flat plane sits between the base
            of the bowl and the rim, it separates the classes perfectly.
          </Item>
          <Item k="3.">
            <b className="font-medium text-arc">Watch the left panel.</b> The
            plane is perfectly flat, yet the boundary it carves in 2D is a
            circle: the curve where the plane meets the surface. Raise the plane
            and the circle grows. Lower it and the circle shrinks.
          </Item>
        </ol>
      </Callout>
    </Section>
  );
}

export function Section3After() {
  return (
    <Section n="03" title="Nothing nonlinear happened">
      <P>
        We got a curved boundary without a non-linear classifier. The classifier
        is still a flat plane. Only the space it lives in changed.
      </P>
    </Section>
  );
}

export function Section4Text() {
  return (
    <Section n="04" title='The "aha" moment: your turn'>
      <P>
        The right panel shows your data lifted by whichever feature you choose,
        with a flat plane you control:
      </P>
      <Eq>z = a·x₁ + b·x₂ + c</Eq>
      <P>
        The left panel shows the original 2D space. The boundary you see there
        is the <Hl>level set</Hl>: the curve where the plane meets the lifted
        surface z = φ(x₁, x₂). Equivalently, every point where
      </P>
      <Eq>φ(x₁, x₂) = a·x₁ + b·x₂ + c</Eq>
      <P>For the radial feature φ = x₁² + x₂², that becomes</P>
      <Eq>x₁² + x₂² − a·x₁ − b·x₂ − c = 0</Eq>
      <P>
        the equation of a circle centered at (a/2, b/2). The model still
        evaluates a linear function of its features (x₁, x₂, z). Because z is a
        non-linear function of the inputs, the boundary curves in the original
        space. A linear model is linear in its <Hl>features</Hl>, not
        necessarily in the original inputs.
      </P>
      <P>
        Use the playground below. The datasets run from easiest to hardest.
        Points the plane gets wrong are boxed in yellow.
      </P>
      <ol className="space-y-3">
        <Item k="1.">
          <b className="font-medium text-arc">Concentric rings.</b> Choose z =
          x₁² + x₂². A flat plane (a = b = 0) at the right height gives a circle
          centered at the origin, exactly as in Section 3.
        </Item>
        <Item k="2.">
          <b className="font-medium text-arc">Shifted rings.</b> Now the rings
          are centered away from the origin, and a flat plane still gives a
          circle centered at (0, 0), so it can&apos;t fit. Tilt the plane with{" "}
          <Hl>Tilt a</Hl> and <Hl>Tilt b</Hl>, or press <Hl>Auto-fit plane</Hl>.
          If the rings are centered at (p, q), then (x₁ − p)² + (x₂ − q)² = x₁²
          + x₂² − 2p·x₁ − 2q·x₂ + p² + q². That&apos;s the same feature plus{" "}
          <i>linear</i> terms, and linear terms are exactly what a tilted plane
          supplies. The right tilt is a ≈ 2p, b ≈ 2q.
        </Item>
        <Item k="3.">
          <b className="font-medium text-arc">Parallel stripes.</b> Radius fails
          here, because the stripes run vertically and the radius ignores that.
          Choose z = x₁², which depends only on the horizontal coordinate. A
          flat plane at height c cuts the parabolic trough at x₁ = ±√c, giving a
          pair of vertical lines in 2D that isolate the middle band.
        </Item>
        <Item k="4.">
          <b className="font-medium text-arc">XOR / checkerboard.</b> The
          classic stumbling block for linear models. No line separates opposite
          quadrants, and neither the radius nor x₁² or x₂² helps, because each
          is blind to the <i>combination</i> of signs a point has. Choose z =
          x₁·x₂. It lifts two opposite corners and pushes the other two down
          into a saddle. A flat plane at z = 0 splits the saddle cleanly, and
          its boundary in 2D is the two axes, x₁x₂ = 0.
        </Item>
      </ol>
      <ol start={5} className="space-y-3">
        <Item k="5.">
          <b className="font-medium text-arc">Spiral.</b> Try every feature.
          None of them work. The two arms wind around each other, so the class
          depends on angle and radius <i>together</i>, and every simple feature
          is blind to one of them. This is the catch with hand-crafted features,
          and it&apos;s where Section 5 picks up.
        </Item>
      </ol>
      <P>
        A note on the readout: accuracy shows the better of the two ways the
        plane can assign classes, so a correct plane with its sides swapped
        never reads as 5%. The text under the number says which side is class 1.
      </P>
    </Section>
  );
}

export function Section5() {
  return (
    <Section n="05" title="The limitation: the cost of hand-crafted features">
      <P>
        Feature lifting shows that linear models are more capable than they
        first appear, but hand-crafting features is not a universal solution.
      </P>
      <ul className="space-y-3">
        <Item k="—">
          <b className="font-medium text-arc">
            No guarantee a good feature exists.
          </b>{" "}
          Every dataset above had a feature that happened to work, partly
          because we chose datasets where one does. In practice you have to find
          the right feature, and for real data nothing says a simple one is out
          there.
        </Item>
        <Item k="—">
          <b className="font-medium text-arc">The risk of overfitting.</b> You
          can always design an exotic, high-frequency feature, such as a
          high-order polynomial or a stack of sinusoids, that snakes between
          every training point and reaches 100%. But such a boundary is fitting
          the random noise in your sample rather than the underlying pattern,
          and on unseen data it fails. That&apos;s what the held-out points in
          the playground are for: good feature engineering lowers{" "}
          <i>validation</i> error, not just training error.
        </Item>
        <Item k="—">
          <b className="font-medium text-arc">Combinatorial explosion.</b> Here
          we only had two inputs, so we could see everything. With hundreds or
          thousands of features you can&apos;t visualize the data, and
          generating every interaction term (xᵢxⱼ), polynomial power (xᵢᵈ), and
          trigonometric variant grows exponentially, demanding huge amounts of
          memory and computation.
        </Item>
      </ul>
    </Section>
  );
}
