module.exports = {
  platform: "azure",
  onboarding: true,
  autodiscover: false,
  endpoint: "https://dev.azure.com/unicornde/",
  extends: [
    "config:best-practices",
    "group:allNonMajor",
    ":prHourlyLimitNone",
    ":prConcurrentLimitNone",
  ],
  repositories: ["Development/WorkSimple.Houston"],
  packageRules: [
    {
      matchSourceUrls: [
        "https://github.com/dotnet/aspnetcore",
        "https://github.com/dotnet/efcore",
        "https://github.com/dotnet/extensions",
        "https://github.com/dotnet/maui",
        "https://github.com/dotnet/roslyn",
        "https://github.com/dotnet/runtime",
        "https://github.com/dotnet/scaffolding",
        "https://github.com/dotnet/sdk",
      ],
      matchUpdateTypes: ["major"],
      enabled: false,
    },
  ],
  nuget: {
    registryUrls: [
      "https://pkgs.dev.azure.com/unicornde/_packaging/unicornde/nuget/v3/index.json",
      "https://api.nuget.org/v3/index.json",
    ],
  },
};
