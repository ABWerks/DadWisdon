# Dad Wisdom

A one-button app that plays a random recording of Dad saying the things Dad always says. Like the Bullshit Button, but wiser.

## How it works

Press the big button → a random clip plays (never the same one twice in a row). Until you add real recordings, a robot voice reads placeholder dad-isms so you can test everything now.

## Adding your recordings

1. Record short clips (2–5 seconds each) on your phone. Same room, same mic, consistent volume.
2. Save/convert them as MP3 and drop them in the `audio/` folder, e.g. `audio/because-i-said-so.mp3`.
3. List each one in `clips.json`:

```json
{
  "clips": [
    { "file": "audio/because-i-said-so.mp3", "label": "Because I said so, that's why." },
    { "file": "audio/food-at-home.mp3", "label": "We have food at home." }
  ],
  "fallbacks": []
}
```

The `label` shows on screen as a caption while the clip plays. Once `clips` has entries, the robot fallbacks are ignored (you can empty that list or leave it).

4. If you're using the offline/installed version, bump `CACHE_VERSION` in `sw.js` (v1 → v2) so devices re-download the new clips.

## Running it

Browsers block `fetch` from plain files, so serve the folder over HTTP:

```bash
cd DadWisdon
python3 -m http.server 8080
```

Then open http://localhost:8080. To use it on phones, either:

- **Same Wi-Fi:** open `http://<your-computer-ip>:8080` on the phone, or
- **Host it free** (recommended): GitHub Pages, Netlify Drop (drag the folder onto netlify.com/drop), or Cloudflare Pages. HTTPS hosting also unlocks "Add to Home Screen" install + offline mode.

## Installing on phones

Open the hosted URL → browser menu → **Add to Home Screen**. It launches fullscreen like a real app and works offline after the first load.

## Files

- `index.html` — the whole app (UI + logic)
- `clips.json` — your list of recordings (+ text fallbacks)
- `audio/` — your MP3s go here
- `manifest.json`, `icons/` — makes it installable as an app
- `sw.js` — offline caching

## Later: the physical button

The `audio/` folder is your asset library for a hardware version — the same MP3s drop straight onto an SD card for a DFPlayer Mini (+ button + speaker, ~$10) or a Raspberry Pi build.
# DadWisdon
