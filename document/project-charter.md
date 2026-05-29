# Project Charter

**Project:** Kitten Companion
**Phase:** 1 — Initiation & Discovery
**Status:** Draft

---

## One-line description

A four-month companion for first-time cat owners that helps them recognize what's normal, address what isn't, and build owner confidence — while producing a behavioral baseline summary that helps their vet spot anomalies at the four-month checkup.

## Purpose

The project exists for two reasons that are openly named together rather than hidden behind one another.

First, it addresses a real problem the engineer encountered as a first-time cat owner: the information needed to handle the first four months of cat ownership exists, but isn't routed to new owners at the moments they need it. The Scooter case study documents the diagnostic in detail.

Second, it is a portfolio artifact intended to demonstrate the engineer's ability to think across the full product lifecycle — domain reasoning, product thinking, and engineering craft — not just write code.

Both purposes are real. Both are pursued honestly. The project is structured so that doing one well does the other well.

## Scope

### In scope

- First-time cat owners in the United States, during the first four months following adoption.
- Multi-pet and child-in-household contexts handled as parameters that adjust the experience, not as separate cohorts.
- Daily check-in flow capturing owner observations about eating, litter, activity, sleep, and notable events.
- Acute-event triage: surfacing the right guidance when an owner flags a concern, with escalation paths to "manage at home / watch / call vet now."
- Slow-accumulation pattern surfacing: catching drift the owner cannot see in the moment (treat-driven habits, weight trajectory, missed socialization).
- Behavioral baseline summary for the veterinarian at the four-month checkup — a 30-second read, not a diary.

### Out of scope

- Veterinary medical advice. The tool reports patterns, surfaces concerns, and routes escalation. It does not diagnose, prescribe, or interpret symptoms clinically.
- Replacing vet visits.
- Selling pet products, services, or insurance. The tool is informational and behavioral; commercial signal stays with the vet.
- Dogs, exotics, and other species.
- Multi-pet integration as a primary feature.
- Behavioral training programs (click-and-treat curricula and similar).
- Cats with diagnosed chronic conditions.

Full out-of-scope rationale lives in the Vision Document. Scope boundary disputes during Phase 2+ should be resolved against that document.

## Success criteria

Three metrics, in priority order.

**Primary: Acute-event resolution rate within 24 hours.** When owners flag an acute issue through the daily check-in, what percentage gets resolved within 24 hours via tool-provided guidance versus requires vet escalation versus drags on unresolved? The metric that most directly measures the project's core mechanic.

**Supporting: Owner confidence trajectory.** Lightweight self-reported confidence scoring at week 1 versus month 4. Of owners who started in a high-anxiety state, what percentage moved into a confident-owner range by month four?

**Supporting: Vet engagement with the summary.** Of vets who receive the four-month behavioral baseline report from participating owners, what percentage open it, and what percentage report it useful?

## Stakeholders

| Stakeholder | Influence |
|---|---|
| The engineer (project owner) | High |
| First-time cat owners (primary users) | High |
| Recruiters and hiring managers (portfolio audience) | High |
| Engineer's current professional obligations (project must not conflict) | High |
| Veterinarians (secondary beneficiaries) | Medium |
| Shelters and adoption coordinators | Medium |
| Future-self (12 and 36 months out) | Medium |

Full register lives in `stakeholder-register.md`.

## Constraints and assumptions

### Constraints

- Solo project. One engineer, evenings and weekends.
- No funding, no co-founders, no team. No revenue model.
- Project domain was selected to avoid conflict with the engineer's current professional obligations. Public-data and synthetic-data only. No work-derived knowledge feeds the project.

### Leap-of-faith assumptions

Four assumptions the project depends on, each requiring validation:

1. New cat owners will engage with daily check-ins for the full four-month window.
2. Veterinarians will engage with the four-month summary when owners bring it to the appointment.
3. A meaningful share of acute events can be resolved by owner-facing guidance without vet escalation.
4. The tool can operate as a standalone product without veterinary practice management integration.

These are spelled out in the Vision Document and the Business Case.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Adherence collapse past month one | High | Test directly in pre-Phase-2 validation; engineer for adherence in Phase 3 design |
| Vets ignore the summary | Medium | Primary owner-facing value doesn't depend on vet engagement; project survives reduced |
| Problem not felt by real owners | Medium | Pre-Phase-2 validation conversations specifically test this |
| Scope creep | Medium | Out-of-scope list in Vision Document is the standing reference |
| Engineering over-investment | Low-Medium | YAGNI explicit in Phase 2 architecture decisions |
| Project displaces actual cat-care responsibility | Low | Named in stakeholder register; ongoing self-check |

Full analysis lives in `business-case.md`.

## Phase 1 deliverables — status

| Deliverable | Status |
|---|---|
| Case Study (Scooter) | Draft |
| Vision Document | Draft |
| Problem Statement | Draft |
| Market & Competitive Analysis | Draft |
| Stakeholder Register | Draft |
| Business Case | Draft |
| Project Charter (this document) | Draft |
| Archive note for predecessor project | Draft |

## Go/no-go recommendation

**Proceed to Phase 2 (Planning & Design)**, conditional on one pre-Phase-2 validation step: 3-5 conversations with first-time cat owners to confirm the problem is felt as the project assumes. Achievable within 2-3 weeks via subreddit outreach and direct conversation.

If the validation step confirms the problem framing, Phase 2 proceeds. If it contradicts the framing, the project pivots, narrows, or is archived using the same discipline that archived the predecessor project.

## Approval

This is a solo project. The engineer is the approving authority and the executing authority. The approval recorded here is documented self-approval — a deliberate practice of writing down the decision so future-self can audit it.

**Approved to proceed:** Pending engineer's review of all Phase 1 deliverables in final form.
**Conditions:** Pre-Phase-2 validation conversations as described above.

---

*This charter is the cover document for Phase 1. It is intended to be short. It does not re-argue the case; it summarizes the outputs of the other artifacts so that a reader new to the project can orient quickly. Any reader wanting depth should follow the cross-references to the underlying documents.*
