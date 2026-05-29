# Problem Statement

**Project:** Kitten Companion
**Phase:** 1 — Initiation & Discovery
**Status:** Draft

---

## Problem

First-time cat owners in the United States spend the first four months of cat ownership in an information-and-confidence vacuum. The information they need to handle what comes up — acute events like the kitten that suddenly stops eating, slow-accumulating habits like treat-driven behavior conditioning, expected adaptation timelines, household integration friction — mostly exists. It's in cat behavior literature, in shelter staff knowledge, in experienced-owner forums. It just isn't routed to first-time owners at the moments they need it, in a form they can use, before the consequences of not having it compound.

The owner's primary information channels during this window are an unstructured internet search (yielding a high-variance mix of folklore, generic checklists, and product marketing), occasional vet visits (constrained to clinical questions and limited by the owner's ability to recall the last three weeks accurately), and word of mouth (high-quality but coincidental). None of these are designed for the cadence at which problems actually arise. The vet doesn't see what's happening between visits. The internet doesn't know what the owner has already tried. The forum is full of strangers describing different cats.

## Who experiences this problem

The primary affected population is **first-time cat owners in the United States during the first four months following adoption**. Three properties distinguish this cohort from cat owners generally.

It is large. Roughly 49 million U.S. households own at least one cat (APPA 2025), with cat ownership growing 23% between 2023 and 2024. About 3 million cats enter U.S. shelters annually, with a ~64% adoption rate yielding roughly 1.9 million shelter-adopted cats, plus a substantial additional flow from breeders, friends and family, and stray rescues. The first-time-owner subset within that population is not precisely measured but is plausibly in the high hundreds of thousands of households per year.

It is at measurably elevated risk of failure. A 1992 study by Kidd and colleagues, still cited in shelter literature, found that within six months of adoption, first-time cat adopters returned their cats at a rate of 62%, versus 38% for owners with prior cat experience. Recent data shows lower overall return rates (4-12% across studies and shelters, methodology-dependent), but the disproportion holds: first-time owners drive a disproportionate share of returns, and a much larger share of *unsuccessful* adoptions that don't result in formal return — long-term owner dissatisfaction, cat behavioral problems, quiet rehoming to friends and family. Behavioral issues are the single largest category of cat returns, accounting for 26% of returns in some studies. Behavioral issues are precisely the category most amenable to early intervention.

It is at the highest-leverage moment of the cat's lifetime. The first three to four months establish patterns — eating, litter, play, response to humans and other animals — that calcify quickly. An owner who builds good habits in this window tends to have an easier next fifteen years. An owner who accidentally reinforces bad habits spends weeks or months trying to undo them, often unsuccessfully.

## Current alternatives, and why they fall short

First-time cat owners today have access to several resources. None solves the problem the way it actually presents itself.

The most common is **internet search**. Articles like "first-time cat owner checklist" exist in abundance, and the better ones are accurate. The failure mode isn't that the information doesn't exist; the owner has to know what to search for at the moment they need it. The Scooter case study illustrates this. By the time the owner is searching, they're panicking, the cat's clock is ticking, and the right answer (sibling-separation feeding refusal) is buried under more common food-rejection answers. Search is reactive, generic, and assumes a level of domain literacy the new owner doesn't have.

The second is the **vet visit**. Vets are clinical specialists, not behavioral coaches, and the typical kitten appointment is densely scheduled around vaccinations and physical examination. The vet asks the owner about behavior, but the owner is — being honest — an unreliable historian, especially when stressed. Whatever the owner can't remember at the appointment isn't part of the clinical picture.

The third is **first-time-owner checklists**, distributed by shelters at adoption, by veterinary clinics at the first visit, and by pet retailers. These are useful at adoption but irrelevant within days. Static, no adaptation to the cat or the owner, no surfacing when the owner has a specific concern.

The fourth is **pet care tracking apps**. Several exist (Clio, Moggie, DogCat App, MeowLog, Maven Pet), offering varying combinations of activity logging, weight tracking, vaccine reminders, and symptom diaries. They're tools for owners who already know what to track. They don't guide a first-time owner through what *should* be tracked, what is normal versus concerning, or what to do about a concerning observation. Maven Pet is the closest analog — it uses a wearable sensor to track activity and respiratory rate continuously and surfaces deviations — but it's positioned around general cat health monitoring, not the first-time-owner onboarding window, and requires a $200+ hardware purchase. None of the existing apps focus on the four-month new-owner cohort, none combine acute-event triage with slow-pattern surfacing, and none produce a structured behavioral baseline for the vet.

## Why now

The primary "why now" is that **cat ownership is in an unusual growth period in the United States**, with APPA data showing 23% increase in cat-owning households between 2023 and 2024. This influx is disproportionately first-time owners, many of whom adopted during or following the pandemic's reshaping of household composition and pet acquisition patterns. The cohort the project addresses has grown materially in the last three years.

The supporting "why now" is that **the AI/LLM capability shift makes the project's core mechanic feasible in a way it wasn't five years ago**. The triage-from-natural-language-input loop — owner types "kitten threw up twice today and is hiding behind the couch" and gets a relevant, calibrated response in seconds — would have required either hand-coded decision trees or a multi-person clinical-content team in 2020. In 2026 it's achievable by a solo engineer with access to current language models, if the engineering is done responsibly (which is itself an interesting product problem). The ambient capability shift opens design space that didn't exist before.

A third, weaker "why now" is that **veterinary appointment availability has tightened in the post-pandemic period**, with many regions reporting multi-week waits for non-urgent kitten appointments. Owners with acute concerns increasingly can't reach their vet on the same day. Tools that help owners self-triage to "is this worth the urgent care visit" have correspondingly higher value than they did when same-day appointments were routine.

## Falsifiable problem statement

In its most testable form: *Roughly 62% of first-time cat owners experience meaningful adoption difficulty in the first six months, with behavioral problems and household integration friction as the largest categories. Existing resources — internet search, vet visits, static checklists, generic pet-tracking apps — are reactive, generic, or untimely, and don't provide the just-in-time guidance and longitudinal pattern surfacing that first-time owners need during the four-month window in which both cat behavior and owner confidence are forming.*

If real-world owner conversations contradict this — if first-time owners report that they have what they need, that vet visits cover the gaps adequately, that the internet works fine for their concerns — the problem framing is wrong and the project should be reconsidered. If owners independently describe variants of the patterns named here (the panicked search, the after-the-fact realization, the wishing-someone-had-told-me-earlier), the framing holds.

---

## Sources

- American Pet Products Association (APPA) 2025 Dog & Cat Report — cat-owning household growth and demographics.
- Kidd AH, Kidd RM, George CC (1992). "Successful and unsuccessful pet adoptions." Cited in shelter literature for first-time-adopter return rate.
- Powell L et al. (2021). "Characterizing unsuccessful animal adoptions: age and breed predict the likelihood of return." *Scientific Reports* 11:8018.
- Mundschau V, Suchak M (2023). "When and Why Cats Are Returned to Shelters." *Animals* 13(2):243.
- Coe JB et al. (2020). "Factors Informing the Return of Adopted Dogs and Cats to an Animal Shelter." *Animals* 10(9):1573.
- ASPCA, National Kitten Coalition, World Animal Foundation — adoption flow statistics.
- App store surveys: Clio, Moggie, DogCat App, MeowLog (May 2026); Maven Pet (maven.pet) for adjacent-product positioning.
