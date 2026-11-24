# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Homeowners in Greater Boston and Eastern Massachusetts planning a complete remodel, addition or ADU, preferably larger-scope projects rather than one-off maintenance. Paid-search visitors (Google Ads) arrive with a specific service intent, such as "bathroom remodeling contractors", and decide quickly whether to request an estimate or call.

## Product Purpose

LCG Boston LLC is a licensed and insured general contractor based at 4 Draper St, Woburn, MA. The website and service landing pages exist to generate valid estimate requests and scheduled site evaluations. Phone calls are a secondary path, measured separately. Success means qualified, in-area leads at a cost per opportunity compatible with project ticket size.

## Positioning

Owner-led projects with 20+ years of residential construction and remodeling experience in New England: direct communication with the people overseeing the work, not a call center. Custom, detailed proposals built around the home's actual scope. Support with architects/designers, planning, permits and inspections as the scope requires.

## Operating Context

- Leads arrive through a web form delivered by Web3Forms (email of record) and copied to a lead webhook; GTM container GTM-NK6386ZL; Google Ads conversion "LCG - Form Submit" fires from the `generate_lead` dataLayer event only after server confirmation.
- "LCG - Calls from Ads" is measured in Google Ads, separate from on-site phone clicks.
- Every ZIP is validated by the team before a site visit.
- Production: lcgbostonllc.com. Staging: lcg.escolats.com.br (noindex).

## Capabilities and Constraints

- Static HTML/CSS/JS on Apache (`.htaccess`), no build step; libraries via pinned CDN.
- Phone (781) 732-1899 (`tel:+17817321899`); email info@lcgbostonllc.com.
- Bathroom scope named by the company: tile, custom glass, plumbing, cabinetry/vanities, fixtures, as parts of complete renovations.
- Public promises currently made: Free Estimate; reply within one business day (pending client reconfirmation).
- Undecided: license numbers (HIC/CSL) not yet published.

## Brand Commitments

- Name: LCG Boston LLC. Official logo files in `assets/img/brand/` (use as supplied, never redrawn).
- All public copy is in American English. No em dashes in shipped copy.
- Service landing pages must each carry their own photos, services, copy and FAQ; no near-duplicate pages.

## Evidence on Hand

- Real project photos from the client's Drive, curated in `assets/img/curated/` (see `photo-curation/LEIA-ME.md`). Several photos show the same room from different angles; never present them as separate projects.
- No verified testimonials yet. Homepage reviews are placeholders written during development and must not appear on production pages.
- Do not invent prices, discounts, warranties, timelines, star ratings, project counts, financing or reviews.

## Product Principles

1. Truth over persuasion tricks: every claim on the page must be verifiable by LCG.
2. Real work is the proof: completed-project photography leads.
3. One clear action: request an estimate; calling is the alternative, never a fake conversion.
4. Measure honestly: one confirmed submission equals one conversion, with no PII in analytics.

## Accessibility & Inclusion

WCAG AA contrast, keyboard navigation, visible focus, labeled fields, accessible errors, `prefers-reduced-motion` respected, responsive from 320px.
