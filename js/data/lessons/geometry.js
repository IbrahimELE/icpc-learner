/* Lessons — geometry I (integer primitives, hull) and geometry II (advanced). */
window.LESSONS = window.LESSONS || {};

LESSONS['geometry-1'] = { md: String.raw`
## Stay in integers
Coordinates in contests are almost always integers up to 10⁹. Every primitive below is exact with ''long long'' (products up to ~4·10¹⁸). Doubles are for the final answer (distances, areas/2) only. Precision bugs are the main reason geometry has a scary reputation — integers remove them.

## Vectors, cross and dot products
For vectors a = (x₁, y₁), b = (x₂, y₂):
- **cross(a, b)** = x₁y₂ − y₁x₂ = |a||b| sin θ: sign = turn direction (positive ⇒ b is counter-clockwise from a), magnitude = twice the triangle area.
- **dot(a, b)** = x₁x₂ + y₁y₂ = |a||b| cos θ: sign tells whether the angle is acute/right/obtuse; zero ⇔ perpendicular.
- **orientation(a, b, c)** = sign of cross(b − a, c − a): left turn (+), collinear (0), right turn (−). This single test powers everything: point on which side of a line, convex hull, segment intersection, point in polygon.

## Segments
- Point p on segment [a, b]: cross(a, b, p) = 0 and dot(p − a, p − b) ≤ 0.
- Segments [a, b] and [c, d] intersect (properly) iff orientation(a, b, c) and orientation(a, b, d) differ **and** orientation(c, d, a), orientation(c, d, b) differ; then handle the collinear/touching cases with on-segment tests ([[problem:cses-2190]]).
- Distance from a point to a segment: project with dot; clamp to the endpoints; if you need it exactly, compare squared distances.
- Line intersection point needs division → use doubles/fractions only at the end ([[problem:kattis-segmentdistance]] style).

## Polygons
- **Area** (shoelace): 2A = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ) — an integer; sign gives orientation ([[problem:cses-2191]]).
- **Point in polygon** (any simple polygon): ray casting with exact orientation tests, boundary checked first ([[problem:cses-2192]]). For convex polygons, binary search on the fan of triangles: O(log n).
- **Lattice points**: boundary points on an edge = gcd(|dx|, |dy|); Pick’s theorem A = I + B/2 − 1 gives interior points ([[problem:cses-2193]]).
- **Convexity check**: all consecutive orientations have the same sign (allowing zero if collinear points are permitted).

## Convex hull (Andrew’s monotone chain)
Sort points by (x, y), build the lower hull left to right popping while the last turn is not counter-clockwise, then the upper hull right to left. O(n log n). Use ''<= 0'' in the pop test to drop collinear points, ''< 0'' to keep them ([[problem:cses-2195]] wants them kept). Watch [[viz:convex-hull]]. Template ''convex-hull''.
Hull uses: diameter of a point set (farthest pair, via rotating calipers or brute force on hull vertices), minimum enclosing shapes, "is point inside the hull", Minkowski sums, and as a preprocessing step for many optimisation problems (the convex hull trick is the same idea in a DP setting).

## Angles without trigonometry
Sort points around a centre by angle: split by half-plane (above/below the x-axis), then compare with cross products — exact and faster than ''atan2''. Compare angles of vectors by cross sign when they are within 180°.

## Implementation habits
~~~cpp
struct P { ll x, y; P operator-(P o) const { return {x - o.x, y - o.y}; } ll cross(P o) const { return x * o.y - y * o.x; } ll dot(P o) const { return x * o.x + y * o.y; } };
ll cross(P a, P b, P c) { return (b - a).cross(c - a); }
~~~
Keep a tested geometry header in the reference document (template ''geometry-basics'') — deriving it under pressure is where mistakes happen. Print doubles with enough digits (''%.9f'') and beware −0.000.

:::pitfall
Overflow when coordinates reach 10⁹ and you add several products (use __int128 or reduce); treating touching segments as non-intersecting (or vice versa) against the statement; polygon vertices given clockwise (use |area|); degenerate inputs (all points collinear, n ≤ 2) breaking the hull.
:::

:::seerc
Expect about one geometry problem per SEERC, usually solvable with these primitives plus a sweep or a hull. Teams without a tested geometry header lose it to precision and edge cases; teams with one gain a problem many skip.
:::
` };

LESSONS['geometry-2'] = { md: String.raw`
## Rotating calipers
On a convex polygon, many "extreme pair" quantities can be found in O(n) by rotating two parallel support lines: the **diameter** (farthest pair of points — antipodal pairs), the **width** (minimum distance between parallel supporting lines), the minimum-area bounding rectangle, the maximum-area triangle with vertices on the hull. Implementation: for each hull edge, advance a second pointer while the area of the triangle (edge, pointer) increases.

## Closest pair of points
O(n log n): sort by x, sweep keeping the points within the current best distance d in a set ordered by y; for each new point only points with |Δy| ≤ d are candidates — O(1) of them on average. Or divide and conquer with the strip argument. Template ''closest-pair''; [[problem:cses-2194]]. [[viz:closest-pair]] shows the sweep.

## Sweep line for segments and rectangles
- **Any two segments intersect?** Sort endpoints by x; keep active segments in a set ordered by y at the sweep position; only neighbours in the set need intersection tests (Shamos–Hoey), O(n log n).
- **Union area of rectangles**: events at x-coordinates; between consecutive events the covered y-length is constant — maintain it with a segment tree over compressed y (count of covers per elementary interval), O(n log n).
- **Number of points in rectangles**: offline sweep with a BIT ([[topic:advanced-ds]]).

## Half-plane intersection
Intersect n half-planes (a·x + b·y + c ≥ 0): sort by angle, keep the result as a deque of lines, popping lines whose intersection point falls outside the new half-plane. O(n log n). Gives the feasible region of linear constraints (kernel of a polygon, "can a circle of radius r fit", visibility). Needs care with parallel lines and empty results.

## Circles
- Circle–line and circle–circle intersection: reduce to right triangles (project the centre onto the line; for two circles, the radical line). Template ''geometry-double''.
- Tangents from a point or between two circles: angles from atan2 plus the radius geometry.
- Minimum enclosing circle: Welzl’s randomized incremental algorithm, expected O(n) — short and reliable.
- Circle union area/arcs: angular sweep per circle.

## Minkowski sum
For convex polygons A and B, A ⊕ B = {a + b} is convex with ≤ |A| + |B| vertices, built by merging the edge sequences by angle. "Do two convex polygons intersect / what is the minimum translation to separate them" = does the origin lie in A ⊕ (−B).

## Precision management when doubles are unavoidable
- Prefer ''long double'' on GCC; compare with an epsilon scaled to the magnitude (1e-9 relative).
- Avoid ''acos''/''asin'' near ±1 (clamp the argument); prefer ''atan2''.
- Compute with exact integers as long as possible; convert once at the end.
- When binary searching on a real answer, iterate a fixed count.
- Print with ''setprecision(10)'' and check the tolerance stated in the problem (absolute or relative error).

## Reading a geometry problem
1. Draw it. Always. Two minutes of drawing beats twenty minutes of debugging.
2. Look for the convex hull: many "extreme"/"farthest"/"enclose" statements reduce to hull vertices.
3. Look for a sweep: "segments", "rectangles", "events" in one dimension.
4. Look for binary search on a real answer with a geometric feasibility check (radius, distance, time).
5. Check degeneracies: collinear points, coincident points, zero-length segments, horizontal/vertical lines.

:::seerc
Tier-3 geometry is rare at SEERC (perhaps one problem in two or three years), but the sweep-line and closest-pair patterns also appear outside geometry. Keep the doubles-based header printed; do not spend early study weeks here.
:::
` };
