# Migration notes

Source: https://clean-landing-page-template.webflow.io/
Platform: webflow
Captured: 2026-10-12T14:05:56.365Z
Pages: /, /landing-page-template

- 1 form flagged data-eject-form="needs-endpoint". They do not submit anywhere.
- 14 runtime scripts removed (analytics and platform JS). CSS animations that do not need that JS still run. Scroll-triggered and menu JS does not.
- 2 stylesheets still reference a remote url() or were not in the snapshot.
- Entrance animations that waited for the platform runtime are flattened so the captured layout stays visible.
- Internal links between captured pages are relative. Links to pages that were not captured stay on the original site.

## Forms

- `/` action `(none)`

