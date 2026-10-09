# Project header artwork — 9 October 2026

All eleven project detail pages now use dedicated landscape headers. Their complete artwork fills the header width with an intrinsic image height and no height cap. Project cards and galleries keep their existing assets.

## Image delivery

`project-headers.json` maps every project to three responsive WebP files in `dist/assets/project-headers/`: 800 px, 1600 px, and the largest finished size (1920–3200 px wide). The browser chooses a size using `srcset` and `sizes`; the initial image has high fetch priority and explicit dimensions. WebP quality is 95 with smart chroma subsampling.

The previous 1024 px header copies were replaced with exports from the original 1920–6000 px source files. Source URLs, dimensions, output dimensions and file sizes are recorded in the manifest. Gorella Games, Tripoli Optic Group and NUMO Pay use the original wide composition. Fornello retains its original artwork on an extended solid black background.

Seven backgrounds were extended with the built-in image generation tool: Septimus Consulting, Hackathon, Shake Up, Vanex, Biscotti, Msh Mkanah and 16 Days of Activism. The original high-resolution artwork was composited back over each generated background. The logos, text, packaging and people come from the source, rather than the model's redraw. Only narrow background strips at the join are blended; their widths are recorded in the manifest. The protected interior of every lossless master was checked byte-for-byte against its resized source before delivery encoding. The final WebP files are high-quality lossy exports.

Generated background texture has a lower native resolution than the source artwork. Larger exports retain the original artwork's detail; they do not imply that every generated background pixel contains new native detail.

## Generation record

The exact seven selected edit prompts and generated output identifiers are in [project-header-generation.json](project-header-generation.json). Each selected result used a 1920×1080 guide with the existing image placed intact and unused margins marked magenta. Seven initial exploratory edits were followed by seven guided refinements. No external image generation service was used.

The parent workspace archives the original downloads, guides, lossless masters, finishing script, initial and final prompts, and browser evidence in `artifacts/project-headers/`. The generated raw PNGs remain in the Codex generated-images directory under task `01a12102-d7c4-7491-9645-2c685914d2c2`. These production archives are not required to build or serve the website; all 33 delivery images are included in this branch.

## Verification

- All 11 protected source interiors matched their lossless master pixels.
- All 11 headers loaded and filled their frame at 1440 px desktop and 390 px mobile widths, without cropping, a height cap or horizontal overflow (22 browser checks).
- All 16 pages, 305 referenced resources and 33 responsive header variants passed link/resource and image-dimension checks.
- All 15 existing Node tests passed.

## Concurrent work and integration

This change is isolated on `fix/project-header-extensions`, based on `830712e`. The concurrent `fix/hero-and-project-thumbnails` worktree was not edited. The local preview uses port 4184.

Only the project header template, new header manifest, project-specific CSS, generated project pages, delivery images and these records belong to this change. Shared motion, thumbnail and inner-page styles were left to the other task.

When integrating both branches, retain both the responsive header markup from this branch and the other task's story/layout updates in `build-pages.mjs`, then run `node build-pages.mjs` to regenerate the HTML. Do not replace the other branch's generated project pages wholesale. This change has not been pushed or deployed.
