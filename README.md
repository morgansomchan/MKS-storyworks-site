# Where your reel videos go

Drop your video files in this folder (e.g. `le-dalat.mp4`, `prep-6am.mp4`).

Recommended:
- Format: `.mp4` (H.264), since it plays everywhere without extra setup
- Keep each file under ~10MB if possible — compress with HandBrake or Shotcut if a raw export is bigger, so the site stays fast to load
- Vertical/9:16 aspect ratio to match the phone card
- Optional: add a matching poster image (e.g. `le-dalat-poster.jpg`, a single still frame) so the phone card shows something instantly before the video loads

Then in `index.html`, inside `#phoneScreen`, add this as the first line inside the `.phone-slide` you want it in:

```html
<video class="slide-media" src="videos/le-dalat.mp4" autoplay muted loop playsinline poster="videos/le-dalat-poster.jpg"></video>
```

There's a matching comment already sitting in `index.html` right above the phone slides showing exactly where this goes.

Once your video files and the updated `index.html` are pushed to GitHub together, Netlify will deploy them as part of the site automatically.
