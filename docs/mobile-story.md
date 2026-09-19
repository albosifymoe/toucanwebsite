# Mobile story — 19 September 2026

## Delivery decision

The user approved a single illustrated mobile hero with a tap-to-play film, while retaining desktop scroll animation. Preserve the existing illustration, palette, Poppins type, navigation, main CTA and page sections. The only new hero copy is “Watch our story”; the numbered chapter label is hidden on mobile because it is no longer a four-chapter scrolling interface. The missing space in the mobile headline is corrected.

At widths up to 900px **or** with a coarse primary pointer, CSS shows only Discover and removes the sticky/extended story layout. The same conditions disable scroll-video decoding in `supportsStoryMotion`. No user-agent sniffing, autoplay or performance guessing. Height-only changes from browser chrome do not reset mobile story position. Fine-pointer desktop layouts retain the original controller.

The hero's existing smaller WebP is about 288 KB. The optional movie is 3.56 MB, 21.625 seconds, 720×1280, 24 fps, H.264 High level 3.1 / yuv420p, BT.709, silent, fast-start MP4. It concatenates the three existing portrait passages, including the repaired middle passage. No new generative assets or paid jobs were used.

The movie has no source before a user taps. A native dialog contains the player and Close button; native video controls provide pause, seek and fullscreen. Closing or leaving unloads it; hiding the document pauses it without automatically resuming. A failed playback policy leaves native Play available, and media errors reveal a direct video link. If scripts/dialog support are unavailable, the ordinary link directly opens the MP4. The CSS still shows one hero without scripts.

## Research informing the choice

- [MDN currentTime](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime): assigning time seeks media. The existing controller repeatedly seeks high-resolution videos; this is not the same workload as normal forward playback.
- [Chrome scroll-animation performance](https://developer.chrome.com/blog/scroll-animation-performance-case-study/): native scroll timelines help transform/opacity animations avoid main-thread contention; they do not remove the video's decode/seek workload.
- [GSAP imageSequenceScrub](https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/): canvas image sequences are a viable alternative, but this long story would need a separate mobile frame budget, download strategy and memory management.
- [WebKit video policies](https://webkit.org/blog/6784/new-video-policies-for-ios/): explicit user-initiated playback and `playsinline` avoid relying on autoplay. This is foundational policy documentation, not proof of behavior on every current iPhone.

## Verification

Local Chromium browser checks (not physical iOS/Android certification):

- 390×844: one 844px hero, no scroll-video elements and no assigned movie source before tapping; no horizontal overflow.
- 320×568: one 760px hero with readable heading/actions; ordinary scrolling reaches About directly, with no intermediate story panels.
- 844×390: one 580px landscape hero; no assigned video source and no horizontal overflow.
- Scripts blocked by a separate local QA server: still one hero; the watch link opens the MP4 with playable media.
- Tap: native dialog opens, 720×1280 movie decodes and playback time advances. Close unloads the source, clears the scroll lock and returns focus. Reopening and Escape-to-close work.
- A local server deliberately returning a media error reveals the fallback link; Close still works. The mobile work link reaches its section without assigning any movie sources.
- 1440×900: desktop retains the 7920px scroll story; scrolling advances the visible video time. No browser console errors observed.
- Full movie decode checked with FFmpeg; all 15 unit tests and the 16-page/266-resource link check pass.

Visual comparison against the existing hero checked artwork/crop, unchanged teal/orange palette, Poppins type, heading spacing, navigation, CTA visibility and absence of overflow. Intentional mobile differences: one hero, no chapter controls/label, no scroll pinning, and the new watch link. No new overlays or color treatments were added.

## Deployment and real-device acceptance

Push is not deployment: in cPanel use **Update from Remote**, then **Deploy HEAD Commit** for staging only. Ship all of `dist/`, including the new CSS, module and `assets/story-mobile.mp4`. Versioned script/style URLs avoid reusing the old controller after the updated HTML loads.

On actual iPhone Safari and Android Chrome, check: portrait/landscape; normal and low-power modes; Reduce Motion; slow connection; tap Play, native Pause/fullscreen, Close/reopen; return from a background tab; and scroll through About/Work without jumps. Expected failure behavior: the single hero remains usable even if video never plays. No claim of physical-device validation is made yet.

## Re-export

Using an existing FFmpeg binary, run from the repository root (output filename must not already exist):

```sh
ffmpeg -n -i dist/assets/pass-01-portrait-2k.mp4 -i dist/assets/pass-02-portrait-repaired-2k.mp4 -i dist/assets/pass-03-portrait-2k.mp4 -filter_complex "[0:v]scale=720:1280,setsar=1,fps=24,setpts=PTS-STARTPTS[v0];[1:v]scale=720:1280,setsar=1,fps=24,setpts=PTS-STARTPTS[v1];[2:v]scale=720:1280,setsar=1,fps=24,setpts=PTS-STARTPTS[v2];[v0][v1][v2]concat=n=3:v=1:a=0[v]" -map "[v]" -r 24 -fps_mode cfr -an -c:v libx264 -preset medium -crf 24 -maxrate 1800k -bufsize 3600k -pix_fmt yuv420p -profile:v high -level:v 3.1 -g 48 -movflags +faststart -color_primaries bt709 -color_trc bt709 -colorspace bt709 dist/assets/story-mobile.mp4
```
