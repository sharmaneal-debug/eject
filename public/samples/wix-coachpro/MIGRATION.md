# Migration notes

Source: https://hello466393.wixsite.com/coachpro
Platform: wix
Captured: 2026-10-12T14:07:41.937Z
Pages: /

- 1 form flagged data-eject-form="needs-endpoint". The action is "#" and native submit is blocked, so it does not post to the previous host. Original actions are listed below.
- 76 runtime scripts removed (analytics and platform JS). CSS animations that do not need that JS still run. Scroll-triggered and menu JS does not.
- Entrance animations that waited for the platform runtime are flattened so the captured layout stays visible.
- Internal links between captured pages are relative. Links to pages that were not captured stay on the original site.

## Forms

- `/` action `(none)`

