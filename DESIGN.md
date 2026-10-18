# Arman Homes — design system

Static, multi-page marketing site for a real estate agency in Hinjewadi Marunji, Pune. Primary actions: explore properties, start an enquiry (call / WhatsApp / form).

## Brand
- Supplied logo is the source of truth. `logo.webp` (original colours, background removed) sits on the ivory scrolled header; `logo-reversed.webp` (dark lettering → ivory, gold untouched) sits on navy surfaces. Regenerate with `npm run logo`.
- Colours (tokens in `src/styles/base.css`): midnight navy `#071827`, champagne `#f1c66a`, dark gold `#866020` for text on light, bronze `#b98a3a` for lines/focus, paper `#faf9f6`, sand `#f3efe6`.
- Type: Cormorant Garamond 700 (Title Case display headings, gold second lines) + Manrope (UI/body, 15px base). Self-hosted.

## System
- Layout: `--wrap` = min(1320px, 90vw); full-bleed hero, spotlight, film and contact bands; 20px gutters on phones.
- Shape: radii 6 / 10 / 14px, pill buttons. Shadows are soft, navy-tinted.
- Buttons: directional colour fill on hover (`::before` scaleX), arrow nudge. No shine, glow or shimmer.
- Section rhythm alternates paper → white → navy → sand so each block reads distinctly.
- Header: solid navy bar (sticky), shadow after scroll.
- Phones get a bottom quick-contact bar (Call / WhatsApp / Enquire); desktop gets a floating WhatsApp button.

## Motion
- One-time IntersectionObserver reveals (`data-reveal`, optional `--delay`), hero copy rise, Ken Burns hero slideshow (pauses on hover/focus and when the tab is hidden), card image zoom, film loop that plays only while visible.
- Brief first-visit loader (once per session, auto-dismisses by CSS even if JS fails).
- `prefers-reduced-motion` disables all of it; content is visible without JavaScript.
- Nothing depends on hover; touch devices get the same content and links.

## Homepage structure
Hero slideshow of the four Life Republic projects (Ken Burns crossfade, per-project chip, numbered progress controls, “Watch the Film”) → overlapping search → six service shortcuts → project cards → Canvas – D Tower spotlight (dark) → film band (silent loop + modal) → township (stats, mosaic, nearby, drive times, master layout, location map) → handpicked listings → About split → Why Choose (dark cards) → contact band → footer. Typography and section order follow the approved reference design; headings are Title Case without italic accents.

## Content rules
- No invented stats, awards or testimonials. Project facts come only from the supplied write-ups and brochures; renders are labelled “Artist’s impression”; RERA numbers shown only where supplied.
- Listing photos are AI-generated placeholders until real photos are supplied.
- Photography is illustrative; the footer states this on every page.
