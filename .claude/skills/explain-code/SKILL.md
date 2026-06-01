---
description: Explain code or configuration for a given file or class. Covers purpose, key functions, data flow, and integration points. Use when learning a service, understanding a component, or onboarding to a new part of the codebase.
argument-hint: "[filename or class name]"
---

# Explain Code or Configuration

## Target
$ARGUMENTS

## Your Task

1. **Find the target** — locate the file or class using search. If not an exact match, find the closest one.

2. **Read it fully** — read the complete file including imports and dependencies.

3. **Explain using this structure:**

   ### Overview
   - What this code does (1-2 sentences)
   - Why it exists in the system

   ### Key Components
   - Main classes, functions, or config blocks
   - Important fields or properties
   - External dependencies

   ### How It Works
   - Step-by-step flow for the main operation
   - Data transformations, DB queries, API calls, caching

   ### Integration Points
   - What calls this? What does this call?
   - Where is it wired up (Lambda handler, docker-compose, SAM template, etc.)

   ### Gotchas
   - Non-obvious behavior, edge cases, or constraints worth knowing

4. Use actual file paths, function names, and line numbers — no generic explanations.
5. If the file is part of this project, reference the TDD section that specifies it.
