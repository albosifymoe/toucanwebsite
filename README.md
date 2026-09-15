# Toucan Studio story prototype

This private prototype preserves Toucan's original logo, Poppins typography, six services, eleven project destinations and fourteen client logos. Team is removed. Contact links use the existing site and email.

The hero contains four reading stops joined by three real animation passages. Desktop and portrait each have their own 4K compositions and videos. Scroll position controls playback in both directions; live copy arrives at the settled frames. The toolbar remains fixed with a translucent glass surface.

Each movie has a 2K and 4K browser version. The controller selects the appropriate tier, uses one outstanding seek, retains at most two decoders, and falls back to 4K stills on media errors, reduced motion or constrained layouts.

The original high-resolution production files and complete generation records are in the parent workspace, outside this deployable site. Browser delivery videos are preserved in ../production/browser-delivery/ and served locally by server.mjs. Published pages use the same files' existing media URLs, keeping the website package small. No further generative jobs are authorized following the user's credit stop on 15 September 2026.

## Local preview

Run `node server.mjs` and open `http://127.0.0.1:4173/`. The local server supports media byte-range requests.

## Validation

Ten focused controller/timing tests pass. All twelve movie delivery files serve valid byte ranges. Forward and reverse video scrubbing were verified in the actual 604×516 embedded preview after correcting the short-window fallback. Full responsive layout, real touch-device behavior, accessibility and performance remain release checks. The live WordPress site has not been replaced.
