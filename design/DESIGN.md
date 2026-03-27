# Design System: Warm Canvas

## 1. Creative Direction

**Theme:** Homely, friendly, playful yet modern minimalist.

The quiz feels like a fun personality quiz on a well-designed lifestyle app — not a housing application form. Every decision prioritises warmth, clarity, and delight without tipping into gimmick territory.

**Not this:** no gradient fills, no glows, no purple radial effects, no editorial coldness.

---

## 2. Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg-base` | `#FAF7F2` | Full-screen background — warm cream |
| `quiz-card` | `#FFFFFF` | Option cards, sliders, text areas (`bg-quiz-card`) |
| `purple-primary` | `#5B3E8F` | Selected state fill, Next button, progress fill |
| `purple-light` | `#EDE6F6` | Progress bar track, disabled button |
| `ink-primary` | `#1A1523` | Question text (`text-ink-primary`) |
| `ink-muted` | `#7C6F8E` | Counter, labels, hints (`text-ink-muted`) |
| shadow | `rgba(0,0,0,0.07)` | Card lift |
| `border-purple-primary/40` | `#5B3E8F` at 40% | Ghost border on focused inputs |

**Rules:**
- No gradient fills — all surfaces are flat colour
- Glassmorphism permitted for the Next button backdrop only
- Shadows must stay at `rgba(0,0,0,0.07)` or lighter
- No 1px solid dark decorative borders

---

## 3. Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Section title | Instrument Serif | `1.75rem` | 400 italic |
| Question | Plus Jakarta Sans | `1.375rem` | 700 |
| Option label | Plus Jakarta Sans | `1rem` | 500 |
| Section label | Plus Jakarta Sans | `0.75rem` | 600 (small-caps) |
| Counter | Plus Jakarta Sans | `0.875rem` | 500 |
| Next button | Plus Jakarta Sans | `1rem` | 600 |
| Hints / placeholders | Plus Jakarta Sans | `0.875rem` | 400 |

Instrument Serif is used **only** for section transition titles. Plus Jakarta Sans handles everything else.

---

## 4. Layout — One Question Per Screen

```
┌─────────────────────────────┐
│  [HAT]━━━━━━━━━━━━━━━  3/12 │  ← progress bar, pinned top
├─────────────────────────────┤
│                             │
│  PERSONALITY                │  ← small-caps label
│                             │
│  Question text here         │  ← bold, centered
│                             │
│  ┌─────────────────────┐    │
│  │ Option A            │    │  ← white cards, 12px gap
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ Option B            │    │
│  └─────────────────────┘    │
│                             │
├─────────────────────────────┤
│  [        Next →        ]   │  ← fixed pill button
└─────────────────────────────┘
```

- `24px` horizontal padding
- `32px` between question and options
- `12px` between option cards
- `24px` above Next button

---

## 5. Progress Bar

- Track: `4px` tall, `#EDE6F6`, full width, pinned to top
- Fill: `#5B3E8F`, advances left-to-right
- Tracker: `SortingHatAI.png` (smiling purple hat), `28px`, slides along track with `transition: left 300ms ease`
- Counter: `"3 / 12"` right-aligned, `text-muted`

---

## 6. Section Transitions

Between sections (Personality → Preferences → Setup), a full-screen interstitial:
- Cream background
- Instrument Serif section title centered (e.g. *"Now, your preferences."*)
- Muted subtext in Plus Jakarta Sans
- Auto-advances after `1500ms` or on tap
- Slides in from right, same spring transition as questions

---

## 7. Slide Transitions

- **Next:** current slides left-out, new slides right-in
- **Back:** current slides right-out, previous slides left-in
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` incoming, `ease-in` outgoing
- **Duration:** `300ms`

---

## 8. Components

### Multiple Choice
- Full-width white card, `16px` radius, `rgba(0,0,0,0.07)` shadow
- Selected: flat `#5B3E8F` fill, white text, `scale(1.02)` for 150ms
- No radio buttons — card is the selector
- Explicit Next required (no auto-advance)

### Slider
- White card container
- Track: `4px`, `#EDE6F6` base, `#5B3E8F` filled
- Thumb: white circle `20px`, `2px` solid `#5B3E8F`, card shadow
- Floating value pill above thumb
- Left/right labels in `text-muted` below

### Text Area
- White card, no border at rest
- Focus: `1px` solid `#5B3E8F` at 40% opacity
- Min height `120px`, character hint bottom-right

### Select
- Replaced with tap-to-select cards — identical to multiple choice
- No `<select>` dropdowns

### Checkbox
- Single white card
- Custom `20px` square checkbox, fills `#5B3E8F` on selection with white checkmark

### Next Button
- Fixed bottom, full-width pill (`border-radius: 9999px`), `56px` tall
- Active: flat `#5B3E8F`, white "Next →"
- Disabled: `#EDE6F6` fill, `#7C6F8E` text
- Glassmorphism backdrop behind button: `backdrop-blur: 8px`, cream at 80% opacity

---

## 9. Success Screen

- Cream background
- `SortingHatAI.png` centered, `80px`
- *"You're all set!"* in Instrument Serif `1.75rem` italic
- Subtext in Plus Jakarta Sans muted
- Gentle fade-in only — no confetti

---

## 10. Assets

| File | Usage |
|------|-------|
| `design/SortingHatAI.png` | Progress tracker + success screen |
| Plus Jakarta Sans | via `next/font/google` |
| Instrument Serif | via `next/font/google` |
