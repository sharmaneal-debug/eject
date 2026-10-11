export const IN_SCOPE_SUMMARY =
  "Simple marketing sites, portfolios, and landing pages on Framer, Webflow, Wix, or Squarespace. A handful of pages, images, and a contact form.";

export const OUT_OF_SCOPE: { title: string; detail: string; referTo: string }[] = [
  {
    title: "Online stores",
    detail: "Carts, checkout, inventory, subscriptions, and product catalogs.",
    referTo: "A commerce developer, or stay on the platform's store. We don't migrate shops.",
  },
  {
    title: "Heavy CMS and large blogs",
    detail: "Collection databases, multi-reference content models, and sites whose value is the content system.",
    referTo: "Keep the CMS, or hire someone to move the content model. We don't extract CMS data.",
  },
  {
    title: "Member areas",
    detail: "Logins, courses, paywalls, and customer accounts.",
    referTo: "A developer who builds auth. We don't recreate gated products.",
  },
  {
    title: "More than one language",
    detail: "Localized URLs and translation workflows.",
    referTo: "A team that already ships multi-language sites.",
  },
  {
    title: "Bookings and custom billing",
    detail: "Scheduling products and payment logic built into the site.",
    referTo: "The product's own vendor, or a specialist. We don't rebuild those flows.",
  },
  {
    title: "Web apps",
    detail: "Dashboards, directories, and anything that is software rather than a brochure site.",
    referTo: "A software developer. Eject is a site move, not an app build.",
  },
];
