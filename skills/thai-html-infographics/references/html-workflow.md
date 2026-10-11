# Starter and browser export

## Start a project

Run the skill's starter with Python, using the actual skill path:

```text
python scripts/start_project.py --style 2 --aspect 4:5 --output <new-output-folder>
python scripts/start_project.py --style 2 --aspect 16:9 --output <another-new-output-folder>
```

It copies approved HTML examples and the selected theme plus shared local fonts, CSS, and scaling code. It refuses a non-empty output folder, so it cannot overwrite previous work. The output includes example content to replace before delivery. Source filenames such as `image-004.html` should map to the actual source list, and the gallery should reflect the final filenames.

Both ratios support styles 1, 2, and 3. Omitted `--aspect` keeps the original 4:5 behavior. Use 1080 × 1350 for 4:5 and 1920 × 1080 for 16:9. A request for all three styles at 16:9 means three separate starter folders with `--style 1`, `2`, and `3`, each using `--aspect 16:9`.

The landscape starter adds `landscape.css` after the base/theme CSS and uses a scaling helper that reads the artboard's native dimensions. Keep this stylesheet order in individual artboards, `all.html`, and the gallery. Its print page is 1920 × 1080 and its gallery previews use 16:9. After changing dimensions, synchronize the artboard, print size, gallery image attributes, and preview aspect ratio.

## Export after editing

Use the desktop `load_workspace_dependencies` tool, when available, to locate the current Node runtime and package directory. Otherwise use an installed Playwright package. The helper resolves Playwright from the supplied directory and does not install dependencies or download browsers.

```text
node scripts/render_artboards.cjs --project <output-folder> --node-modules <package-directory> --browser <installed-chromium-executable> --pdf
```

The helper reads top-level HTML files containing exactly one `.poster` inside a `.stage`. It excludes gallery/collection files by their actual structure, not by requiring a specific filename. Its contract is a fixed-size `.poster` scaled for viewing with its top-left as transform origin. It measures native artboard dimensions and renders PNGs at those dimensions after fonts finish loading.

It writes PNGs to `png/<html-stem>.png`, a `render-report.json`, and, if requested, `collection.pdf`. Outputs with those names are regenerated. Source HTML is kept unchanged. PDF assembly uses the individual artboards rather than trusting a potentially stale `all.html`; pages must share dimensions for one PDF.

The same export command handles both ratios. Confirm the report's native dimensions against the chosen ratio and inspect the resulting PNG dimensions. The renderer waits for fonts and viewing-scale updates before measuring and capturing the artboard. Keep different ratios in separate export folders and PDFs.

The report includes font faces actually loaded, browser/request errors, artboard boundary violations, internal text overflow, and image load failures. It exits unsuccessfully when these checks fail. Long labels can overflow their own cards while remaining inside the poster, so verify both geometry and visual composition. Browser checks do not replace image inspection or fact checking.

## Review and gallery

Inspect the newly generated PNGs, then update the editable gallery so every final PNG and HTML has a corresponding link. For a modified page count, rebuild `all.html` from the final individual artboards, or use `collection.pdf` for the combined export. Remove surplus example pages only after identifying them as unused examples in the new output folder.

Check the viewing gallery at desktop width and 375 px. Keep clickable labels at least 44 px tall, visible focus styles, usable hover contrast, and no horizontal document overflow. Scale the poster itself to fit rather than changing its type layout for mobile viewing.

For a portable ZIP, inspect every included local `src`, `href`, CSS import and font URL. A link to a comparison outside the included folder needs that comparison and its dependencies in the ZIP, or should be removed from the packaged gallery.
