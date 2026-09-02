---
name: ionic-best-practice
description: Review Angular component templates in this Ionic project for idiomatic Ionic usage instead of hand-rolled HTML. Use whenever creating or editing a .page.html/.component.html template in this repo, or when asked to check Ionic best practices. If everything already follows Ionic conventions, make no changes.
---

# Ionic Best Practice

This project is an Ionic/Angular app. Templates should prefer Ionic components over native HTML — Ionic already themes, animates, and makes accessible the vast majority of UI, so custom markup means that piece of the UI diverges from the framework's theming, dark mode, and platform styling (iOS vs Material).

## What to check

For every `.html` template you write or touch, scan for native tags that have a direct Ionic replacement, and swap them:

| Instead of | Use |
|---|---|
| `<button>` | `ion-button` |
| `<input>` / `<textarea>` / `<select>` | `ion-input` / `ion-textarea` / `ion-select` |
| `<input type="checkbox">` / `type="radio"` | `ion-checkbox` / `ion-radio` |
| a page's top bar (`<header>`/`<nav>`) | `ion-header` + `ion-toolbar` + `ion-title` |
| `<ul>`/`<li>` list markup | `ion-list` + `ion-item` |
| `<img>` for content images | `ion-img` (lazy-loaded) — plain `<img>` is still fine for small inline icons |
| a hand-built loading spinner | `ion-spinner` |
| a modal/dialog overlay built from `<div>` + CSS | `ion-modal` / `ModalController` |
| a toast/snackbar notice | `ion-toast` |
| an action sheet / bottom sheet | `ion-action-sheet` |
| a tab bar | `ion-tabs` + `ion-tab-bar` + `ion-tab-button` |
| icons (inline SVG or `<img>`) | `ion-icon` from `ionicons` |
| the page's scrollable root wrapper | `ion-content` (needed for Ionic's scroll, pull-to-refresh, and safe-area handling) |

## What's fine as-is

Not everything needs an Ionic wrapper — don't invent one where Ionic doesn't provide it:

- `<form (ngSubmit)="...">` — Ionic has no form component; a native `<form>` is the standard pattern even in idiomatic Ionic apps.
- `<div>` for layout/grouping, `<span>`, `<p>`, `<h1>`–`<h6>`, `<a>`, `<strong>` — normal inside or around Ionic components (e.g. `<h2>`/`<p>` inside `ion-label` for a two-line item is documented Ionic usage; a plain `<a>` for an external link is fine).
- `ion-grid`/`ion-row`/`ion-col` are optional — plain flexbox/CSS in `<div>`s is acceptable when the grid component doesn't fit the layout.

## How to review

1. Grep the changed or target templates for the tags in the left column above.
2. For each hit, check the surrounding context: is it standing in for something Ionic already provides, or is it plain structural/text markup with no Ionic equivalent (see "What's fine as-is")?
3. Only convert genuine stand-ins. Don't wrap already-fine markup in Ionic components just for the sake of it.
4. If nothing needs to change, say so and stop — don't refactor working templates without a reason.
