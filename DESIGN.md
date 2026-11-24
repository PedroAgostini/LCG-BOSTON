---
name: LCG Boston
description: Owner-led Greater Boston remodeling contractor. One brand of graphite, bronze and square geometry, with a light honed-stone world for service landing pages.
colors:
  bronze: "#C0976F"
  bronze-hi: "#D3AD87"
  bronze-press: "#AE8660"
  bronze-text: "#7A5636"
  on-bronze: "#14110E"
  stone: "#EEEBE6"
  stone-2: "#E5E1DA"
  paper: "#F9F8F6"
  field-white: "#FFFFFF"
  ink: "#15181B"
  ink-2: "#3B4045"
  ink-3: "#5C6166"
  rule: "rgba(21, 24, 27, 0.14)"
  rule-2: "rgba(21, 24, 27, 0.28)"
  graphite: "#15181B"
  graphite-2: "#1D2125"
  graphite-3: "#0F1113"
  on-dark: "#ECEAE6"
  on-dark-2: "#B4B2AD"
  rule-dark: "rgba(236, 234, 230, 0.14)"
  danger: "#A3392B"
  danger-on-dark: "#F08A7A"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.1rem, 3.3vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.7rem, 2.7vw, 2.45rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 106"
  body:
    fontFamily: "Figtree, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
    fontVariation: "'wdth' 116"
rounded:
  none: "0px"
  sq: "2px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(72px, 9vw, 136px)"
  wrap: "1320px"
  header: "72px"
  header-mobile: "60px"
components:
  button-primary:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.on-bronze}"
    typography: "{typography.label}"
    rounded: "{rounded.sq}"
    padding: "0 26px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.bronze-hi}"
  button-primary-active:
    backgroundColor: "{colors.bronze-press}"
  button-primary-sm:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.on-bronze}"
    rounded: "{rounded.sq}"
    padding: "0 18px"
    height: "44px"
  button-primary-lg:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.on-bronze}"
    rounded: "{rounded.sq}"
    padding: "0 26px"
    height: "60px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sq}"
    padding: "0 26px"
    height: "54px"
  input-text:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sq}"
    padding: "13px 14px"
    height: "52px"
  zip-start-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "60px"
  option-tile:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sq}"
    padding: "8px 10px"
    height: "48px"
  option-tile-selected:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
  select-field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sq}"
    padding: "13px 44px 13px 14px"
    height: "52px"
  room-chooser-tile:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px 18px"
    height: "96px"
  room-chooser-tile-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
  room-chooser-tile-active:
    backgroundColor: "{colors.graphite-3}"
  link-go:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 0 6px"
  form-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(24px, 3.4vw, 48px)"
  header:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
    height: "{spacing.header}"
  graphite-band:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
    padding: "{spacing.section} 0"
  larger-scope-strip:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    padding: "clamp(28px, 3.4vw, 48px)"
  callout-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "clamp(48px, 6vw, 88px) 0"
  footer:
    backgroundColor: "{colors.graphite-3}"
    textColor: "{colors.on-dark-2}"
  mobile-action-bar:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.on-dark}"
    height: "48px"
---

# Design System: LCG Boston

## Overview

**Creative North Star: "The Brass Profile"**

LCG Boston is one brand expressed in two worlds. The main site (`assets/css/style.css`) is a dark graphite world. Service landing pages (`assets/css/lp.css`, shared by every service LP: bathroom, kitchen, and the combined kitchen and bathroom LP) are built like a finished shower: a pale, warm honed-stone ground, graphite bands, and a slim 1px bronze profile that frames each important plane. Both worlds share the same constants: the official LCG mark, bronze, graphite, the Archivo plus Figtree pair, square geometry, and plain, factual copy. This document records the shared constants and the service-landing-page world in full. The dark main-site world is not redocumented here beyond what it shares.

The landing world is calm and editorial rather than loud. Reading happens on stone in graphite ink; the header, the partner section, the estimate section and the footer drop into graphite to give the page structure. Bronze is used as metal, never as paint over large areas: a 1px inset profile on photographs, square markers, thin rules, the progress bar, and the one solid fill it is allowed, the primary action. Real project photography carries the proof, cropped tall and framed rather than darkened or overlaid with text.

Density is generous on desktop (sections of 72 to 136px) and compact but never cramped on mobile, where a fixed graphite action bar keeps Call and Free Estimate one tap away.

**Key Characteristics:**
- Light warm stone ground, graphite bands, bronze as a 1px brass profile.
- Archivo expanded uppercase for headings and actions; Figtree for reading.
- Square corners everywhere (2px on controls, 0 on panels and photos).
- Flat: depth from tonal bands and hairline rules, not shadows.
- Real photography framed by an inset brass line; no overlays, no stock.
- One action per screen in bronze; calling is the quieter alternative.

## Colors

A restrained palette: warm stone and graphite neutrals carry everything, with a single metallic bronze accent.

### Primary
- **LCG Bronze** (`bronze`): the brand color shared with the main site and the logo. On the landing world it fills only the primary button, the mobile bar's estimate action and the first process node; elsewhere it appears as 1px lines (trust separators, form section rules, the panel's 2px top edge, the process rail, the call-link underline) and as icon color on graphite.
- **Polished Bronze** (`bronze-hi`): hover fill for the primary button, link hover on graphite, pillar and Larger-Scope headings on graphite, room chooser icons and arrows on hover, and the brass frame line (used at 60 to 90% opacity over photos). Also the focus-ring color inside graphite regions.
- **Pressed Bronze** (`bronze-press`): primary button border and active state; the first process node border.
- **Bronze Text** (`bronze-text`): bronze when it must be read on stone (icons in the trust row, call-link icon, drawn room icons and arrows in the room chooser, FAQ toggles and hover text, scope markers, the select chevron, process numbers, the thank-you check square). Plain bronze is too light for text on stone; use this instead.
- **On Bronze** (`on-bronze`): text on any bronze fill, and the text-selection color.

### Neutral
- **Honed Stone** (`stone`): the page ground.
- **Shaded Stone** (`stone-2`): the alternate light band (portfolio).
- **Paper** (`paper`): raised light panels (estimate form panel, staging reviews band, the hero ZIP field, the room chooser row, the mid-page callout band).
- **Field White** (`field-white`): text inputs, textareas, select dropdowns and option tiles inside the paper panel, so fields read one step brighter than their panel.
- **Graphite Ink** (`ink`): primary text on stone; also the focus ring and active field border on light.
- **Ink 2 / Ink 3** (`ink-2`, `ink-3`): secondary text (leads, descriptions, captions) and tertiary text (microcopy, placeholders, optional tags, privacy note).
- **Rule / Rule 2** (`rule`, `rule-2`): hairlines on stone. `rule-2` is the default for list dividers, section-top rules and field borders; `rule` is the track of the form progress bar.
- **Graphite** (`graphite`): header, graphite bands (including the Larger-Scope strip), selected option tiles, the hovered room chooser tile, mobile action bar.
- **Graphite 2** (`graphite-2`): reserved deeper surface in the band palette.
- **Deep Graphite** (`graphite-3`): footer, the pressed room chooser tile, and the base of the photo viewer scrim. It is the same value as the main site's page ground.
- **On Dark / On Dark 2** (`on-dark`, `on-dark-2`): primary and secondary text on graphite.
- **Rule Dark** (`rule-dark`): hairlines on graphite.

### Feedback
- **Brick** (`danger`): error text and error field borders on light surfaces.
- **Coral** (`danger-on-dark`): errors on graphite.

### Named Rules
**The Brass Profile Rule.** Bronze is a line before it is a fill. Photos, lists, form sections and the process rail get a 1px bronze profile; only the primary action is solid bronze.

**The Readable Metal Rule.** Bronze text or icons on stone use Bronze Text, never brand bronze. Brand bronze is for fills, lines, and icons on graphite.

## Typography

**Display Font:** Archivo, variable width (with Helvetica Neue, Arial)
**Body Font:** Figtree (with Helvetica Neue, Arial)

**Character:** Archivo set expanded (font-stretch 104 to 120%) and uppercase gives the brand its built, architectural voice; Figtree at 17px reads warm and plain. Both are loaded from Google Fonts with Archivo's width axis (100 to 125) and weights 500 to 800, Figtree 400 to 600.

### Hierarchy
- **Display** (800, 112% width, uppercase, balanced): the hero H1 only. From 1280px the title is fitted to three unbroken lines inside the 55% copy column (`clamp(2rem, calc(5.31vw - 31.5px), 2.8rem)`); below 760px it is `clamp(1.95rem, 9.2vw, 2.5rem)` with a 16ch measure.
- **Headline** (800, 112% width, uppercase, balanced): every section H2 except the FAQ title, including the thanks state title (smaller, max 18ch). Service row titles use the same voice one step down (`clamp(1.5rem, 2.4vw, 2.1rem)`), as do the estimate panel title (`clamp(1.3rem, 2vw, 1.7rem)`) and the Larger-Scope strip title (`clamp(1.1rem, 1.5vw, 1.35rem)`, max 12ch). The thank-you page title sits between Headline and Display (`clamp(2.2rem, 4vw, 3.4rem)`, line height 0.98).
- **FAQ title** (800, 112% width, title case, `clamp(2.3rem, 4.7vw, 4.1rem)`, line height 1, -0.02em): the one section H2 that is not uppercase, shared by every service LP. It is set larger than Headline, centered over the list. Where the title is short enough it may be held on one line at every width (on phones sized `min(2.3rem, 8.2vw)`).
- **Title** (700, 106% width, sentence case): H3s for scope rows, pillars, process steps, Larger-Scope rows; FAQ questions at `clamp(1.05rem, 1.4vw, 1.2rem)`.
- **Body** (400, 17px, 1.6): reading copy; 16.5px below 760px. Leads at `clamp(1.02rem, 1.2vw, 1.14rem)` in Ink 2, capped at 58ch; FAQ answers at 62ch.
- **Label** (700, 116% width, 0.1em tracking, uppercase): button text. Related functional labels share the voice: the hero ZIP label, the room chooser label and form section legends (700, 112%, 0.14em), gallery room labels (116%, 0.14em), room chooser names (0.95rem, 0.08em), text actions (`link-go`, 116%, 0.8rem, 0.1em), contact and footer definition terms (600, 0.16em), the header context line (600, 120%, 0.2em).
- **Trust items** (Archivo 600, 108%, 0.9rem): short proof statements beside an SVG icon. List items in the service scope list (600, 106%, 0.95rem) and the facts list on graphite (600, 108%, 0.95rem) share this short-statement voice.

### Named Rules
**The Built Caps Rule.** Uppercase is reserved for expanded Archivo: headings, actions and functional labels. Reading copy is always Figtree in sentence case. The FAQ title is the one heading set in title case; it is an exception, not a second heading style.

**The Tabular Numbers Rule.** Phone numbers, ZIP inputs and process numbers use tabular figures.

## Layout

A 1320px content wrap with a fluid gutter (`clamp(16px, 4vw, 48px)`) and section padding of `clamp(72px, 9vw, 136px)`. Headers are sticky at 72px on desktop.

- **Hero:** a named-line grid. Copy takes 55% of the wrap, the photo takes 45% and bleeds to the right viewport edge at full hero height (min of viewport minus header, 860px). Below 900px the photo moves under the copy, full bleed, 3:2; below 760px it becomes 4:5 (4:3 on the kitchen and bathroom LP). The hero's entry is either the ZIP-start or, on the kitchen and bathroom LP, the Room Chooser.
- **Editorial split:** scope, FAQ, why and estimate use asymmetric 5/7 columns (estimate 4/8 above 1180px), with the left heading block sticky under the header. They collapse to one column below 900px and the sticky behavior is dropped.
- **Split head:** a section heading at 7 and its lead at 5, bottoms aligned (heading max 22ch). Centered and stacked below 760px.
- **Service rows:** alternating 7/5 and 5/7 rows (photo on the wide side, 3:2), photo and text trading sides, `clamp(40px, 5vw, 80px)` between rows. One column below 900px with the photo always first.
- **Callout band:** a paper band between hairline rules, heading at 7 and body plus actions at 5; centered with full-width actions on phones.
- **Gallery, looping rows:** two edge-to-edge rows of mixed 4:5, 1:1 and 3:2 photos (`clamp(170px, 17vw, 360px)` tall, 14px gaps) that drift in opposite directions (72s and 64s per loop), fading out at both edges. Hover or focus pauses a row; under reduced motion the loop stops and each row becomes a plain horizontal scroller.
- **Gallery, grouped by room:** a label column (150px) beside one fixed-height row of four photos per room (`clamp(200px, 20vw, 340px)`), column widths set per row to suit the crops. The label stacks above its row below 1024px; below 760px each row becomes a swipe strip (230px tall, snap to start) that runs to the screen edge.
- **Process:** four steps on a horizontal bronze rail; two by two below 1024px; a vertical rail with nodes on the left below 760px.
- **Rhythm:** headings to leads 20px; leads to content blocks `clamp(32px, 5vw, 72px)`; list rows separated by hairlines with 24 to 30px vertical padding.

**Breakpoints** (max-width unless noted):
- 1359px: hero trust row may wrap, so its separators drop.
- min 900px: room chooser tiles and spacing tighten on short viewports (height-aware clamps).
- min 1280px: hero H1 is fitted to three lines.
- 900 to 1279px: hero ZIP field and button stack.
- 1180px: header context line hides; form fields go to one column; estimate split becomes 5/7.
- 1023px: scope rows, pillars and reviews to one column; process to two by two; gallery room labels stack; the Larger-Scope strip goes to one column.
- 899px: hero stacks; editorial splits, split heads, service rows and the callout collapse; form returns to two columns.
- 759px: mobile. Header becomes non-sticky with the context line as a second row; mobile action bar appears; form becomes a two-step flow; full-width section CTAs; room-grouped galleries become swipe strips.
- 380px: action bar and buttons tighten tracking and allow wrapping; option tiles compress.

## Elevation & Depth

The landing world is flat. Depth comes from tonal stepping (stone, shaded stone, paper, field white on light; graphite and deep graphite in bands), hairline rules and the inset brass frame, never from drop shadows. The only shadow in use is a 1px ring that thickens a focused or errored field border.

### Named Rules
**The Flat Stone Rule.** No drop shadows on cards, panels, photos or buttons. To lift a surface, step its tone or rule it with a hairline.

## Shapes

Square geometry, taken from the LCG mark. Controls (buttons, inputs, option tiles) carry a barely softened 2px corner; panels, photos, the hero ZIP join, graphite bands and markers are fully square. Square markers replace bullets: a 9px open bronze square leads each scope row and fills on hover; 7px open squares mark the service scope list (Bronze Text on stone) and the facts list (brand bronze on graphite); process nodes are 44px squares and the thank-you check sits in a 44px open square. Icons are inline SVG strokes at 1.7 with square caps and mitered joins, sized to 1.15em.

**The Brass Frame.** A 1px Polished Bronze line inset from the photo edge (`clamp(10px, 1.4vw, 18px)`), like the profile of a glass shower. On the hero it draws once on load; on gallery tiles it fades in on hover or focus at a 10px inset; a quieter variant at lower opacity frames secondary photos.

## Components

### Buttons
Confident, built, uppercase.
- **Shape:** square (2px), 1px border.
- **Primary:** bronze fill, on-bronze text, Pressed Bronze border; 54px tall by default, 44px small (header), 60px large (hero). A trailing arrow icon nudges 3px right on hover.
- **Hover / Active:** Polished Bronze on hover; Pressed Bronze and a 1px press on active. Transitions 0.25s on the house ease.
- **Ghost:** transparent with a Rule 2 border and ink text; border goes to ink on hover. Used for the form's Back action, with the arrow nudging left.
- **Call link:** Figtree 600 ink text with a phone icon in Bronze Text and a 1px bronze underline that turns ink on hover. This is how calling is offered beside every primary action.

### Header
Graphite, sticky, 72px: the official logo at 40px, a centered context line ("Service | Area", bronze separator), the phone number with a bronze icon and a small primary button. Below 760px it becomes static, the CTA hides, the phone becomes a 44px bordered target, and the context line moves to a second row.

### Hero ZIP-start
The signature entry. A labeled 60px ZIP field on paper, joined edge to edge with a large primary button inside one 1px ink outline (focus rings the whole row). Below 1280px (desktop) and on mobile the field and button stack as separate bordered pieces. Validation message sits below in Ink 2, or Brick when it is an error. The ZIP typed here is carried into the estimate form, which opens on the next question.

### Room Chooser
The hero entry on the kitchen and bathroom LP, in place of the ZIP-start. An uppercase label over three square tiles (Kitchen, Bathroom, Both) held in one 1px ink outline on paper, divided by Rule 2 hairlines. Each tile carries a drawn room icon and an arrow in Bronze Text over the room name in uppercase Archivo; tiles are 96px tall (88px on phones). Hover inverts the tile to graphite with Polished Bronze icon and arrow, the arrow nudging 3px right; press steps to Deep Graphite; focus is a 2px ink outline. One click preselects Project Type in the estimate form, scrolls to it and focuses the next unanswered question; any service action can do the same. Ink 3 microcopy sits below.

### Trust Row
Short proof statements with SVG icons in Bronze Text, separated by 1px bronze vertical rules. Separators drop when the row can wrap. On graphite the text is on-dark and icons are bronze. On the kitchen and bathroom hero the four statements sit in a 2 by 2 grid without separators; on phones only the first two show, on one centered line.

### Text Links
- **Text action** (`link-go`): uppercase Archivo label with a trailing arrow in Bronze Text over a 1px bronze underline; the underline turns ink and the arrow nudges 3px on hover. On graphite the text is on-dark, the arrow Polished Bronze. Used for per-service starts that sit below a primary action in rank.
- **Quiet link** (`link-quiet`): Figtree 600 in Ink 2 with a Rule 2 underline that turns bronze on hover. Used for secondary paths such as "see the work" or "back to the site".

### Scope List
A ruled list: Rule 2 hairlines between rows, each row a square bronze marker, an H3 and a description in two columns (one column below 1024px).

### Service Rows
Alternating photo and text rows, one per room. The photo is a 3:2 crop with the quiet brass frame. The text holds an uppercase service title, an Ink 2 paragraph (46ch), a two-column scope list (Rule 2 hairlines, each item led by a 7px open square in Bronze Text) and one primary button that preselects that room in the form.

### Larger-Scope Strip
A graphite strip with a 2px bronze top edge for services without real photography: an uppercase title at 3 columns beside two text rows at 9, each with a Polished Bronze H3, On Dark 2 copy and a text action. Text only by design; no renders stand in for work.

### Gallery and Viewer
Two patterns share one tile. Looping rows serve the single-service LPs; the room-grouped portfolio (label column and fixed-height rows) serves pages that show more than one room. Tiles are square photo buttons on a Graphite 2 ground. Hover scales the photo 5% over 0.9s and reveals the brass frame and a graphite zoom chip (always visible on mobile). Tiles open a native full-screen dialog on a 96% deep-graphite scrim, with square 48px bordered close, previous and next controls (bottom-centered on mobile).

### Graphite Bands
Sections inverted to graphite with on-dark text and Rule Dark hairlines. The partner section pairs a framed portrait with two-column pillars whose headings are Polished Bronze.

### Process Rail
Square 44px nodes with numbers in Bronze Text on a 1px bronze rail; the first node is filled bronze to mark where the visitor starts.

### FAQ
Native details elements between Rule 2 hairlines. Questions in Archivo title type; a plus icon in Bronze Text rotates 45 degrees to close. Hover tints the question Bronze Text.

### Estimate Form
- **Panel:** paper on the graphite band, square, with a 2px bronze top edge.
- **Layout:** two fieldsets ("Your project", "Your contact") side by side, each headed by an uppercase legend over a 1px bronze rule. One column from 1180 to 900px. Below 760px it becomes a two-step flow with a "Step 1 of 2" label and a 2px bronze progress bar on a Rule track.
- **Inputs:** field white, 1px Rule 2 border, 2px corner, 52px minimum height, 16px text (prevents iOS zoom). Hover darkens the border to Ink 3; focus sets an ink border plus a 1px ink ring. Errors switch both to Brick, with a 600-weight Brick message below. Contextual notes sit beside a 1px bronze left rule.
- **Option tiles:** radio groups as 48px square tiles in two or three columns; selected tiles invert to graphite with on-dark text.
- **Select dropdowns:** the compact alternative to option tiles when a form must stay short on phones. Field white, Rule 2 border, 2px corner, 52px tall, a bronze chevron (Bronze Text) at the right; the unchosen placeholder reads in Ink 3. Hover, focus and error states match the text inputs.
- **Panel head:** an uppercase panel title with an Ink 2 line under it, 26px above the first fieldset.
- **Facts list:** beside the panel on graphite, short statements between Rule Dark hairlines, each led by a 7px open bronze square.
- **Privacy note:** small Ink 3 text led by a lock icon in Bronze Text.

### Thanks State
Replaces the form in place: a check icon in Bronze Text, an uppercase headline, Ink 2 copy and a single primary action. Used when a page has no thank-you page, or when storage is blocked.

### Thank-you Page
A separate, deliberately minimal page under the normal header and footer: a 44px open check square in Bronze Text, the uppercase title, one lead line, and a centered row with the call link and a quiet "back to the site" link. Everything is centered in a stone section at least most of the viewport tall. The page confirms the request and counts the conversion: the form leaves a one-time pass in session storage after the request is confirmed, and the page fires the conversion once from that pass; a refresh or a direct visit fires nothing.

### Callout Band
A paper band between Rule hairlines in the middle of the page: a headline beside short Ink 2 copy, a primary button and the call link.

### Footer
Deep graphite with the official logo at 44px, a short brand paragraph, a contact list with uppercase Archivo terms, legal links separated by bronze bars, and a hairline above the legal line.

### Mobile Action Bar
Below 760px: a fixed graphite bar with two equal actions, Call (bordered, bronze phone icon) and Free Estimate (bronze fill), respecting the safe-area inset. It slides away while the hero ZIP-start, the room chooser or the estimate form is in view.

## Do's and Don'ts

### Do:
- **Do** use the official logo files from `assets/img/brand/` as supplied (the bronze lockup on graphite), never redrawn or recolored.
- **Do** keep every corner square: 2px on controls, 0 on panels, photos and joins.
- **Do** frame real project photos with the 1px inset brass line instead of overlays or gradients.
- **Do** use Bronze Text (`bronze-text`) for bronze icons and text on stone; reserve brand bronze for fills, lines and graphite contexts.
- **Do** pair every primary action with the call link as the quieter alternative.
- **Do** write all shipped copy in American English without em dashes.
- **Do** keep focus visible: a 2px ink outline on light, Polished Bronze inside graphite regions.
- **Do** honor reduced motion: the brass-frame draw and photo settle are skipped, transitions collapse.

### Don't:
- **Don't** fill large areas with bronze; the primary action is its only solid surface.
- **Don't** add drop shadows to cards, panels, photos or buttons; step the tone or add a hairline.
- **Don't** set reading copy in uppercase or in Archivo; Figtree carries all running text.
- **Don't** use rounded corners or pill shapes on any control.
- **Don't** use glyph or emoji icons; icons are inline SVG strokes with square caps.
- **Don't** present several photos of the same room as separate projects in the gallery.
