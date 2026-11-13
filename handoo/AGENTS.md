# Hanul project rules

These instructions apply to every file in this project.

## UI and color

- Read `DESIGN_SYSTEM.md` before creating or substantially changing a screen, component, or user flow.
- Use the semantic CSS variables defined in `src/styles.css`. Do not add a raw hex, RGB, HSL, or named color inside a component rule when an existing token has the same role.
- New UI uses turquoise only for brand and primary interaction. Use orange only for tests, warnings, new badges, or a single high-priority challenge action.
- Keep page backgrounds neutral, content cards white, and body text dark. Do not use saturated color for large reading surfaces.
- A screen must have one dominant primary action. Secondary actions use an outline or text style.
- Do not communicate status with color alone. Pair color with text, an icon, or both.
- Body text and controls must meet WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text and essential UI boundaries.

## Screen construction

- Reuse the existing header, breadcrumbs, buttons, cards, forms, dialogs, loading states, and vocabulary patterns before creating a new visual variant.
- Follow the spacing, radius, shadow, typography, and responsive rules in `DESIGN_SYSTEM.md`.
- Start with the user's main task. Keep advanced settings and source details collapsible when they are not needed for the main task.
- Every async screen needs loading, empty, error, and retry states. Every form needs visible labels, inline feedback, and keyboard access.
- Preserve focus styles and semantic HTML. Controls must have an accessible name and a minimum touch target of 40 x 40 px.
- Reuse the global scrollbar rules. Dialog content scrolls inside `.dialog-body`; do not make the complete dialog, its header, or its footer the scrolling surface.
- Check desktop, tablet, and mobile layouts. Cards use three columns only when their text remains readable; reduce to two and one column at the project breakpoints.

## Definition of done for UI work

- Verify the screen against the checklist in `DESIGN_SYSTEM.md`.
- Do not run builds or tests unless the user explicitly requests them; the user performs testing. Check changed code for compilation or syntax errors using a lightweight check when applicable.
- Report any browser, microphone, speech, or responsive behavior that was not directly verified.
- Do not redesign unrelated screens while implementing a bounded feature.

