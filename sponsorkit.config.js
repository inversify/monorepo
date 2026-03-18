import { defineConfig, presets } from "sponsorkit";

export default defineConfig({
  // Sponsor providers
  // - GitHub Sponsors: requires SPONSORKIT_GITHUB_TOKEN (PAT with read:user + read:org scopes)
  // - OpenCollective: requires SPONSORKIT_OPENCOLLECTIVE_KEY (https://opencollective.com/applications)
  providers: [
    {
      name: "github",
      login: "inversify",
      type: "organization",
    },
    {
      name: "opencollective",
      slug: "inversifyjs",
    },
  ],

  formats: ["svg"],
  outputDir: "./assets",

  renderer: "tiers",
  width: 800,

  tiers: [
    {
      title: "Gold Sponsors",
      monthlyDollars: 100,
      preset: presets.gold,
    },
    {
      title: "Silver Sponsors",
      monthlyDollars: 50,
      preset: presets.medium,
    },
    {
      title: "Bronze Sponsors",
      monthlyDollars: 5,
      preset: presets.base,
    },
    {
      title: "Backers",
      monthlyDollars: 1,
      preset: presets.small,
    },
    {
      title: "Past Sponsors",
      monthlyDollars: -1,
      preset: presets.xs,
    },
  ],
});
