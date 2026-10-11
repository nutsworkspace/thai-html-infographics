---
name: thai-html-infographics
description: "Create or redesign Thai infographic carousels and educational posters as editable HTML using Noto Sans Thai and the three established NEXTO visual styles, in portrait 4:5 or landscape 16:9. Use for references to styles 1, 2, or 3 in this design family, widescreen infographic layouts, HTML poster exports, or comparisons between these styles."
---

# Thai HTML infographics

Build editable HTML artboards in this design family, with local fonts and browser-rendered previews. This skill covers infographic/poster composition and its viewing gallery. Application UX and interactive website flows require their own design brief.

## Understand the source

Inspect every supplied source and reference image before writing layouts. Record the input count, main message, supporting information, brand, aspect ratio, and source-to-output mapping. Preserve meaningful details. If source wording is unreadable, ask for that specific text while completing readable material.

Use Noto Sans Thai for Thai. The established English pairings are Inter for styles 1 and 2, and Inter plus Georgia italic for style 3 headings. Follow the user's later font or brand choices when specified.

## Select the style

Read [references/design-styles.md](references/design-styles.md) when choosing or implementing a style. It defines the numbered styles, composition differences, token values, and links to the approved previews. View the selected preview with an image tool; load other styles only for a comparison request.

If a style was selected earlier in the conversation, continue it. When none is specified, use the supplied visual reference; otherwise use style 1 and state the assumption. A request for versions 2 and 3 means applying those two numbered styles to the same material, preserving page coverage.

## Build editable artboards

The approved templates contain a cover, five shortcut examples, and an ending page. They are examples of this design family, not a prescribed topic or page count. Read [references/html-workflow.md](references/html-workflow.md) before using the starter or exporting files.

Use `scripts/start_project.py` to copy a selected starter into a new output folder. Select the style and aspect ratio independently: every style has both `--aspect 4:5` and `--aspect 16:9` starters. The script defaults to 4:5 for existing callers; pass the chosen ratio explicitly. Adapt its HTML, brand, illustrations, sequence, filenames, and page indicators to the actual source. Build other page structures when the source calls for them. Use the scripts' `--help` for arguments.

Keep text in HTML and explanatory diagrams in HTML/CSS/SVG. Use supplied photos or assets when they carry meaning. Keep the poster readable as a static image, with one primary message per artboard and source details grouped beside their relevant graphic.

Preserve the source aspect ratio unless the user requests a new one. The 4:5 templates use 1080 × 1350; the 16:9 templates use 1920 × 1080. Continue a previously chosen ratio when it still applies. When no ratio is known, use 4:5 and state the assumption. If a different ratio is requested, update artboard dimensions, scaling behavior, gallery image dimensions, and print page size together.

For 16:9, use the landscape templates and their matching preview. Recompose the content into a horizontal reading order: primary heading and action on the left, explanation or diagram with its related note on the right. Covers and ending pages use their own two-column arrangements. Preserve each style's typography and visual hierarchy. Do not stretch a portrait poster or shrink its complete vertical stack to fit. Longer content may need a different grouping; retain all meaningful details and inspect the densest page.

Include `lang="th"`, locally bundled fonts and their licenses, and useful labels on gallery links. Reflow the gallery on small screens; proportionally scale the poster without altering its export composition.

For factual instructions such as a keyboard shortcut, check suspect source claims against an authoritative source before changing them. Mention material corrections in the handoff. Example-specific Windows claims in the templates are not reusable content defaults.

## Verify and deliver

Render every final artboard in a browser after the fonts load. Use `scripts/render_artboards.cjs` when its layout contract fits. Inspect a contact sheet and full-size representatives, including the densest page. Check clipped text, internal text boxes, image loading, small labels, Thai line breaks, color contrast, and desktop/mobile gallery behavior. Correct failures in the HTML/CSS and render affected outputs again.

For a usual redesign handoff, provide the editable HTML, a viewing gallery, one PNG per artboard, and a combined PDF when the user wants a complete file set. Respect narrower deliverables. For multiple styles, add a comparison using corresponding pages with the same content. A ZIP must contain every local dependency referenced by its included galleries or comparison.

Completion means every input is accounted for, previews match the final HTML, requested exports exist, and the final response provides working file links and an image preview. Installations, publishing, and messages to third parties are outside this skill's output workflow.
