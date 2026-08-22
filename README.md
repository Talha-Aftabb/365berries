# 365 Berries — Website Redesign Concept

A complete, working redesign of [365berries.com](https://365berries.com/), built as a pitch
piece you can put in front of the client.

**Files:** `index.html` · `privacy.html` · `terms.html` · `cookies.html` · `styles.css` ·
`main.js` · `i18n.js` — no build step, no dependencies, no CDN JavaScript. Open
`index.html` in any browser and it works.

**Bilingual: English + Spanish**, switchable from the header (EN / ES).

---

## 1. The pitch — what's wrong with the current site

Use these as your talking points. Every one of them is a business problem, not a taste
argument, which is what makes a client say yes.

| Current site | Cost to the business |
|---|---|
| GoDaddy Website Builder template, 2 pages | Looks like a side project, not a trading house. Buyers moving six-figure volumes judge this in 3 seconds. |
| Copyright still reads **2023** | Reads as dormant. A buyer checking a new supplier assumes the company may not be active. |
| No product detail — berries named in one sentence | Nothing to specify against. A buyer can't tell if you can serve them without emailing first. |
| No availability information at all | The single most valuable thing a produce buyer wants to know — *what can you load, and when* — is missing. |
| No origins, no process, no quality/standards | Every competitor states these. Their absence reads as "we don't have them." |
| Contact form is name + email only | No product, no volume, no window. Every enquiry needs a second email before it can be quoted. |
| English only | A Spanish company selling from Huelva, with Spanish-speaking growers and suppliers, has no Spanish site. |
| Not built for mobile | Buyers and agents check suppliers on a phone, in a market, at 6am. |
| No SEO structure, no metadata, no social preview | Invisible in search; a pasted link into WhatsApp or email shows nothing. |

## 2. What the new site does about it

- **A real value proposition above the fold** — "Berries in season, 365 days a year" ties
  directly to the company name and to what the business actually sells.
- **An interactive availability calendar** — 4 lines × 12 months, current month highlighted
  automatically. This is the standout feature and the one buyers will actually use. No
  competitor's brochure site does this well.
- **A live "in season now" indicator** in the hero that updates itself from the date — the
  site never looks stale again.
- **Product depth** — each berry gets formats, classes and freight modes, so a buyer can
  self-qualify before contacting.
- **Origins section** with hemisphere windows, making the "365 days" claim concrete.
- **A process section** that sells the thing a trader actually sells: reliability.
- **A qualifying enquiry composer** — product, enquiry type, volume, format and delivery
  window, with inline validation. It needs no backend: it formats the answers and opens
  WhatsApp with the message ready to send (see section 4a).
- **Motion throughout** — masked headline reveals, scroll-linked timeline, parallax hero,
  animated counters, staggered card reveals, marquee ticker, preloader. All of it respects
  `prefers-reduced-motion`.
- **Full English/Spanish switching** — see section 4.
- **Responsive and accessible** — verified at 375 / 768 / 1024 / 1440px with no horizontal
  scroll, 40px+ touch targets, visible focus rings, semantic headings, labelled form fields.

---

## 3. ⚠️ Read this before the site goes live

I wrote realistic industry-standard content so the pitch reads like a finished site. **Some
of it is placeholder and must be confirmed with the client before publishing.** Going live
with unverified claims is a legal and commercial risk, not just an accuracy one.

**Must be verified or replaced:**

| Where | What to confirm |
|---|---|
| Hero + Quality stats | `04 lines · 07 origins · 12 months · 24h quote response` — invented plausible figures. |
| Availability calendar (`main.js` → `CROPS`) | Month-by-month levels are industry-typical, **not** the client's actual windows. Get their real ones — this is the section buyers will rely on. |
| Origins list | The seven countries and their windows are typical for the trade. Confirm which the client actually sources from. |
| **Certifications** (GLOBALG.A.P., GRASP, BRCGS, IFS, Organic, Sedex) | **Highest risk item.** These are real certification schemes. Do not publish any the client's supply base doesn't genuinely hold. |
| Testimonials | Placeholder, deliberately anonymised (role + sector, no names or companies). Replace with real approved references or delete the section. |
| Product copy | Formats, calibres and claims are plausible industry defaults — confirm each. |
| **Legal pages** (`privacy.html`, `terms.html`, `cookies.html`) | Built and working, but they are **templates, not legal advice**. `terms.html` has two `[TO BE COMPLETED]` gaps (registered office, Commercial Registry details) that only the client can fill. Retention periods and processor lists are assumptions. Must be reviewed by a lawyer. |

**Already real** (taken from the current live site): company name `365Berries SL`,
`NIF B72697436`, `david@365berries.com`, `+34 612 584 209`, and the "Always available 365"
positioning.

The on-page "concept redesign" banner has been removed. That means nothing on the page
itself signals that this is a proposal — so say it in the message you send with the link,
and keep the `noindex` guards (section 8) in place until the content is approved.

---

## 4. Languages (EN / ES)

Every piece of copy on the page is translated. The switcher is in the header.

- **All text lives in `i18n.js`** — two dictionaries, `en` and `es`, keyed by short strings.
  Nothing is hard-coded in the markup; the HTML holds English as a readable fallback only.
- The page picks the language from, in order: the visitor's saved choice
  (`localStorage`), then their browser language (a Spanish browser gets Spanish
  automatically), then English.
- Switching also updates `<html lang>`, the `<title>`, the meta description, form
  placeholders and validation messages, `aria-label`s, the map pin labels, and the
  availability calendar's month names, berry names and tooltips.

**To edit a translation:** find the key in `i18n.js` and change the string. To add a third
language, copy the `es` block, rename it (e.g. `fr`), translate the values, and add one
button to the `.lang` group in `index.html` with `data-lang="fr"`.

**How the markup hooks in:**

| Attribute | Use |
|---|---|
| `data-i18n="key"` | replaces the element's text |
| `data-i18n-html="key"` | replaces inner HTML — for strings containing `<em>` or `<span class="ital">` |
| `data-i18n-attr="placeholder:key"` | sets an attribute; comma-separate for several |

The Spanish is written for the trade, not translated literally — it uses *berries*,
*operaciones spot*, *contraestación*, *tarrina* and *palé* as the sector actually uses them.
Worth having the client read it once; regional wording preferences are the kind of thing
they will have an opinion about.

**Before launch:** if the client wants both languages indexed separately in search, they
need real URLs (`/es/`) and `hreflang` tags rather than a client-side toggle. That is a
small build step, and worth quoting as part of the SEO line item.

## 4a. The enquiry composer (no backend)

There is no server behind this site, so the contact form does not post anywhere. Instead it
**composes** the enquiry and hands it off:

- **Send on WhatsApp** — validates the fields, formats them into a readable message and opens
  `wa.me/34612584209` with it pre-filled. Works on desktop (WhatsApp Web) and mobile.
- **Copy enquiry** — puts the same formatted text on the clipboard to paste into any email
  client.

The message is built in the active language, so a Spanish visitor sends David a Spanish
enquiry. Nothing is stored, transmitted to, or logged by this site — which is also why the
cookie policy stays accurate.

This is deliberately a better fit than a form for this business: the produce trade runs on
WhatsApp, David already lists WhatsApp as a contact method, and the enquiry lands on his
phone rather than in a spam folder. It also keeps the qualifying questions, which a plain
"email us" button would lose.

**Phone number lives in `main.js`** as `WHATSAPP = '34612584209'` (country code, no `+`).

### If the client later wants a real form

Swap it for a hosted form endpoint — no backend still required:

| Service | Free tier |
|---|---|
| Web3Forms | unlimited, just an access key |
| Formspree | 50 submissions/month |
| Vercel Forms / Netlify Forms | included with hosting |

It is a one-line change: give the `<form>` an `action` and `method="POST"`, and remove the
submit handler in `main.js`. Worth quoting as a small line item rather than doing for free.

## 5. The logo

The client's current logo is a 3D cartoon bubble-letter lockup in primary yellow / red /
blue, with photographic berries scattered around it on a square canvas.

**Three problems, in order of how much they cost:**

1. **It signals the wrong market.** Bubble letters and primary colours read as consumer
   retail — a juice brand, a market stall, a kids' snack. The buyer this site is written for
   is committing to pallets against a spec sheet. The logo tells them "cheerful fruit
   seller"; the site tells them "reliable trading partner". The logo wins, because it is seen
   first.
2. **It is the wrong shape for a website.** It is a square, stacked lockup with decoration
   around it. A site header is a ~40px-tall horizontal strip. Scaled to fit, the word
   "BERRIES" becomes unreadable and the berries become noise.
3. **It will not reproduce.** Heavy outlines, drop shadows and photographic cut-outs fall
   apart when embroidered, printed one-colour on a carton, faxed on a delivery note, or
   shown as a 16px favicon.

**What it does well, and should be kept:** the name set as `365` over `BERRIES`, and the
idea of the four berries as the identity. Both survive into any refinement.

### Recommendation

Pitch the site with the **refined mark that is currently built in** (berry cluster +
`365 Berries` + `FRUIT SOURCING & TRADE`). It is horizontal, legible at 32px, works in one
colour, and matches the positioning the copy is selling.

Do **not** open the meeting with "your logo is wrong." Show the site, let them see the
mark in context, and if they ask, explain it as a *format* problem rather than a taste
problem — "we needed a horizontal version that stays readable at small sizes." That is
true, unarguable, and leaves their pride intact. Quote the identity work as a separate
line item.

If they insist on keeping the existing logo, that is their call and the site supports it.

### Using the client's logo instead

The CSS is ready. You need a **horizontal** version of their file — the square one will not
work in the header no matter how it is scaled.

1. Save it as `assets/logo.svg` (or `.png`, transparent background, at least 400px wide).
2. In `index.html`, add this inside **both** `.brand` blocks (header and footer), just
   before `<span class="brand__txt">`:
   ```html
   <img class="brand__img" src="assets/logo.svg" alt="365 Berries">
   ```
3. Add `class="logo-client"` to the `<body>` tag.

That swaps the built-in mark for theirs everywhere at once. Note their logo's black
outlines were drawn for a white background — on the dark plum header it will need a
light-background variant, or the header switched to cream.

## 6. Legal pages

Three working, bilingual pages, linked from the footer of every page:
`privacy.html`, `terms.html`, `cookies.html`.

**These are templates. They are not legal advice, and I am not a lawyer.** They are
structurally complete for a Spanish SL (GDPR/LOPDGDD, and LSSI-CE Art. 10 for the legal
notice), which puts the client well ahead of where they are now — but the specifics must be
checked before launch.

**What the client must supply or confirm:**

| Where | What's missing |
|---|---|
| `terms.html` | `[TO BE COMPLETED]` — registered office address, and Commercial Registry volume / folio / sheet. Both are legally required by LSSI-CE Art. 10. |
| `privacy.html` | Retention periods (I used 12 months for dead enquiries, 6 years for records per Spanish commercial law) and the actual list of processors — email, hosting, CRM. |
| `privacy.html` | Whether any processor is outside the EEA, and on what transfer mechanism. |

**How the bilingual content works — different from the rest of the site.** The legal prose is
**not** in `i18n.js`. Each page holds both languages inline as
`<div data-lang-block="en">` and `<div data-lang-block="es">`, and `main.js` shows whichever
matches the active language. That is deliberate: a lawyer editing these should be reading
plain prose in HTML, not hunting through quoted JavaScript strings. Only the page chrome
(title, "Back to site", "Last updated") comes from `i18n.js`.

Each page also declares its own `data-title-key` / `data-desc-key` on `<body>` so the
language switcher sets the right `<title>` and meta description per page.

### The cookie policy is accurate — keep it that way

I verified it against what the site actually does at runtime: **zero cookies**, one
`localStorage` key (`lang`, holding `en` or `es`), and two external hosts — both Google
Fonts. The page says exactly that.

Because there are no analytics or tracking, **no consent banner is currently required** —
the language preference is a strictly necessary functional setting under LSSI-CE Art. 22.2.
That changes the moment anyone adds Google Analytics, a Meta pixel, a chat widget or an
embedded video: the cookie page must be updated **and** a consent banner becomes mandatory.

One honest disclosure worth flagging to the client: the fonts load from Google's servers,
which transmits the visitor's IP to Google. German courts have treated this as a GDPR
issue. The cookie page discloses it. If the client would rather it not happen at all, the
fonts can be self-hosted — roughly an hour of work, and it also makes the site load faster.


### Contact links (mailto: / tel:)

`mailto:` and `tel:` links do nothing at all when the operating system has no handler
registered — no error, no dialog, just a dead click. That is common on desktops without a
mail client configured, and inside in-app browsers (LinkedIn, WhatsApp). On a B2B site whose
primary CTA is "Email David", that is a lost lead.

Every `mailto:`/`tel:` link therefore also shows a toast with the address and copies it to
the clipboard. The `href` is left intact, so a real mail client still opens where one exists.
The toast appears **synchronously** — the Clipboard API can reject *or hang* when the
document is not focused, so the feedback deliberately does not wait on it. If the copy
succeeds the toast upgrades to "Copied to clipboard — …".

## 7. Design system

| | |
|---|---|
| **Display** | Playfair Display — editorial, premium, works at large sizes |
| **Body/UI** | Inter |
| **Labels/data** | JetBrains Mono — gives the availability and stats a "trading desk" feel |
| **Base** | Deep plum `#150710` / `#1E0A16` and warm cream `#FCF8F4` |
| **Accent** | Raspberry `#C6224E` (light sections) / `#FF6B8A` (dark sections) |
| **Support** | Blueberry `#3E3D78`, leaf `#2F6B4F`, gold `#C08A2E` |

Sections alternate cream and plum. Dark areas get the `.is-dark` class, which swaps the
semantic tokens — so any component works on either background without special-casing.
All colours are CSS custom properties in `:root`, so rebranding is a single edit.

Accent-on-background contrast is 5.3:1 (light) and 6.6:1 (dark) — both pass WCAG AA.

## 8. Photography

The site currently ships with **custom SVG berry illustrations** and gradient artwork — no
stock photos, nothing to license, and it loads instantly. That is a deliberate choice and it
looks intentional.

If the client wants real photography, the highest-impact places are: the hero background,
one image per product card, and a packhouse/field shot in the process section. Ask them for
their own field and packhouse photos — genuine grower images will beat stock every time,
and it reinforces the "grower-direct" claim.

## 9. Running and deploying

Locally, just open `index.html`. To serve it properly:

```bash
python -m http.server 8123
```

### Deploying to Vercel

The folder is already a git repo with a `vercel.json`. No build step, no framework — Vercel
serves it as static files. From inside the project folder:

```bash
npx vercel
```

First run asks you to log in and then a few setup questions — accept the defaults
(scope: your account, link to existing project: **no**, project name: e.g.
`365berries-preview`, directory: `./`, override settings: **no**). You get a preview URL
immediately. When you're happy with it:

```bash
npx vercel --prod
```

That gives the clean `365berries-preview.vercel.app` link to send the client.

### ⚠️ The preview is set to noindex — leave it that way

This build carries unverified certification and reference claims under a real company's
name. If Google indexes it, those claims are public and attributed to the client. Two
guards are in place:

- `<meta name="robots" content="noindex, nofollow">` in `index.html`
- `X-Robots-Tag: noindex, nofollow` in `vercel.json`

Remove **both** only once the client has approved the content and it goes to their real
domain. Section 3 covers what has to be verified first.

**Pitch tip:** send the live link, not a zip. Seeing it load on their own phone is what
closes this.

## 10. Suggested scope to quote

1. **This page, finalised** — real content, real availability data, photography, legal pages.
2. **Multilingual — already built (EN/ES).** What remains to quote: client review of the
   Spanish wording, and proper `/es/` URLs with `hreflang` if they want both indexed.
3. **CMS** — so the client updates the availability calendar themselves each season. This is
   the strongest recurring-value argument you have.
4. **Working form** — connect to email/CRM (Formspree, Netlify Forms, or a small backend).
5. **SEO + analytics** — the current site has essentially no search presence.
6. **Ongoing care plan** — hosting, updates, seasonal calendar changes.
