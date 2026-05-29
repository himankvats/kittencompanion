# Business Case

**Project:** Kitten Companion
**Phase:** 1 — Initiation & Discovery
**Status:** Draft — for go/no-go decision

---

## What this document is

The synthesis artifact for the go/no-go decision at the end of Phase 1. It pulls together the case study, problem statement, vision, market analysis, and stakeholder register into one argument: should we proceed to Phase 2 or not? The document is structured around that question, with the expected outcome being a clear answer either way — not a recommendation buried in qualifications.

The "business case" framing is unusual for a non-commercial project. The document is structured around the conventional sections recruiters and senior engineers will recognize, but the substance acknowledges that the "business" being made the case for is a portfolio-grade demonstration of capability, not a revenue-generating company. Where conventional sections (cost, ROI, payback period) need to be reinterpreted for this context, they are.

---

## Executive summary

The recommendation is to proceed to Phase 2 (Planning & Design) on a four-month companion app for first-time cat owners in the United States. The project addresses a measurable, growing population (~1-1.25 million first-time cat-owner households per year, currently underserved by existing tools), via a defensible product positioning (intersection of acute-event triage, slow-accumulation pattern surfacing, and vet-facing summary — no existing product combines these), grounded in the engineer's lived experience with the problem domain. The project carries low regulatory risk, no conflict with the engineer's current professional obligations, and a clear set of leap-of-faith assumptions that can be validated cheaply in Phase 2.

The recommendation is to proceed conditional on one cheap pre-Phase-2 validation step: 3-5 conversations with first-time cat owners (via subreddit posts and direct outreach) to confirm that the problem is felt the way the project assumes it is felt. This step is achievable within 2-3 weeks and would surface the most likely reason to not proceed (the problem isn't actually painful enough to drive engagement) before any further investment.

---

## The problem, in brief

Roughly one million U.S. households per year become first-time cat owners, and a documented majority of them experience significant adoption difficulty within the first six months. Existing resources — internet search, vet visits, static checklists, generic pet-tracking apps — are reactive, generic, or untimely. None are designed for the cadence at which real problems arise during the four-month window in which both cat behavior and owner confidence are forming. The full problem framing lives in the Problem Statement document; this section is a summary.

Two specific failure patterns drive the project. The acute event (kitten suddenly stops eating, develops a cough, refuses the litter box) calls for the right information at the right time and is poorly served by undirected internet search. The slow accumulation (treat-driven habit formation, missed socialization windows, gradual weight trajectory) is invisible to the owner in the moment and visible only weeks later when the consequences materialize.

Both patterns are addressable by the same general mechanism: structured daily check-ins, triage logic, and longitudinal pattern surfacing. This is the project's core technical and product contribution.

---

## Expected benefits

Structured around the three audiences the project serves, with measurability flagged for each.

### For first-time cat owners (primary)

Reduced overwhelm during the four-month window. Owners receive specific, calibrated guidance at the moment they need it, rather than searching for it generically. Acute events resolve faster (24-hour resolution rate is the primary success metric). Slow-accumulating habits get surfaced before they compound. Confidence at month four is measurably higher than at week one, with that delta as a supporting success metric.

The benefit is real and measurable at population scale but not visible to any single owner. For the individual owner, the benefit looks like "I had a question, I got an answer, the kitten was fine." That is the right experience.

### For veterinarians (secondary)

A 30-second behavioral baseline summary at the four-month checkup, surfacing patterns the owner wouldn't have remembered to mention and the vet couldn't have asked about. Higher-quality clinical conversation in the same appointment slot. Better-informed owners arriving better-prepared.

The benefit is asymmetric. The vet doesn't work to receive it. Ignoring it doesn't damage the appointment. If vets engage, value materializes. If they ignore the summary, the primary owner-facing value is unaffected.

### For the engineer (portfolio purpose)

A deployed, finished, working product addressing a real problem in a domain the engineer knows personally. Phase 1 documents (case study, vision, problem statement, market analysis, this document) demonstrate domain reasoning and product thinking ahead of code. The eventual codebase demonstrates engineering craft. Together these address all three portfolio priorities in their stated order.

This benefit is realized regardless of whether the product itself succeeds. A well-documented, well-shipped, well-reasoned project that demonstrably solved a specific design problem is portfolio value even if the user base remains small. The project is structured to be robust to commercial outcomes.

---

## Expected costs

Structured around conventional categories, reinterpreted for solo non-commercial work.

### Engineer time

The largest cost. Honest estimate: 3-6 months of evenings and weekends through deployment. Phase 1 documentation work (already substantially complete) has consumed roughly two weeks of cumulative effort across multiple sessions. Phase 2 planning and design work is probably 3-4 weeks. Phase 3 build work depends heavily on architectural choices — a deliberately scoped MVP is 2-3 months, an over-scoped one balloons.

This cost is real but is denominated in time the engineer has chosen to invest in portfolio work regardless of which project the work attaches to. The cost is not "additional" if the alternative is building a different portfolio project. It is denominated against zero-effort baseline (no portfolio project) rather than against an alternative project.

### Direct financial cost

Minimal. Hosting (Vercel/Netlify/Railway free tiers likely sufficient for portfolio-scale traffic), database (Supabase or Postgres free tier), domain (~$15/year), LLM API costs (variable, dependent on usage patterns and model choice, rough estimate under $50/month at portfolio scale). Total: under $200 for the first year.

### Opportunity cost

The most significant cost. Time spent here isn't spent on other portfolio projects, on professional certifications, on networking, on freelance income, or on rest. The decision to invest here implicitly de-prioritizes those alternatives.

The opportunity cost is acceptable if the project produces portfolio value commensurate with the time invested. The Phase 1 documentation discipline produced an archived predecessor project that was the cheap-kill output of doing Phase 1 properly. Repeating that pattern — investing in upfront thinking before code, killing cheap when warranted — is itself the portfolio-grade behavior the project is trying to demonstrate.

### Risk cost (potential negative outcomes)

Several risks could materialize and consume effort without yielding portfolio value. These are named explicitly in the risk section below.

---

## Risks

### Adherence collapse (HIGH)

The largest single risk. The project's premise depends on owners engaging with a daily check-in for four months. Habit apps generally lose users between weeks two and four. If adherence collapses past month one for most users, the longitudinal value (slow-accumulation surfacing, vet summary, confidence trajectory) collapses with it. The acute-event-triage value would persist, but the product would be reduced to "a thing you open when something's wrong," which is a narrower product.

*Mitigation:* Phase 2 validation conversations should test adherence willingness directly. Phase 3 design should explicitly engineer for adherence under realistic conditions (check-ins under 60 seconds, value visible from week one, no engagement debt accumulating).

### Vet ignore (MEDIUM)

The four-month behavioral baseline summary is the project's secondary value and depends on vets engaging with it at the appointment. If vets ignore the summary, the secondary value evaporates.

*Mitigation:* Known assumption that Phase 1 explicitly flags as needing validation. The primary owner-facing value doesn't depend on vet engagement, so the project survives a "vets ignore it" outcome with reduced scope but intact thesis.

### Problem-not-felt (MEDIUM)

The diagnostic framing — that first-time owners feel overwhelmed, that they search at 11pm, that existing resources fall short — is grounded in the engineer's experience and research. If real owners report that the problem isn't felt the way the project assumes, the entire premise is wrong.

*Mitigation:* The cheap pre-Phase-2 validation step (3-5 owner conversations) is specifically designed to surface this. If owners don't recognize the problem in their own experience, the project should be reconsidered. The single most important cheap kill the project should remain open to.

### Scope creep into adjacent problems (MEDIUM)

The pattern naturally tempts expansion: dogs, exotics, multi-pet integration, chronic conditions, training programs, commerce. Each adjacent expansion has been deliberately excluded from MVP scope in the Vision Document. The risk is that pressure to expand returns during Phase 2 or Phase 3 ("but it would be so easy to add").

*Mitigation:* The Vision Document's out-of-scope section is the standing reference. Any scope question gets checked against it. The engineer's stated discipline of "kill bad ideas cheaply" applies inward, not only at project boundaries.

### Engineering over-investment (LOW-MEDIUM)

The temptation to over-engineer a solo portfolio project is well-documented. Building elaborate infrastructure for users who don't exist yet is the classic failure mode.

*Mitigation:* Phase 2 architecture decisions should explicitly invoke YAGNI. The simplest deployable thing that demonstrates the core mechanic wins. The project is portfolio-grade; it doesn't need to be enterprise-grade.

### Project becomes a substitute for the work it describes (LOW but worth naming)

A risk specific to this project: the engineer is themselves a first-time cat owner. Working on the project could become a substitute for actually being attentive to Scooter, or could compound the over-monitoring tendencies the project is trying to address in other people. Small risk but worth noting.

*Mitigation:* The engineer's own day-to-day responsibility to Scooter is named explicitly in the stakeholder register. The project does not displace it.

---

## Alternatives considered

Three alternatives were seriously considered and discarded during Phase 1. Named here because a good business case shows its work.

### Alternative 1: Continue with the predecessor project (Contact Lens Trial Companion)

Discarded because the domain overlapped with the engineer's day-job work, creating professional-obligations risk that wasn't worth managing for a portfolio project. Architecture and Phase 1 discipline transferred to the pet project. Specific domain content did not. See archive note for full reasoning.

### Alternative 2: Pivot to a healthcare-adjacent but lower-risk domain

Medication adherence, post-surgical recovery, and first-SSRI adherence were all considered as pivot targets. Each had stronger industry stats and more rigorous research than the pet project ultimately offers. Each was discarded for some combination of: regulatory weight too high for solo portfolio scale, domain accessibility lower than pets, absence of the engineer's lived experience as a grounding force.

### Alternative 3: Pivot to a non-healthcare domain (SaaS trial conversion, new-hire onboarding, gym retention)

These had structural advantages (zero professional-obligations risk, universal audience relevance to engineering hiring managers) but lacked the lived-experience grounding that makes the pet project's case study work as written. The pet project was chosen because the personal connection produces stronger writing and clearer product instincts, not because the market case is strictly better.

This is a deliberate tradeoff. A recruiter scoring "domain insight" might score the pet project lower than the SaaS pivot. A recruiter scoring "writing quality and authenticity" would score it higher. The project bets on the latter.

---

## Decision criteria

The go/no-go decision for Phase 2 should be evaluated against:

1. **Is the problem real?** Validated by case study (Scooter narrative), problem statement research, and Kidd 1992 + subsequent return-rate literature. Yes, with the cheap pre-Phase-2 conversation step as a final sanity check.

2. **Is the project differentiated?** Validated by market analysis. Yes: no existing product combines the four key properties (first-time-owner cohort, four-month window, triage + slow-pattern, vet summary).

3. **Are the leap-of-faith assumptions named and testable?** Validated by vision document. Yes: four assumptions named, each with a clear validation approach.

4. **Are the risks acceptable and mitigated?** Validated by this document. Yes: largest risk (adherence) is testable cheaply; second risk (vet ignore) is non-fatal; remaining risks have named mitigations.

5. **Does the project serve all three portfolio priorities?** Validated by vision document. Yes: shippable, demonstrably-thought-through, engineering-creditable.

6. **Is the cost-to-benefit reasonable for solo non-commercial work?** Validated by the cost and benefits sections above. Yes: time investment is denominated against an existing portfolio-work baseline, financial cost is negligible, opportunity cost is acceptable given the alternative-projects comparison.

---

## Recommendation

**Proceed to Phase 2 (Planning & Design)**, conditional on completing one pre-Phase-2 step: 3-5 conversations with first-time cat owners to confirm the problem is felt as the project assumes. Achievable within 2-3 weeks via Reddit outreach and direct conversations.

If the validation step confirms the problem framing, Phase 2 proceeds as planned. If it contradicts the framing, the project pivots, narrows, or is archived — using the same discipline that archived the predecessor project.

---

*This document, like all Phase 1 documents, will be revised once pre-Phase-2 validation conversations are complete. The risk assessments, leap-of-faith assumptions, and recommendation itself may sharpen materially after real owner conversations.*
