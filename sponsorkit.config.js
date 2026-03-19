import { defineConfig, tierPresets } from "sponsorkit";

export default defineConfig({
  // Sponsor providers
  // - GitHub Sponsors: requires SPONSORKIT_GITHUB_TOKEN (PAT with read:user + read:org scopes)
  // - OpenCollective: requires SPONSORKIT_OPENCOLLECTIVE_KEY (https://opencollective.com/applications)
  providers: ["github", "opencollective"],

  github: {
    login: "inversify",
    type: "organization",
  },

  opencollective: {
    slug: "inversifyjs",
  },

  formats: ["svg"],
  outputDir: "./assets",

  renderer: "tiers",
  width: 800,

  tiers: [
    {
      title: "Gold Sponsors",
      monthlyDollars: 100,
      preset: tierPresets.gold,
    },
    {
      title: "Silver Sponsors",
      monthlyDollars: 50,
      preset: tierPresets.medium,
    },
    {
      title: "Bronze Sponsors",
      monthlyDollars: 5,
      preset: tierPresets.base,
    },
    {
      title: "Backers",
      monthlyDollars: 1,
      preset: tierPresets.small,
    },
    {
      title: "Past Sponsors",
      monthlyDollars: -1,
      preset: tierPresets.xs,
    },
  ],
});
