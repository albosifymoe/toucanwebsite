# Desktop motion and project-card review — 9 October 2026

Review branch: `fix/hero-and-project-thumbnails`, based on
`830712ea99b699fda11d963d489f32fbbd8eba0e`. Changes remain local pending owner review.

## Findings and changes

The deployed controller selected 3840 × 2160 movies on the tested desktop
(2560 CSS pixels wide, device pixel ratio 1.5). Each landscape movie is about
21 MB. It retained the last compressed movie frame at each reading stop and
hid the approved 4K illustration. This exposed the movie's softer texture at
precisely the point where visitors stop to read.

The controller now uses the existing 2048 × 1152 movies for interactive seeking
(about 10.4–10.6 MB each, 72% fewer decoded pixels). Reading stops display their
original 3840 × 2160 WebP artwork once loaded. A pending video callback cannot
cover that artwork again. The next passage is prepared in the current scroll
direction; neighbour preparation preserves the selected decoder, even while a
still is visible. Two decoders remain the limit. No video assets were changed.

Chapter copy, accessibility state and navigation are updated only when their
visible state changes; video seeking continues to follow the scroll position.
Still and video framing stay identical, without adding a different tint at holds.

Both home and archive cards previously used `object-fit: contain` inside a 4:3
frame. They now use `cover` with per-project focal points in
`project-thumbnails.mjs`. Shake Up uses existing gallery artwork `3-63.webp` to
avoid enlarging a 1024 × 341 banner; Vanex uses `5-89.webp` to keep its main
subject and headline in the crop. Project-detail covers and galleries are unchanged.
No new AI-generated assets or generation credits were used.

## Validation

- `node --test story-model.test.mjs film-controller.test.mjs presentation-symbols.test.mjs`: 19 passing tests. New cases were observed failing before the fixes.
- `node --check dist/story.js` and `node --check dist/film-controller.mjs`: pass.
- `PREVIEW_URL=http://127.0.0.1:4183 node verify-site.mjs`: 16 pages, 266 internal resources, no errors. This historical script writes to the parent `planning/` directory, which must exist when testing a standalone worktree.
- Chrome desktop: the Create reading stop shows `scene-02-landscape-4k.webp` with both videos hidden; Pause releases all scroll-video decoders.
- Chrome at 390 × 844: zero scroll-video decoders, no horizontal overflow, all 11 archive image boxes use `cover` at approximately 326 × 245 CSS pixels. This is viewport simulation, not a physical-phone test.
- Direct `curl` requests to staging return `206 Partial Content` with the correct byte range. No hosting range-request change is needed. An initial PowerShell request returned the full file; it was not valid evidence of a server fault.
- Public GitHub `main` still matched the base commit during this review. The three live hero JS modules matched the local baseline.

An isolated Chrome test sought through the same first landscape passage using
48 forward and 48 reverse destinations for each existing delivery tier. Timings
measure assignment of `currentTime` through `seeked`, excluding initial loading:

| Delivery | Forward median | Forward p95 | Reverse median | Reverse p95 |
| --- | ---: | ---: | ---: | ---: |
| 4K | 14.2 ms | 54.2 ms | 16.4 ms | 36.7 ms |
| 2K | 6.0 ms | 15.5 ms | 5.4 ms | 9.3 ms |

These are local decoder measurements, not an end-to-end frame-rate guarantee.
Some scroll-sweep captures were throttled when the Chrome window was occluded;
their frame counts are not suitable for an overall before/after performance claim.
Final visual acceptance should include slow/fast wheel scrolling, stopping
mid-passage, reversing across all three boundaries, and checking the sharpness
handoff on the owner's normal display. Moving 2K footage can look softer than
the 4K holds on a large display. Minor source-to-still composition differences
also need visual acceptance.

Diagnostic scripts and measurements are in the original workspace's
`artifacts/desktop-review/`, outside `dist/` and outside this repository.

## Release workflow

1. Review the local worktree preview and adjust until accepted.
2. Re-run the focused tests, page checks and a clean diff review.
3. Only after owner approval, commit/merge and push the reviewed changes to GitHub.
4. In cPanel Git Version Control, use **Update from Remote**, then **Deploy HEAD Commit**.
5. The existing deployment script takes a timestamped staging backup and copies
   the built `dist/` files to `/home/toucanly/staging.toucan.ly`. Verify the deployed
   revision and repeat hero/card checks on staging. The live WordPress site is
   outside this deployment target.

No merge, push, cPanel change or deployment was performed for this review build.

## Section alignment follow-up (2026-10-09)

The home services list followed the complete heading and link in normal document
flow; its left margin only moved it horizontally. It now shares a two-column
CSS grid with the heading, using the same columns as the home introduction.
The section label occupies its own full-width row and the CTA stays with the
heading. The first list item has no extra top padding.

The same label-row structure now aligns the About onward section, the Services
capabilities and collaboration sections, and all 11 project stories. Removed
bottom/centre alignment and the project story's fixed 45px compensation. About
and Work hero supporting text also starts at the top of its row. Existing phone
and tablet stacking remains responsive.

Verification: rendered column geometry at 1440px and 2560px, phone layouts at
390px, and representative tablet layouts at 820px had no alignment failures or
horizontal overflow. Expanded service details were visually checked on phone.
All 19 existing tests pass; all 16 pages and 266 internal resources resolve.
Screenshots and measured geometry are in `artifacts/desktop-review/` in the
parent workspace, outside the deployable directory. These changes remain local
for owner review, together with the hero and thumbnail fixes above.
