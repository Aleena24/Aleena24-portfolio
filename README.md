# aleena.varghese — portfolio

Personal portfolio of **Aleena Varghese** — Software Engineer · Full-Stack Developer · AI/ML Engineer.

Live site: single-page, dark-mode-first, with a custom zero-dependency 3D canvas scene.
Flagship case study: **CelerSCET**, the production ERP ecosystem of Sahrdaya College of
Engineering & Technology.

## Structure

```
index.html        the site (all sections)
css/site.css      design system + all styles
js/scene.js       hero 3D "system constellation" (custom perspective renderer)
js/main.js        nav, scroll reveals, pipeline + architecture explorers
resume.html       print-optimized résumé (A4)
resume/           résumé PDFs
img/              photo + favicon
*.pdf             research papers (IEEE cloud-removal, SRGAN, VR)
about|project|passion|contact.html   redirect stubs for old URLs
```

No frameworks, no build step, no trackers. Deployed as a static site (Vercel).

Rebuilding the PDF résumé after editing `resume.html`:

```bash
node resume/generate-pdf.mjs
```
