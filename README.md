# 365 Berries — Website Redesign Concept

A complete, working redesign of [365berries.com](https://365berries.com/), built as a pitch
piece you can put in front of the client.

**Files:** `index.html` · `privacy.html` · `terms.html` · `cookies.html` · `styles.css` ·
`main.js` · `i18n.js` — no build step, no dependencies, no CDN JavaScript. Open
`index.html` in any browser and it works.

**English only** for now. The Spanish translation is written and dormant — one line
re-enables it (section 4).

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

## 4. Languages — English now, Spanish ready

The site currently runs **English only**. The Spanish translation is complete and still in
the repo, just switched off.

**To turn Spanish back on**, edit one line at the top of `main.js`:

```js
var LANGUAGES = ['en', 'es'];   // was ['en']
```

That restores the EN/ES switcher in the header, browser-language detection, and the Spanish
legal pages. Nothing else needs changing.

**Why it is off rather than deleted:** it is a finished asset you can sell. "The Spanish
version is already built — it is a switch, not a project" is a much better position in a
negotiation than offering to start it.

### What is still in place, dormant

- `i18n.js` — both dictionaries, verified in sync (no key exists in one and not the other).
- `privacy.html`, `terms.html`, `cookies.html` — each still carries its full
  `data-lang-block="es"` prose alongside the English.
- The `#lang` switcher markup stays in all four HTML files; `main.js` removes it at runtime
  while only one language is active.

### One thing to redo if you re-enable it

With a single language the site writes **nothing** to the browser — no cookies, no local
storage — and `cookies.html` says exactly that. Turning Spanish back on reintroduces the
`lang` localStorage key, so the storage table in `cookies.html` has to come back too.
There is a comment at the top of that file reminding you.

The code also clears any stale `lang` key on load, so returning visitors from the bilingual
build do not leave the policy inaccurate.

### How the markup hooks in

| Attribute | Use |
|---|---|
| `data-i18n="key"` | replaces the element's text |
| `data-i18n-html="key"` | replaces inner HTML — for strings containing `<em>` or `<span class="ital">` |
| `data-i18n-attr="placeholder:key"` | sets an attribute; comma-separate for several |
| `data-lang-block="es"` | legal-page prose blocks, shown only when that language is active |

Legal prose deliberately lives in the markup, not `i18n.js`, so a lawyer edits plain HTML
rather than quoted JavaScript strings.

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

### Link preview (og:image)

`assets/og-image.jpg` (1200×630, ~60KB) is the card that renders when the link is pasted
into WhatsApp, LinkedIn, Slack or an email client. It is generated, not photographed, so it
costs nothing and matches the site.

**One step after deploying:** open each of the four HTML files and make `og:image` an
absolute URL, and add `og:url`:

```html
<meta property="og:url" content="https://your-domain.vercel.app/">
<meta property="og:image" content="https://your-domain.vercel.app/assets/og-image.jpg">
```

WhatsApp and Facebook do not reliably resolve a *relative* image URL, so the preview will
show as a bare text card until this is done. Re-check with
[opengraph.xyz](https://www.opengraph.xyz/) after deploying — and note WhatsApp caches
previews aggressively, so test with a fresh URL rather than re-pasting the same one.

## 4b. The video

Section 05, between "How we work" and "Origins" — the client's 28-second Vimeo clip
(`828990290`).

**It is click-to-load, not a plain embed.** On page load nothing is requested from Vimeo
and no iframe exists; the still you see is `assets/video-poster.jpg`, served from this site.
The player is injected only when the visitor presses play, and even then it is requested
with `dnt=1` (Vimeo's Do Not Track mode).

That was necessary, not decorative. A normal `<iframe>` embed loads Vimeo on every page
view, sets third-party cookies, and would have made the cookie policy false — and for a
Spanish company it would legally require a consent banner before the page could load at
all. Click-to-load keeps the site cookie-free by default, keeps `cookies.html` accurate
(it now discloses Vimeo explicitly), and loads faster. The cookie page and its Spanish
version both describe this.

The poster was pulled from Vimeo's own thumbnail, trimmed of its white letterbox bars and
re-cut to 16:9 — so it is a real frame of the film, not a stand-in.

### Two things to raise with the client

1. **The video is called "Untitled video - Made with Clipchamp (2).mp4"** on Vimeo. The
   player is loaded with `title=0&byline=0&portrait=0` so it is hidden, but it will show
   anywhere else the link is shared. Worth renaming in their Vimeo account.
2. **It is 28 seconds and has no audio track worth speaking of.** Fine as an atmosphere
   piece where it sits. If they want it to carry more weight — packhouse, grading line,
   loading — that is a content conversation, not a build one.

### The white border

The source video has a **10% white margin baked into every frame** — measured from Vimeo's
own thumbnail, which showed the footage occupying only (160,90)–(1440,810) of a 1600×900
frame. It is in the file, not in the page.

The player is therefore scaled to `125%` inside a clipped frame, which crops it out exactly
(measured: 9.9% removed per side). That crop would hide Vimeo's own control bar, so native chrome is off (`controls=0`) and
the page draws **its own controls** — play/pause, mute/unmute, close — which drive the
player over Vimeo's `postMessage` API. No SDK, no extra third-party script. The player
starts muted because browsers block autoplay with sound; the unmute button is right there.
Close unloads the iframe and restores the poster.

**The proper fix is the client re-exporting the video without the border.** When they do,
set `--film-crop` back to `100%` in `styles.css`. The custom controls can stay either way. The poster image is already correctly trimmed, so it needs nothing.

**To swap the video:** change `VIDEO` and `HASH` in `main.js` (§16c) and replace
`assets/video-poster.jpg`.

## 4c. Fruit Rescue

Section 08, a separate service line requested by the client: rescuing and reselling fruit
that retailers have rejected. Linked from the header nav, the mobile menu and the footer.

**The copy is the client's own**, taken from his Fruit Rescue flyer — headline, intro, the
three stages, the five rejection causes and the "collect containers from anywhere in Europe"
line. Unlike the rest of the site, it is not placeholder content.

Two small things were **added by us and should be shown to him**: the one-line description
under each of the three stages (the flyer only has the titles), and the gloss under "MRL
challenges" ("Maximum residue level exceedances").

The "Report a rejected load" button opens WhatsApp with a short template (product, volume,
location, reason) in the active language. Set in `main.js` inside `applyLang`.

Adding a sixth nav tab meant the full desktop header no longer fit at 1024px, so it now
starts at **1200px**; below that the burger menu is used. Measured at 1200px: 49px
clearance either side of the centred nav.

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

## 9. Going live — run the checklist

Two scripts do the mechanical parts. Node only, no dependencies.

```bash
node scripts/preflight.mjs
```

Checks what can be checked automatically and prints the list that needs the client's
sign-off. Exits non-zero if anything is blocking, so it can gate a deploy step.

```bash
node scripts/preflight.mjs --launch
```

Same, with the launch-only gates added (indexing enabled, legal details filled).

### Step 1 — deploy the preview

```bash
npx vercel
```

Defaults are fine (link to existing project: no, name `365berries-preview`, directory `./`).
Then `npx vercel --prod` for a clean URL.

### Step 2 — stamp the domain

```bash
node scripts/set-domain.mjs https://365berries-preview.vercel.app
```

Makes `og:image` absolute and adds `og:url` + `<link rel="canonical">` on all four pages.
Without this the link shows as a bare text card in WhatsApp — the preview image simply will
not appear. Re-run it if the domain ever changes; it is idempotent.

Then redeploy, and check the card at [opengraph.xyz](https://www.opengraph.xyz/).

### Step 3 — before it goes public (not before the pitch)

- Fill the `[TO BE COMPLETED]` gaps in `terms.html` — registered office and Commercial
  Registry volume/folio/sheet, in **both** language blocks.
- Clear every item in the sign-off list that `preflight` prints. The certifications are the
  one that carries real legal exposure.
- Remove `<meta name="robots" content="noindex, nofollow">` from all four pages and the
  `X-Robots-Tag` header from `vercel.json`.
- Run `node scripts/preflight.mjs --launch` and get a clean pass.
- Have the legal pages reviewed by the client's *gestoría*.

### Keep the repo private until then

The GitHub repo carries the client's registered NIF and unverified certification claims.
`noindex` protects the deployed site, not the repository.

```bash
gh repo edit <owner>/<repo> --visibility private --accept-visibility-change-consequences
```

## 10. Suggested scope to quote

1. **This page, finalised** — real content, real availability data, photography, legal pages.
2. **Multilingual — already built (EN/ES).** What remains to quote: client review of the
   Spanish wording, and proper `/es/` URLs with `hreflang` if they want both indexed.
3. **CMS** — so the client updates the availability calendar themselves each season. This is
   the strongest recurring-value argument you have.
4. **Working form** — connect to email/CRM (Formspree, Netlify Forms, or a small backend).
5. **SEO + analytics** — the current site has essentially no search presence.
6. **Ongoing care plan** — hosting, updates, seasonal calendar changes.
