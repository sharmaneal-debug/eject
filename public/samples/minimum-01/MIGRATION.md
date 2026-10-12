# Migration notes

Source: https://minimum-01.framer.website/
Platform: framer
Captured: 2026-10-12T14:21:54.808Z
Pages: /, /legal

- 14 runtime scripts removed (analytics and platform JS). CSS animations that do not need that JS still run. Scroll-triggered and menu JS does not.
- Entrance animations that waited for the platform runtime are flattened so the captured layout stays visible.
- Internal links between captured pages are relative. Links to pages that were not captured stay on the original site.

