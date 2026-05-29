# Vision Document

**Project:** Kitten Companion
**Phase:** 1 — Initiation & Discovery
**Status:** Draft

---

## What this document is

This is the aspirational three-year view of what success looks like for this project. It does not describe features, architecture, or roadmap — those live in later artifacts. Its job is to set a destination clear enough that Phase 2+ decisions can be checked against it, and clear enough that, three years from now, an honest reader can tell whether the project succeeded or didn't.

It also serves as the scope guardrail. Anything that doesn't sit inside this vision should get pushed back on later.

---

## Three-year aspirational statement

In three years, a first-time cat owner who brings a new kitten home has a companion through the first four months that they actually use. Not as a once-and-done onboarding flow, not as a static FAQ they bookmark and never open, but as a daily presence that asks them a few questions about how the day went, surfaces concerns at the moment those concerns are real, and routes them to the right information or the right escalation without requiring them to know what to search for.

When something acute happens — the kitten stops eating, develops a cough, hides for two days — the owner is not alone at midnight with a search engine and ten browser tabs. They flag the concern in the tool, get an immediate triage signal (manageable at home, worth watching, call the vet now), and receive specific guidance grounded in real cat behavior literature rather than the median of internet folklore.

When something accumulates slowly — treat-driven habit formation, missed socialization windows, gradual weight trajectory — the tool catches it before the owner does, because it has been watching patterns the owner cannot see in the moment. The owner gets a quiet nudge two weeks before the problem would otherwise have compounded.

At the four-month mark, when the owner brings the cat in for the major checkup, the vet receives a 30-second behavioral baseline report. Not a diary. Not a dump of every observation. A focused summary: what eating, litter, activity, and sleep patterns have looked like, what the owner flagged as concerning, what trended toward normal and what didn't. The vet now has the longitudinal context they have never had access to before, and the appointment becomes more useful because the owner-as-historian problem is reduced.

The owner, on the other side of those four months, is no longer overwhelmed. They have built confidence not through generic articles but through specific feedback on their specific cat. They know what their cat's normal looks like because they have been observing it deliberately. They are, in the language we deliberately did not use earlier in this project's history, ready to be the parent of this animal for the next fifteen years.

## What success means, concretely

Success in three years is measurable through three metrics, in priority order.

The primary metric is **acute-event resolution**. When owners flag an acute issue through the daily check-in flow — sudden change in eating, unusual behavior, suspected health issue — what percentage gets resolved within 24 hours via tool-provided guidance versus requires vet escalation versus drags on unresolved? This metric was chosen as primary because it directly measures the project's core mechanic: the right information at the right time. If acute events resolve as quickly with the tool as they do without it, the tool isn't doing the work its premise claims. If acute events resolve faster and with less unnecessary vet escalation, the premise holds.

The supporting metric is **owner confidence trajectory**. Measured via lightweight self-reported confidence scoring at intake (week 1) and at the four-month mark, what percentage of owners who started in a high-anxiety state moved into a confident-owner range by month four? This is a slower-moving outcome metric — it tells us whether the daily intervention is producing the longitudinal change the vision claims, beyond just handling individual events.

A second supporting metric, lighter-weight and more qualitative, is **vet engagement with the summary**. Of vets who receive the four-month behavioral baseline report from participating owners, what percentage open it, and what percentage report it being useful at the appointment? This metric matters because the vet-facing piece is the project's secondary value proposition. If vets ignore the summary entirely, that doesn't kill the project — the primary owner-facing value still stands — but it does narrow the project's positioning. We want to know which it is.

These three metrics together produce a defensible picture: the tool resolves the acute events it claims to resolve, the owners using it grow into confident owners, and the professionals adjacent to the relationship get value at the moment they are most positioned to use it.

## Who this is for

The primary beneficiary is the **new cat owner** during the first four months after bringing a cat home. This is a deliberately bounded user. Not all cat owners. Not experienced owners adopting an additional cat. Not foster caregivers. Not cat owners dealing with chronic medical conditions that need ongoing veterinary management. The first-time-owner-during-first-four-months cohort is large, well-defined, and has the most acute version of the information-and-confidence gap this project addresses.

Household context — whether there are existing pets, whether there are young children — is handled as a parameter that adjusts the experience rather than as a separate cohort. A first-time cat owner in a household with a dog gets some questions and resources tailored to that context. A first-time owner with a toddler gets others. The core product is the same; the surface adjusts.

The secondary beneficiary is the **veterinarian** who sees this cat at the four-month checkup. The vet is not a user of the tool in any active sense — they do not log in, do not interact with the owner through it, do not configure anything. They receive, at the appointment, the focused behavioral baseline report that gives them context they have never had access to before. The value to the vet is asymmetric and lightweight: 30 seconds of structured signal that makes a 15-minute appointment more productive. If the vet ignores it entirely, the project's primary value still holds. If the vet uses it, the project earns a second beneficiary effectively for free.

The pet itself is, in some sense, the *ultimate* beneficiary, but framing the cat as the user produces confused product decisions. The cat cannot consent, cannot self-report, cannot be the metric source. The owner is the proxy. We design for the owner because that is who actually interacts with the tool, while remembering that good owner outcomes correlate strongly with good cat outcomes.

## What is explicitly out of scope

This list matters because the project's failure mode is feature creep into adjacent problems that look related but aren't.

**The tool is not a source of veterinary medical advice.** It reports patterns, surfaces concerns, and routes owners to escalation when warranted. It does not diagnose, does not prescribe, does not advise on treatment, does not interpret symptoms beyond pattern-matching against a defined set of "this is worth a vet call" triggers. The owner observes; the tool patterns; the vet interprets. Crossing that line introduces regulatory weight (in many jurisdictions, "practicing veterinary medicine without a license" is a real legal category) and changes the project's risk profile entirely.

**The tool does not replace vet visits.** Routine vaccinations, physical examinations, and preventive care happen at the vet, not in the app. The tool exists to make those visits more productive and to fill the gap between them, not to bypass them. Owners who use the tool should be seeing their vet on the standard kitten schedule, and the tool should be reinforcing that, not displacing it.

**The tool does not sell pet products.** Not food, not supplies, not insurance, not toys, not training services. In a hypothetical future state where the tool integrates with a vision care company's broader product ecosystem — or any analogous commercial actor in the pet space — any commercial signal stays out of the owner-facing experience. The framing matters because the moment the tool reads as a sales channel, owners stop trusting its guidance and vets refuse to engage with the summary. The output is informational and behavioral, not commercial. Whatever business model eventually attaches to the project, it does not attach to the owner-facing recommendations.

**Dogs, exotics, and other species are out of scope.** This is a cat-specific tool. The behavioral patterns, common health concerns, socialization windows, and household dynamics differ enough between species that trying to serve cats and dogs in a single MVP dilutes both. Cat-only is the focus. The architecture should not preclude species expansion in a later phase, but no product surface in the MVP should be cross-species.

**Multi-pet integration as a primary feature is out of scope for MVP.** Cat-to-cat introductions and cat-to-dog introductions are real, hard, well-documented problems with their own bodies of expertise. Trying to be a multi-pet integration product on top of being a new-owner companion is the same scope mistake the project's earlier domain (contact lens trials) was at risk of making with the "all dropouts" framing. The MVP handles multi-pet households as context — the check-in might ask "is there a dog in the household" and tailor some guidance — but it does not become a dedicated multi-pet integration tool. That is a future-scope possibility, not Phase 1.

**Behavioral training programs are out of scope.** Click-and-treat training curricula, scheduled-reinforcement protocols, structured behavior modification programs — these exist as products (Fundamentally Feline, others) and they require active engagement on a different cadence than this project's daily-check-in model. The tool surfaces patterns ("you have been giving treats off-schedule, here is what that builds toward") but does not deliver training programs.

**Cats with diagnosed chronic conditions are not the target user.** A cat with diabetes, chronic kidney disease, or a known behavioral disorder needs ongoing veterinary management and possibly a specialized tool. Trying to also serve that population dilutes the new-owner focus.

## What would have to be true for this to succeed

These are the leap-of-faith assumptions the project is making. Each becomes a validation target during the rest of Phase 1 and into Phase 2.

The first assumption is that **new cat owners will engage with daily check-ins for the duration of a four-month window**. This is a significantly longer engagement window than most consumer health and habit apps achieve, and it is the largest single risk to the project. Anecdotal experience suggests new-pet excitement is sufficient to sustain engagement through at least the first month, but month two through month four is where habit apps generally lose users. The check-in flow has to be short enough, useful-feeling enough, and meaningfully responsive enough to the owner's specific situation that adherence stays high. If adherence collapses past month one for most users, the longitudinal value collapses with it. This is the assumption that most needs early validation.

The second assumption is that **veterinarians will engage with the four-month summary when their patients' owners bring it to them**. This is the same gamble that the project's earlier vision had with eye care professionals — and the verdict is similarly unknown until real conversations happen. A vet who glances at the report and finds value turns the secondary beneficiary into a real one. A vet who ignores it makes the report cosmetic. The summary's design — 30 seconds, focused on clinical signal, no narrative — is built around making the vet's ignore-it-or-use-it decision cheap, but it doesn't guarantee adoption.

The third assumption is that **a meaningful share of acute events new cat owners experience can be resolved by owner-facing guidance without requiring veterinary escalation**. The Scooter-not-eating story is one example: the resolution was behavioral, not clinical, and the right information at the right time would have saved a vet visit. How representative that pattern is, across the full range of acute events new owners experience, is unknown without real data. If the actual distribution is dominated by issues that genuinely need a vet (which is plausible — kittens are fragile and many symptoms warrant clinical attention regardless of how the owner feels), the tool becomes mostly a triage funnel rather than a triage-plus-resolution system. That is still useful, but the framing changes.

The fourth assumption is that **the tool can operate as a standalone product without veterinary practice management integration**. Unlike the human healthcare space where FHIR and SMART-on-FHIR provide a mature integration pattern, veterinary practice management software is fragmented, proprietary, and largely closed. The MVP cannot rely on integration. The owner enters their cat's information themselves at onboarding, and the four-month summary is something the owner physically brings to the appointment (printed, emailed, or shown on phone). If owners refuse to do that bridge work, the vet-facing value becomes unreachable.

## Portfolio framing

The project has a dual purpose that this document acknowledges directly. It is a real attempt to address a real problem that many new cat owners experience. It is also a portfolio artifact intended to demonstrate the engineer's ability to think across the full lifecycle of a product, not just write code.

The portfolio criteria, in priority order, are unchanged from earlier project framing:

The first is **shipping a finished, deployed product**. Most engineering portfolios contain in-progress repositories and abandoned side projects. A deployed, working product that a hiring manager can interact with, that handles edge cases, and that has obvious signs of being finished — error handling, deployment hygiene, a real README — is rare. This is the cost of entry to be taken seriously.

The second is **demonstrating domain reasoning and product thinking**. The Phase 1 documents themselves — the case study, problem statement, business case, market analysis, this vision document, ADRs written along the way — are evidence of how the engineer thinks about a problem before solving it. This is the differentiator. Most engineers cannot produce this. The ones who can are the ones senior engineers and hiring managers actively want to forward.

The third is **demonstrating engineering craft in the code itself**. Clean architecture, sensible testing, real error handling, code that reads as something a peer would be comfortable maintaining. This is what closes the loop in technical interviews.

The pet domain has an additional advantage over the project's earlier vision care framing: it is universally accessible. A recruiter, hiring manager, or peer engineer reading this project does not need any background in healthcare, optometry, or insurance to understand the problem. Most of them have either owned a pet, considered owning one, or know someone overwhelmed by a new one. The case study's emotional weight is real and unmanufactured, and the engineering decisions sit cleanly on top of a problem the reader has felt.

## What this vision is not promising

Three years out, this project will not have transformed how new cat owners experience the first four months. It will not have reached most US cat households. It will not have partnerships with major shelters, vet chains, or pet retailers. It is, even in the aspirational view, a focused tool that does one thing well for a specific cohort of owners during a specific window.

The point of being precise about what this project is not aiming for is that the temptation to broaden is constant, and broad visions are unfalsifiable. A specific vision can be measured against. A grand one cannot.

If, three years out, the answer to "did this project succeed?" is "we don't really know" — the vision was wrong. If the answer is "yes, here are the metrics, here are the conversations with owners who used it, here is what we learned, here is what didn't work" — the vision did its job, whether the project itself succeeded commercially or not.

---

## Open questions this vision still depends on

These are the questions Phase 1 still has to answer through real conversations, not further desk research:

1. Would new cat owners actually engage with daily check-ins for four months, or would adherence collapse past week three?
2. Would vets glance at a one-page behavioral summary at a four-month checkup, or would they ignore anything not in their existing workflow?
3. What proportion of acute events new owners experience genuinely need veterinary attention versus could be resolved by better information at home?
4. Would shelters be willing to refer adopters to the tool at handoff, or is that a non-starter?
5. Is there a viable model where the tool is genuinely free for owners, given that the project has no commercial intent?

Answers to these would tighten the vision considerably. The current draft assumes the more optimistic answer to each, and explicitly flags that assumption so that downstream documents can adjust if real conversations contradict it.

---

*This document is a draft and will be revised once Phase 1 conversations with cat owners, vets, and possibly shelter staff are complete. The success metrics, the four-month engagement assumption, and the vet-engagement assumption are particularly likely to sharpen as real input arrives.*
