# MKS Storyworks — website v4 (dark)

Same content and structure as v3, re-skinned dark against the VSL-Elevate reference.
Static: no build step, no dependencies, no server.

```
index.html    landing page
book.html     Calendly booking page  (also served at /book via _redirects)
styles.css    shared stylesheet
script.js     scroll reveals + nav shadow
assets/
```

## Design tokens

| role | value |
|---|---|
| ground | `#1c1b17` warm ink |
| surfaces | `rgba(255,255,255,.05)` panels, `#24221c` solid |
| accent | `#6faf8d` fern |
| accent lift | `#98cfb2` (large display italics) |
| accent deep | `#2e6b51` (fills, glows) |
| numbers | `#e7c98a` gold |
| text | `#efebe5` / `#b6b0a4` / `#8c867b` |
| display | Newsreader 400 |
| body | Inter Tight |
| radius | 16px dominant |

Surfaces are **fills, not strokes** — that's the main structural difference from v3, and the
thing that makes the reference read as expensive. Resist adding borders.

Nav is a wordmark only — no logo mark.

Calendly is themed to match via query params (`background_color`, `text_color`, `primary_color`).

## Swapping in the VSL

Drop `vsl.mp4` (+ optional `vsl.webm`) into `assets/video/` and a poster frame at
`assets/img/vsl-poster.jpg`. In `index.html`, find `.vsl`, delete the `.vsl-placeholder`
div and uncomment the `<video>` block. The flip animation wraps whatever is inside.

The photo is already in: `assets/img/morgan.jpg`. The original camera file is kept
outside the deploy folder at `../source-photos/IMG_8427.JPG`.

## Animation notes

- Content is visible by default. It is hidden for animating **only** when JS confirms it
  is running (`html.js`, set inline in `<head>`), so a failed script never blanks the page.
- A 2.6s safety net reveals anything still hidden and lands the video, in case the browser
  never delivers a frame.
- Do **not** add `?v=` stamps to the css/js URLs — Netlify revalidates via ETag, and a
  stale stamp is worse than none.

## Deploy

Drag this folder onto Netlify. Do not repoint mksstoryworks.com until you've checked the
preview URL. v1 stays live until then, and v3 (cream) is still in its own folder if you
want to compare.
