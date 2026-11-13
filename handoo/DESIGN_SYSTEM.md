# Hanul design system

This document is the source of truth for new screens and features. The visual direction follows the current vocabulary reference: a clear turquoise brand, white learning cards, dark readable text, and a small amount of warm orange for tests and emphasis.

## 1. Design principles

1. **Learning content comes first.** Decoration must not compete with Korean text, Vietnamese meaning, progress, or the current exercise.
2. **One screen, one main action.** Make the next learning step obvious. Place secondary actions in outline or text buttons.
3. **Reveal complexity gradually.** Show the word and meaning first; place examples, source notes, and advanced filters in expandable areas.
4. **Use consistent meaning.** The same color and component must mean the same thing throughout the product.
5. **Design for scanning.** Use short headings, grouped content, stable card grids, and clear whitespace.

## 2. Color tokens

Use semantic variables from `src/styles.css`; do not copy hex values into new component rules.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-brand` | `#36afa7` | Header, progress, audio control, brand illustration |
| `--color-brand-strong` | `#168e86` | Primary buttons, links on light surfaces, selected states |
| `--color-brand-hover` | `#11766f` | Hover/pressed state for primary actions |
| `--color-brand-soft` | `#dff4f1` | Selected tab background, progress badge, subtle highlight |
| `--color-accent` | `#f59e0b` | Test action, warning, “new” badge; use sparingly |
| `--color-text` | `#202a35` | Headings and primary text |
| `--color-text-muted` | `#66727d` | Supporting text, metadata, placeholders |
| `--color-page` | `#f6f6f7` | Page background |
| `--color-surface` | `#ffffff` | Cards, dialogs, fields, menus |
| `--color-border` | `#e6e8eb` | Default borders and dividers |
| `--color-success` | `#168078` | Learned/correct state with text or check icon |
| `--color-success-soft` | `#ddf3f0` | Learned/correct background |
| `--color-danger` | `#b42318` | Error text and destructive actions |
| `--color-danger-soft` | `#fee4e2` | Error background |

### Color rules

- The header uses `--color-brand` with white text.
- Primary buttons use `--color-brand-strong`; hover uses `--color-brand-hover`.
- Outline buttons use a white surface, brand border, and strong brand text.
- Orange is reserved for “Kiểm tra”, warnings, and a single special action. Never use orange for ordinary navigation.
- Cards stay white. Use soft brand color for selection instead of filling the whole card with saturated turquoise.
- Text uses `--color-text` or `--color-text-muted`. Avoid light gray text on white.
- Error, success, and warning messages always include text or an icon; color is supporting information.

## 3. Typography

- UI and Vietnamese: `Be Vietnam Pro`.
- Korean: `Noto Sans KR` and `lang="ko"`.
- Page title: 28–42 px desktop, 23–34 px mobile, weight 600.
- Section title: 19–24 px, weight 600.
- Card title/Korean word: 15–22 px, weight 600.
- Body: 13–15 px with line-height 1.6–1.9.
- Metadata: 11–12 px. Do not place essential instructions below 12 px.
- Use sentence case. Avoid all caps except short labels of at most three words.

## 4. Spacing, radius, and elevation

Use an 8 px spacing rhythm. Accepted values: 4, 8, 12, 16, 24, 32, 40, 48, 64 px.

- Page horizontal padding: 40 px desktop, 20 px tablet, 16 px mobile.
- Section gap: 32–48 px.
- Card grid gap: 15–18 px.
- Card padding: 17–24 px.
- Control gap: 8–12 px.
- Button height: at least 40 px; touch target at least 40 x 40 px.
- Small control radius: 7–9 px.
- Card radius: 11–14 px.
- Dialog/feature panel radius: 14–18 px.
- Default card shadow: `--shadow-card`. Hover may use `--shadow-card-hover`. Do not stack multiple strong shadows.

## 5. Layout and responsive behavior

- Content width follows the existing `#workspace` maximum width.
- Desktop card grids may use three columns.
- At 1000 px and below, use two columns.
- At 600 px and below, use one column for learning cards and stack heading actions when space is tight.
- Navigation may scroll horizontally on small screens; labels must remain readable and controls must not shrink below their touch target.
- Avoid fixed card heights when content can wrap. Prefer `min-height` and natural growth.
- Group vocabulary by `categoryTitle`; retain data order. Each group shows its Vietnamese heading, optional Korean label, count, then the existing word-card grid.

## 6. Component behavior

### Header and navigation

- Brand turquoise background and white content.
- Active navigation uses a translucent white background.
- Counts use a white badge with strong brand text.
- Keep one account action at the right; collapse or wrap responsibly on mobile.

### Buttons

- Primary: next step, submit, start, save.
- Outline: filter, cancel, alternate path.
- Text: low-priority navigation or help.
- Accent/orange: test or warning action only.
- Disabled state must remain legible and cannot rely on opacity below 45%.

### Cards

- White surface, subtle border, one light shadow.
- Title and main learning content appear first.
- Secondary details are smaller and muted.
- Hover changes border/shadow slightly; do not move cards more than 2 px.

### Forms and feedback

- Always show a label, even when a placeholder exists.
- Validate after user interaction and place feedback near the relevant control.
- Correct answers use success color plus text/check.
- Incorrect answers show the expected answer and a useful next step.

### Loading, empty, and error states

- Loading state explains what is loading and uses the Hanul mark/spinner.
- Empty state explains why it is empty and offers one useful action.
- Error state uses plain language and a retry action when retry is possible.
- Do not expose stack traces or implementation details in the UI.

## 7. Accessibility

- Normal text contrast: at least 4.5:1. Large text and meaningful UI boundaries: at least 3:1.
- Preserve visible keyboard focus using the brand focus ring.
- Use real headings in a logical order and semantic buttons/links.
- Icon-only buttons need `aria-label`.
- Selected tabs/modes use `aria-pressed`, `aria-current`, or the correct tab semantics.
- Motion must respect `prefers-reduced-motion`.
- Do not autoplay audio. Microphone actions must be explicit and explain browser support/privacy.

### Scroll areas

- Use the global scrollbar styling from `src/styles.css`; do not define a competing scrollbar color or width in individual components.
- A dialog keeps its header and footer fixed while `.dialog-body` owns vertical scrolling.
- Long sidebars and result lists use `overscroll-behavior: contain` and `scrollbar-gutter: stable` to avoid page scroll chaining and layout jumps.
- Do not hide a scrollbar for a primary content area. Horizontal mobile navigation may remain compact, but it must still support touch and keyboard scrolling.
- Keep at least 12 px between readable content and the scrollbar. Scroll thumbs use the neutral semantic tokens and become darker on hover.

## 8. Screen template

Use this order unless the task requires another flow:

1. Breadcrumbs or a clear back link.
2. Page title and one-line purpose.
3. Progress/status and one primary action.
4. Mode/filter controls.
5. Main content grouped into readable sections.
6. Empty/loading/error feedback in the same content region.
7. Secondary source/help information at the end or inside a disclosure.

## 9. Review checklist

Before finishing a new screen or feature, verify:

- [ ] All colors use semantic tokens.
- [ ] One primary action is visually dominant.
- [ ] Orange appears only for a test, warning, or special emphasis.
- [ ] Text and controls meet contrast requirements.
- [ ] Loading, empty, error, success, and disabled states are handled.
- [ ] Keyboard focus order and focus ring work.
- [ ] Icon-only controls have accessible names.
- [ ] Korean text uses `lang="ko"` and the Korean font.
- [ ] Desktop, tablet, and mobile layouts remain readable.
- [ ] Long Vietnamese and Korean strings can wrap without clipping.
- [ ] Changed code has no compilation or syntax errors; the user performs testing. Do not run builds or tests unless explicitly requested.

