# Editing the copy without breaking the site

## The one rule

**Change words. Never change anything inside angle brackets `< >`.**

```html
<h2>Your reel did well. The restaurant got <span class="em">nothing.</span></h2>
   └────────────── safe to rewrite ──────────────┘        └─ safe ─┘
        ↑ don't touch                    ↑ don't touch
```

`<span class="em">` is what makes a phrase green and italic. Move it around a sentence to
change which words are emphasised — just keep the opening `<span class="em">` and the
closing `</span>` as a pair.

## Before you start

```bash
cd "/Users/morgan/Documents/Claude/Projects/MKS Storyworks/MKS Website V4"
cp index.html index-before-edits.html
```

## After you finish

```bash
./check.sh
```

It checks the page still has all nine sections, eight pills, six counters, the funnel, the
ecosystem circuit, all five service panels, the carousel, and that every image it points at
actually exists. Green means safe to deploy. Red tells you exactly what broke.

## Where the copy lives

All of it is in `index.html`. Search for the text you want to change rather than trusting
line numbers — they shift as you edit.

| Section | Search for | What's editable |
|---|---|---|
| Hero | `Digital Marketing Consultant` | Pill, headline, subhead, button label, proof line, promise |
| Problem | `Your reel did well` | Pill, headline, the paragraph, the closing disqualifier |
| Five things | `I'll do five things` | Pill, headline, the five titles and their paragraphs |
| Le Dalat | `Le Dalat has served` | Pill, headline, four paragraphs, stat labels, the closing note |
| Gallery | `The content` | Pill, headline, the note under the carousel |
| What to expect | `What actually happens` | Pill, headline, four steps, the rolling-monthly note |
| About | `I'm Morgan` | Pill, headline, four paragraphs |
| FAQ | `Questions you're` | Pill, headline, all eight questions and answers |
| Final CTA | `Story earns the attention` | Headline, paragraph, button label |
| Booking page | `book.html` | Header, intro paragraph, the line under the calendar |

## Things that need care

**Numbers in the counters.** They appear twice — once as the animated target, once as the
text you see before the animation runs. Change both to the same value:

```html
<span class="n odo" data-to="125996">125,996</span>
                            ↑ digits only    ↑ formatted
```

**Service panel titles** appear in the left-hand list only. The graphic beside each one is
drawn in code — if you rename a service so its graphic no longer fits, tell me and I'll
redraw it.

**The funnel and ecosystem labels** are inside `<svg>` blocks. The words are editable, but
keep them short — the layout is positioned by coordinates, so a much longer label will
overlap something. Anything under about 25 characters is safe.

## If something breaks

```bash
cd "/Users/morgan/Documents/Claude/Projects/MKS Storyworks"
cp "_site-backups/v4_2026-08-22_1555/index.html" "MKS Website V4/index.html"
```

That restores the page exactly as it is right now. To roll back everything including
stylesheet and assets:

```bash
rsync -a --delete "_site-backups/v4_2026-08-22_1555/" "MKS Website V4/"
```

## Making a new restore point

Once you're happy with a set of edits, snapshot it:

```bash
cd "/Users/morgan/Documents/Claude/Projects/MKS Storyworks"
rsync -a "MKS Website V4/" "_site-backups/v4_$(date +%Y-%m-%d_%H%M)/"
```
