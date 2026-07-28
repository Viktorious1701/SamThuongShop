# PRD Quality Review — SamThuongShop

**Gate verdict: PASS-WITH-FIXES**

## Overall verdict

This is a genuinely good lean PRD: it has a clear thesis ("shown and sold together"), a fixed Glossary that most FRs honor verbatim, testable consequences on nearly every FR, honest Non-Goals, real counter-metrics, and an Assumptions Index that is ~95% round-tripped. It is right-sized for a single-operator Vietnam store and does not drown in enterprise ceremony. What holds it back from a clean PASS is a small number of real defects in the physical-vs-digital seam that *would* mislead downstream UX and architecture: a direct contradiction about print stock, an under-specified Cash-on-Delivery (COD) lifecycle, and a bilingual requirement that lives only in NFRs with no FR to anchor a data model or a language toggle. None are structural; all are surgical fixes. Fix the three High items and this is green.

## 1. Decision-readiness — strong

Decisions are stated as decisions, not smuggled in as "considerations": guest checkout is the default with Accounts optional (FR-5, FR-24); bank-transfer confirmation is explicitly manual by the Operator in v1 (FR-9); prints are made-to-order with no stock (FR-11, FR-20). Trade-offs name what is given up — "don't chase volume by adding manual overhead" (SM-C1) is a real tension surfaced, not smoothed. The Open Questions (§8) are actually open (payment gateway choice, shipping-rate model, expiry policy, concrete Variant options) and each is tied to the FRs it drives. `[NOTE FOR PM]` on launch promos (§6.2) sits at a real deferral. No complaints here.

## 2. Substance over theater — strong

No persona theater: two named protagonists (Lan, Minh) plus an unnamed portfolio visitor and the Operator — four JTBD, three UJs, well under the four-persona smell threshold, and each drives real FRs. The Vision (§1) is product-specific — it names the exact wedge ("a generic marketplace listing sells prints but tells no story; a portfolio site tells the story but takes no money") and could not be swapped into another PRD. Counter-metrics (SM-C1 operator effort, SM-C2 file leakage) are earned, not decorative. Minor: a couple of NFRs lean on adjectives (see §4 findings) but that is not theater, just imprecision.

## 3. Strategic coherence — strong

There is a thesis and the features serve it. Prioritization follows the bet (first real sales of *both* a print and a digital file = SM-1, catalog live = SM-2), not "what's easy first." Success Metrics validate the thesis rather than measuring vanity activity — SM-3 (digital delivery reliability) and SM-4 (portfolio→conversion) map to the "show and sell together" arc. Scope kind is coherently revenue-plus-experience with matching scope logic. Reads as a product, not a backlog.

## 4. Done-ness clarity — adequate

Most FRs carry at least one testable consequence, and several are genuinely sharp (FR-2: "the un-watermarked file is not accessible before purchase"; FR-7: "the total the Customer approves equals the amount charged"; FR-13's link/watermark conditions). This is the PRD's strongest craft. The gaps below are where an engineer would *not* know what done means.

### Findings
- **high** COD order lifecycle is undefined (§4.3 FR-8, §4.4) — COD is an enabled Payment Method for physical orders, but nothing says how or when a COD Order becomes *Paid*. FR-8 says "on successful payment, the Order moves to *Paid*," which is an online-payment concept; COD has no online success event. An engineer cannot tell whether a COD Order sits at *Pending Payment* until delivery, or moves straight to *Processing*, or is marked *Paid* by the Operator after cash is collected. *Fix:* add an FR-8 consequence stating the COD status path (e.g. COD Order → *Processing* on placement, Operator marks *Paid/Completed* on cash receipt) so fulfillment and reporting are unambiguous.
- **high** Digital delivery timing in a mixed COD cart is unhandled (§4.2 FR-6, §4.3 FR-8, §4.5 FR-13) — FR-6 permits a mixed Cart (print + digital); FR-8 offers COD whenever the Cart contains a Physical Print; FR-13 releases the Download Link only when the Order is *Paid*. Under COD the Order is not *Paid* until the courier delivers, so a buyer of a mixed COD cart would wait days for a "digital download delivered instantly." Either the interaction is intended (and should be stated) or COD should be blocked on mixed/digital-containing carts. *Fix:* add a consequence to FR-8 or FR-13 resolving digital delivery under COD — most likely "COD is not offered when the Cart contains any Digital Download," mirroring the existing physical-only COD rule.
- **medium** Digital-only Orders have no defined terminal status (§3 Order Status, §4.4 FR-10–FR-11) — the status set (*Pending Payment / Paid / Processing / Shipped / Completed / Cancelled*) is physical-shaped. FR-11's status advancement (*Paid → Processing → Shipped → Completed*) is explicitly about prints; nothing says how a digital-only Order reaches *Completed* after the link is delivered. *Fix:* state that a digital-only Order transitions *Paid → Completed* on link issuance (FR-13), so its lifecycle is closed.
- **low** Two NFRs are adjective-bound (§10) — "image-heavy pages load *acceptably* on mobile networks" and (FR-16) galleries "at *good quality*" have no threshold. Lean is fine, but a soft target ("largest product image renders within N s on 4G" / a max image weight) would give architecture something to hit. *Fix:* add one rough bound or explicitly mark as UX-to-set.

## 5. Scope honesty — strong

Omissions are explicit and load-bearing: Non-Goals (§5) rules out marketplace, POD, international/multi-currency, native app, subscriptions, commercial licensing, and social features; §6.2 defers discounts, reviews, faceted search, carrier integration. `[NON-GOAL for MVP]` and `[NOTE FOR PM]` land at real omissions. Open-items density (18 assumptions, 4 Open Questions, 1 PM note) is high in absolute terms but entirely appropriate for a green-field launch PRD where providers and policies are deliberately deferred to architecture — and each assumption is explicitly flagged for confirmation. This is honest de-scoping, not silent.

### Findings
- **medium** No FR anchors Operator-set shipping fees (§4.2 FR-6/FR-7, §4.7 FR-19–FR-22, §8 Q2) — FR-6/FR-7 display a shipping fee and Open Question 2 honestly defers the *rate model*, but the Operator Admin FRs never mention configuring shipping rates at all. Architecture has no FR to hang a shipping-config surface on. *Fix:* add a thin FR (or FR-21/FR-19 consequence) that the Operator can set the shipping fee/rule, even if the exact model is TBD per Q2.

## 6. Downstream usability — adequate

Glossary is present and disciplined; FR/UJ/SM IDs are contiguous (FR-1–FR-24, UJ-1–3, SM-1–4 + SM-C1/C2), unique, and cross-references (FR-11/12/14, FR-6/7/13 in SMs) resolve. Sections largely stand alone. The blocker for clean source-extraction is the stock contradiction below, which would send UX and architecture in opposite directions.

### Findings
- **high** Contradiction: UJ-1 has an out-of-stock path the rest of the PRD forbids (§2.3 UJ-1 vs §3 Physical Print, §4.1 FR-2, §4.4 FR-11, §4.7 FR-20) — UJ-1's edge case reads "if the print is out of stock, the option is shown as unavailable and she cannot add it to the cart," but the Glossary ("Made to order — no stock limit"), FR-2 ("made to order and purchasable whenever its Product is published"), FR-11 ("no stock to decrement"), and FR-20 ("no stock to manage") all state prints can never be out of stock. UX would build an out-of-stock state that the FRs say cannot occur. *Fix:* replace UJ-1's edge case with the model-consistent one — the print is unavailable only when its Product is *unpublished* — and delete the stock language.
- **medium** Assumptions Index roundtrip miss (§7 SM-4 vs §9) — `[ASSUMPTION: baseline set post-launch.]` on SM-4 is a live inline assumption not carried into the Assumptions Index (§9). Every other inline assumption round-trips; this one is orphaned. *Fix:* add an §9 entry, e.g. "§7 — SM-4 portfolio-engagement baseline is set post-launch."
- **low** Glossary/Account re-download tension (§3 Account vs §4.5 FR-14) — the Glossary says an Account "enables Digital Download re-download," implying it is the mechanism, but FR-14's assumption also lets guests request a fresh Download Link via Order reference. *Fix:* soften the Glossary to "an Account *stores* re-downloadable purchases" so it doesn't read as the exclusive path.
- **low** Minor term drift — "product page" (UJ-1) vs the Glossary-adjacent "product detail page" (FR-2); "bird imprint pictures" (§1) vs "bird images" elsewhere. Cosmetic; normalize on the FR-2 term.

## 7. Shape fit — strong (with one FR-coverage gap)

The hybrid shape is right: buyer-facing UJs with named protagonists (Lan, Minh) are load-bearing for the storefront, while the Operator side is correctly treated as a capability spec (§4.7) with no forced UJ. Nothing is over-formalized. One genuine under-formalization:

### Findings
- **high** Bilingual UI is a stated capability with zero FR coverage (§6.1, §10, §9 index vs §4) — "bilingual Vietnamese + English UI" is In Scope (§6.1), an NFR with a language toggle (§10), and an assumption that "the Operator supplies Product and Portfolio content in both languages" (§9). But no FR requires a language toggle, and the Operator Admin FRs (FR-19 products, FR-22 portfolio) never mention capturing content in two languages. This is load-bearing for architecture (every Product/Portfolio text field must be modeled ×2 locales) and for UX (the toggle), yet nothing functional demands it. *Fix:* add an FR (or consequences on FR-19/FR-22 plus a storefront FR) for bilingual content authoring and a customer-facing language toggle, so the data model and toggle have a source.
- **low** UJ-3 is a floating UJ (§2.3) — its protagonist is "A visitor," unnamed, unlike UJ-1/UJ-2. It is explicitly the "lighter" portfolio journey so this is minor, but a name would keep it consistent. *Fix:* give it a name and one line of context, or drop the UJ label and fold it into the Portfolio feature description.

## Mechanical notes

- **ID continuity:** clean — FR-1–FR-24 contiguous/unique, UJ-1–3, SM-1–4 + SM-C1/C2; all cross-references (FR-11/12/13/14, FR-6/7, FR-19) resolve.
- **Assumptions Index roundtrip:** one miss — SM-4's inline assumption (§7) is absent from §9 (see 6). All other inline `[ASSUMPTION]` tags, including the bare `[ASSUMPTION]` markers in §10/§12, are represented. No index-only entries lack an inline origin (the two `*(confirmed)*` entries correctly need none).
- **Glossary drift:** low — "product page"/"product detail page", "bird imprint pictures"/"bird images" (see 6). Core domain nouns (Product, Variant, Physical Print, Digital Download, Order Status, Download Link, License) are used verbatim.
- **UJ protagonist naming:** UJ-1/UJ-2 named and contextual; UJ-3 unnamed (see 7).
- **Required sections:** all present for a lean launch PRD — Purpose, Vision, Users/JTBD/UJs, Glossary, Features/FRs, Non-Goals, MVP Scope, Success Metrics, Open Questions, Assumptions Index, NFRs, Constraints, Platform/Aesthetic.
