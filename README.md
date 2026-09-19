# Toucan Studio story prototype

## GitHub and hosting

Repository: https://github.com/albosifymoe/toucanwebsite

The deployable website is in `dist/`. Upload the contents of that directory to the website's document root; the repository root contains development tools and is not the public website. The hosted site needs only static file serving, with JavaScript modules and MP4 byte-range requests supported. Node.js is used for local development and page generation, not for the hosted website.

This is the current staging version, not a production release. Pages retain `noindex,nofollow`, the contact page prepares an email draft, and all animation videos ship in `dist/assets/` from the site's own origin. Production deployment must address fresh backups and recovery testing, indexing, old-page redirects, and the desired contact workflow.

The `planning/` and `production/` paths referenced below belong to the original parent workspace and are not included in this repository. A standalone clone includes all generated pages, browser images, and browser videos. The historical import/optimization utilities rely on the parent workspace; they are not needed to preview or deploy `dist/`.

The cPanel deployment configuration targets **staging only** at `/home/toucanly/staging.toucan.ly`. In cPanel Git Version Control, use **Update from Remote**, then **Deploy HEAD Commit**. Pushing to GitHub alone does not deploy. The script checks the target, rejects symlinks, keeps a timestamped archive of an existing staging site in `/home/toucanly/deployment-backups/`, and copies only `dist/` plus the staging server rules. It never deletes files or modifies `/home/toucanly/public_html`.

The staging server rules require HTTPS, disable directory listings, deny access to hidden/server files, prevent framing, and restrict resource origins with a Content Security Policy. Staging is publicly accessible and marked `noindex`; this is not password protection. Do not place private content there. The GitHub repository is also public. A trusted certificate and the actual response headers must be verified on the host after deployment.

## Design

This private prototype preserves Toucan's original logo, Poppins typography, six services, eleven projects and fourteen client logos. Team is removed. The site now includes About, Services, Work, Contact and eleven project detail pages, all connected to the home page.

The hero contains four reading stops joined by three real animation passages. Desktop and portrait each have their own 4K compositions and videos. Scroll position controls playback in both directions; live copy arrives at the settled frames. The toolbar remains fixed with a translucent glass surface.

Each movie has a 2K and 4K browser version. The controller selects the appropriate tier, uses one outstanding seek, retains at most two decoders, and falls back to 4K stills on media errors, reduced motion or constrained layouts.

The original high-resolution production files and complete generation records are in the parent workspace, outside this deployable site. Five unchanged browser passages are preserved in ../production/browser-delivery/ and copied into dist/assets in 2K and 4K. The repaired portrait Create → Launch passage is also included in dist/assets in both tiers. All twelve files must ship with the site. No further generative jobs are authorized following the user's credit stop on 15 September 2026.

## Local preview

Run `node server.mjs` and open `http://127.0.0.1:4173/`. The local server supports media byte-range requests.

If 4173 is already in use, set `PORT` to another port before running the server. The 17 September review runs at `http://127.0.0.1:4174/work.html`.

## Inner pages — 17 September 2026

The latest design pass clarifies page roles: Home shows three selected projects; About and Services use dedicated studio artwork instead of portfolio covers; Services keeps all six capabilities on one page; project endings use compact text navigation. Contact has a dedicated illustration. General copy welcomes all visitors, and detailed project additions await the user's source material. See `../planning/STUDIO-ART-AND-PAGE-ROLES.md` for the three built-in image outputs, final prompts and verification.

The page templates are in `build-pages.mjs`, with editable project summaries and service content in `site-content.mjs`. Run `node build-pages.mjs` after editing them. The generated HTML is fully readable without JavaScript. `dist/pages.css` adds the shared navigation/footer and inner-page styles; `dist/site.js` progressively enhances filters, the image viewer and the enquiry builder. The home hero and its motion implementation are unchanged.

The Work page filters by category and preserves the selected category in the URL. Each project has its own complete gallery, keyboard-operable image viewer, next-project link and contact call to action. Existing source films remain linked on Vimeo.

Contact prepares a reviewable email draft and offers an email-app link and copy fallback. It does not submit to a server or claim that a message has been delivered. Direct email remains available without JavaScript. Connecting a real submission endpoint is a separate production integration.

All portfolio content comes from the public Toucan WordPress archive captured in `../planning/project-source-posts.json`. `project-assets.json` records source URLs, original locations and browser copies. `import-projects.mjs` retrieves those existing assets; `optimize-projects.py` creates WebP copies using Pillow and archives downloaded originals in `../production/portfolio-originals/`. The six pre-existing home covers remain in place. No new generative jobs were used. The 220 delivery images total 23.8 MB, down from 146.4 MB of originals; galleries load lazily.

Run `node verify-site.mjs` while the preview runs on port 4174, or set `PREVIEW_URL` to your preview origin. It verifies all 16 pages, internal links/assets, heading counts and fragment destinations. Browser verification and release boundaries are documented in `../planning/INNER-PAGES-IMPLEMENTATION.md`.

## Validation

Run `node --test story-model.test.mjs film-controller.test.mjs` (12 focused cases). The 16 September repair adds persistent frame visibility, neighbor preparation, explicit reading/action spans, interruption and frame-interior seeking. Automatic snapping and whole-scene dissolves are removed.

Actual browser frame-coverage captures and the source repair are documented in [the implementation report](../planning/MOTION-FIX-IMPLEMENTATION.md). All six forward passages and reverse traversal are checked at desktop and portrait sizes. Real touch hardware, Safari and hosting performance remain release checks. The repaired prototype is deployed to https://staging.toucan.ly; the live WordPress site remains unchanged.
