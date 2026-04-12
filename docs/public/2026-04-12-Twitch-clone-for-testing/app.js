"use strict";

const STORAGE_KEY = "twitch_settings_clone_v1";
const STORAGE_VERSION = 1;
const STABLE_DEFAULT_SEED = 1337;
const LIVE_MUTATION_INTERVAL_MS = 28000;
const PERSIST_DEBOUNCE_MS = 220;

const routes = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security and Privacy" },
  { id: "notifications", label: "Notifications" },
  { id: "connections", label: "Connections" },
  { id: "content-preferences", label: "Content Preferences" },
  { id: "prime-perks", label: "Prime Perks" },
  { id: "channel-and-videos", label: "Channel and Videos" }
];

const labelSettingDefs = [
  { key: "sexualThemes", label: "Sexual Themes" },
  { key: "drugs", label: "Drugs, Intoxication, or Excessive Tobacco Use" },
  { key: "gambling", label: "Gambling" },
  { key: "violence", label: "Violent and Graphic Depictions" },
  { key: "profanity", label: "Significant Profanity or Vulgarity" },
  { key: "matureGames", label: "Mature-Rated Games" },
  { key: "politics", label: "Politics and Sensitive Social Issues" }
];

const notifSchema = {
  channels: {
    title: "Channels You Follow",
    description: "Alerts for followed channels and events.",
    items: [
      { key: "goLive", label: "Go live alerts", desc: "Receive notifications when followed channels go live." },
      { key: "updates", label: "Channel updates", desc: "Important schedule and stream updates." },
      { key: "raids", label: "Raid notifications", desc: "When channels you follow raid another stream." },
      { key: "drops", label: "Drops availability", desc: "When campaigns are active and eligible." }
    ]
  },
  social: {
    title: "Social",
    description: "Mentions, follows, and social activity.",
    items: [
      { key: "mentions", label: "Mentions", desc: "When someone mentions you in chat or comments." },
      { key: "follows", label: "New followers", desc: "When another user follows your channel." },
      { key: "friends", label: "Friend activity", desc: "When friends start streams or send updates." },
      { key: "stories", label: "Stories", desc: "Updates from creators you follow." }
    ]
  },
  marketing: {
    title: "Marketing",
    description: "Product updates and promotional messaging.",
    items: [
      { key: "announcements", label: "Product announcements", desc: "Platform-wide feature updates." },
      { key: "promotions", label: "Promotions", desc: "Events, offers, and seasonal campaigns." },
      { key: "editorial", label: "Editorial picks", desc: "Featured stories and curated content." }
    ]
  },
  streamers: {
    title: "Streamers",
    description: "Updates from creators and creator tools.",
    items: [
      { key: "newPosts", label: "Creator posts", desc: "Posts and updates from streamers." },
      { key: "polls", label: "Polls and predictions", desc: "Poll and prediction activity notifications." },
      { key: "events", label: "Event reminders", desc: "Upcoming creator events and collaborations." }
    ]
  },
  account: {
    title: "Account",
    description: "Security, account activity, and policy messages.",
    items: [
      { key: "security", label: "Security alerts", desc: "Suspicious sign-in and password events." },
      { key: "billing", label: "Billing notices", desc: "Subscription and purchase confirmations." },
      { key: "policy", label: "Policy updates", desc: "Terms, policy, and compliance updates." }
    ]
  },
  drops: {
    title: "Drops",
    description: "Drops rewards and watch progress.",
    items: [
      { key: "claimed", label: "Claim reminders", desc: "When an earned drop needs claiming." },
      { key: "progress", label: "Progress milestones", desc: "Progress alerts while watching eligible channels." },
      { key: "expiry", label: "Expiry warnings", desc: "Warnings before rewards expire." }
    ]
  }
};

const connectionDefs = [
  { id: "amazon", name: "Amazon", sub: "Shop and account linking", body: "Link your Amazon account to sync profile details and regional offers." },
  { id: "prime", name: "Amazon Prime Membership", sub: "Prime perks and benefits", body: "Connect Prime to unlock monthly subscription benefits and exclusive loot." },
  { id: "steam", name: "Steam", sub: "Game metadata sync", body: "Share game metadata and display currently played games in your profile." },
  { id: "youtube", name: "YouTube", sub: "Archive exports", body: "Export stream archives and clips to your YouTube library." },
  { id: "discord", name: "Discord", sub: "Community status", body: "Sync stream status and community connection details with Discord." },
  { id: "riot", name: "Riot Games", sub: "Game identity sync", body: "Connect your Riot identity for drop campaigns and profile verification." },
  { id: "ea", name: "EA Account", sub: "Reward campaigns", body: "Enable campaign-based rewards and connected account features." }
];

const demoAvatarPresets = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%239147ff'/%3E%3Cstop offset='1' stop-color='%23422975'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' fill='url(%23g)'/%3E%3Ccircle cx='60' cy='45' r='22' fill='%23fff'/%3E%3Crect x='25' y='73' width='70' height='34' rx='17' fill='%23fff'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='1' x2='1' y2='0'%3E%3Cstop stop-color='%2309a36b'/%3E%3Cstop offset='1' stop-color='%231f4d3e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' fill='url(%23g)'/%3E%3Ccircle cx='60' cy='42' r='21' fill='%23fff'/%3E%3Cpath d='M24 101c7-16 22-24 36-24s29 8 36 24' fill='%23fff'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop stop-color='%23ff8f70'/%3E%3Cstop offset='1' stop-color='%23a33737'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' fill='url(%23g)'/%3E%3Crect x='34' y='26' width='52' height='52' rx='18' fill='%23fff'/%3E%3Crect x='26' y='86' width='68' height='12' rx='6' fill='%23fff'/%3E%3C/svg%3E"
];

const demoBannerPresets = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23efe4ff'/%3E%3Cstop offset='1' stop-color='%23d5c3ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='180' fill='url(%23g)'/%3E%3Ccircle cx='110' cy='95' r='65' fill='%23fff8'/%3E%3Ccircle cx='490' cy='30' r='48' fill='%23fff8'/%3E%3Cpath d='M0 140C170 95 230 210 600 125V180H0Z' fill='%239147ff55'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='1' x2='1' y2='0'%3E%3Cstop stop-color='%23dbf3ff'/%3E%3Cstop offset='1' stop-color='%23bce8fd'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='180' fill='url(%23g)'/%3E%3Crect x='28' y='28' width='220' height='60' rx='18' fill='%23fff8'/%3E%3Crect x='360' y='96' width='210' height='56' rx='18' fill='%23fff8'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop stop-color='%23ffe9dd'/%3E%3Cstop offset='1' stop-color='%23ffd8c5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='180' fill='url(%23g)'/%3E%3Ccircle cx='85' cy='88' r='50' fill='%23fff9'/%3E%3Ccircle cx='510' cy='88' r='50' fill='%23fff9'/%3E%3Cpath d='M0 98h600v16H0z' fill='%23ffffff99'/%3E%3C/svg%3E"
];

let state;
let persistTimer = 0;
let liveTimer = 0;
let modalContext = null;

const dom = {
  tabs: document.getElementById("settings-tabs"),
  page: document.getElementById("page-content"),
  mainScroll: document.getElementById("main-scroll"),
  leftRail: document.getElementById("left-rail"),
  leftRailScroll: document.getElementById("left-rail-scroll"),
  followedList: document.getElementById("followed-list"),
  liveList: document.getElementById("live-list"),
  categoryList: document.getElementById("category-list"),
  recommendations: document.getElementById("recommendation-cards"),
  notifBadge: document.getElementById("notif-badge"),
  bitsBadge: document.getElementById("bits-badge"),
  topAvatar: document.getElementById("top-avatar"),
  accountMenu: document.getElementById("account-menu"),
  avatarUpload: document.getElementById("hidden-avatar-upload"),
  bannerUpload: document.getElementById("hidden-banner-upload"),
  liveMutationToggle: document.getElementById("live-mutation-toggle"),
  modalRoot: document.getElementById("modal-root"),
  toastRoot: document.getElementById("toast-root")
};

init();

function init() {
  const query = parseQuery();
  const saved = readStorage();
  state = buildInitialState(query, saved);
  setupGlobalListeners();
  ensureRouteInUrl(state.route.activeRoute);
  renderShell();
  renderRoute(state.route.activeRoute, { restoreScroll: true });
  startLiveMutations();
}

function parseQuery() {
  const search = new URLSearchParams(window.location.search);
  const modeRaw = (search.get("mode") || "").toLowerCase();
  const mode = modeRaw === "stable" || modeRaw === "dynamic" ? modeRaw : null;
  const seedValue = search.get("seed");
  const seed = seedValue && /^\d+$/.test(seedValue) ? Number(seedValue) : null;
  return { mode, seed };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      return null;
    }
    return parsed;
  } catch (_err) {
    return null;
  }
}

function buildInitialState(query, saved) {
  const resolvedMode = resolveMode(query, saved);
  const resolvedSeed = resolveSeed(query, saved, resolvedMode);
  const generated = generateAmbientData(resolvedSeed, resolvedMode);

  const defaults = createDefaultState(resolvedMode, resolvedSeed, generated);
  const merged = deepMerge(defaults, saved || {});

  merged.version = STORAGE_VERSION;
  merged.data.mode = resolvedMode;
  merged.data.seed = resolvedSeed;

  const shouldRegenerate = !saved || saved.data?.seed !== resolvedSeed || saved.data?.mode !== resolvedMode;
  if (shouldRegenerate) {
    merged.data.generated = generated;
    applyGeneratedDefaultsToSettings(merged);
    if (!saved) {
      merged.shell.liveMutationsEnabled = resolvedMode === "dynamic";
    }
  }

  merged.route.activeRoute = normalizeRoute(readRouteFromUrl() || merged.route.activeRoute);
  ensureScrollMaps(merged);
  ensureNotificationStructure(merged);
  ensureConnectionsStructure(merged);
  ensureContentStructure(merged);
  return merged;
}

function resolveMode(query, saved) {
  if (query.mode) {
    return query.mode;
  }
  if (saved?.data?.mode === "dynamic" || saved?.data?.mode === "stable") {
    return saved.data.mode;
  }
  return "stable";
}

function resolveSeed(query, saved, mode) {
  if (typeof query.seed === "number") {
    return query.seed;
  }
  if (mode === "stable") {
    return STABLE_DEFAULT_SEED;
  }
  if (saved?.data?.mode === "dynamic" && typeof saved.data.seed === "number") {
    return saved.data.seed;
  }
  return Math.floor(Date.now() % 1000000000);
}

function createDefaultState(mode, seed, generated) {
  return {
    version: STORAGE_VERSION,
    shell: {
      leftRailCompact: false,
      selectedAmbient: { group: "followed", id: generated.followedChannels[0]?.id || "" },
      accountMenuOpen: false,
      liveMutationsEnabled: mode === "dynamic",
      showMore: {
        followed: 7,
        live: 7,
        categories: 7
      },
      topBadges: {
        notifications: generated.badges.notifications,
        bits: generated.badges.bits
      },
      leftRailScrollTop: 0,
      navToastMessage: ""
    },
    route: {
      activeRoute: "profile",
      scrollPositions: {}
    },
    settings: {
      profile: {
        avatarUrl: demoAvatarPresets[0],
        bannerUrl: demoBannerPresets[0],
        username: generated.identity.username,
        usernameError: "",
        displayName: generated.identity.displayName,
        bio: "I stream variety games and build tools for stream automation and moderation workflows.",
        pronouns: "they/them",
        accentColor: "Default Purple",
        badgeStyle: "Classic",
        profileLinkVisibility: true,
        creationDate: generated.identity.creationDate,
        id: generated.identity.userId
      },
      security: {
        email: generated.identity.email,
        emailRevealed: false,
        emailVerified: true,
        allowExtraAccountsEmail: true,
        phoneNumber: "",
        phoneVerified: false,
        allowExtraAccountsPhone: false,
        twoFactorEnabled: false,
        twoFactorMethod: "authenticator",
        lastPasswordChange: "42 days ago"
      },
      notifications: createDefaultNotificationState(),
      connections: {},
      content: {
        hideLabels: {
          sexualThemes: false,
          drugs: false,
          gambling: false,
          violence: false,
          profanity: false,
          matureGames: false,
          politics: false
        },
        blurSexualThemes: true,
        categoryFeedback: [],
        channelFeedback: [],
        hiddenRecommendationIds: []
      },
      primePerks: {
        autoClaimMonthly: false,
        showPrimeLootReminder: true,
        perksExpanded: {
          monthly: true,
          faq: false,
          trial: false
        },
        claimedThisMonth: false
      },
      channelVideos: {
        featuredLayout: "grid",
        autoArchive: true,
        clipsEnabled: true,
        clipsReviewBeforePublish: false,
        matureCategoryConfirmation: true,
        categoryPinning: false,
        autoHighlightExport: false,
        sectionsExpanded: {
          archiveDefaults: true,
          clips: false,
          discoverability: false
        },
        partnerEligible: generated.identity.partnerEligible
      }
    },
    data: {
      mode,
      seed,
      generated
    }
  };
}

function createDefaultNotificationState() {
  const base = {
    desktopEnabled: true,
    smartDelivery: true,
    expanded: {},
    categories: {}
  };

  for (const [catKey, cat] of Object.entries(notifSchema)) {
    base.expanded[catKey] = catKey === "channels";
    base.categories[catKey] = {};
    for (const item of cat.items) {
      base.categories[catKey][item.key] = {
        enabled: true,
        desktop: true,
        mobile: true,
        email: item.key === "announcements" ? true : false
      };
    }
  }

  base.categories.marketing.promotions.enabled = false;
  base.categories.marketing.editorial.enabled = false;
  base.categories.account.policy.email = true;
  return base;
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }
  const output = Array.isArray(target) ? [...target] : { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && output[key] && typeof output[key] === "object" && !Array.isArray(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function generateAmbientData(seed, mode) {
  const rand = mulberry32(seed);
  const names = [
    "NightByte", "AetherVale", "ClipCrafter", "PixelTide", "TurboMoss", "HydraTune", "GhostCircuit", "SunsetLag",
    "NovaSoup", "RoguePanda", "GlintField", "RimshotRaven", "AlphaCart", "LoFiAnchor", "EchoCraze", "MapleRaid"
  ];
  const games = [
    "VALORANT", "Just Chatting", "Minecraft", "Apex Legends", "Chess", "Fortnite", "League of Legends", "Counter-Strike",
    "Stardew Valley", "World of Warcraft", "Music", "Art", "Speedruns"
  ];
  const categoryPool = [
    { name: "Shooter Tournaments", tags: ["violence", "matureGames"] },
    { name: "Cozy Town Builds", tags: [] },
    { name: "Late Night Poker", tags: ["gambling"] },
    { name: "Nightclub Rhythm", tags: ["sexualThemes", "profanity"] },
    { name: "Retro Speedruns", tags: [] },
    { name: "Political Debates", tags: ["politics", "profanity"] },
    { name: "Crafting & Drawing", tags: [] },
    { name: "Sci-Fi Horror Nights", tags: ["violence", "matureGames"] },
    { name: "Cooking Variety", tags: ["drugs"] },
    { name: "Open Mic Sessions", tags: [] },
    { name: "MMO Raids", tags: ["violence"] },
    { name: "Racing World Tour", tags: [] }
  ];

  const followedChannels = [];
  for (let i = 0; i < 16; i += 1) {
    const baseName = names[i % names.length];
    const game = games[Math.floor(rand() * games.length)];
    const category = categoryPool[Math.floor(rand() * categoryPool.length)];
    const viewers = Math.floor(rand() * 120000) + 12;
    const live = rand() > 0.28;
    followedChannels.push({
      id: `followed-${i + 1}`,
      name: i % 4 === 0 ? `${baseName}_ultrawidesession` : baseName,
      game,
      category: category.name,
      tags: category.tags,
      viewers,
      live,
      color: randomColor(rand)
    });
  }

  const liveChannels = [];
  for (let i = 0; i < 14; i += 1) {
    const baseName = names[(i + 5) % names.length];
    const game = games[Math.floor(rand() * games.length)];
    const category = categoryPool[Math.floor(rand() * categoryPool.length)];
    liveChannels.push({
      id: `live-${i + 1}`,
      name: i % 3 === 0 ? `${baseName}TVOfficial` : baseName,
      game,
      category: category.name,
      tags: category.tags,
      viewers: Math.floor(rand() * 250000) + 90,
      live: true,
      color: randomColor(rand)
    });
  }

  const categories = [];
  for (let i = 0; i < categoryPool.length; i += 1) {
    const c = categoryPool[i];
    categories.push({
      id: `cat-${i + 1}`,
      name: c.name,
      tags: c.tags,
      sub: i % 2 === 0 ? "Recommended" : "Trending",
      viewers: Math.floor(rand() * 520000) + 600
    });
  }

  const recommendations = Array.from({ length: 8 }).map((_, index) => {
    const source = categoryPool[Math.floor(rand() * categoryPool.length)];
    return {
      id: `rec-${index + 1}`,
      title: source.name,
      channel: names[Math.floor(rand() * names.length)],
      viewers: Math.floor(rand() * 180000) + 44,
      tags: source.tags,
      sentiment: "none"
    };
  });

  const identity = {
    username: `stream_${Math.floor(rand() * 8999) + 1000}`,
    displayName: `Creator${Math.floor(rand() * 800) + 100}`,
    creationDate: `2018-${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`,
    userId: `U-${Math.floor(rand() * 899999) + 100000}`,
    email: `streamer${Math.floor(rand() * 899) + 100}@example.test`,
    partnerEligible: rand() > 0.46
  };

  const badges = {
    notifications: Math.floor(rand() * 14) + (mode === "dynamic" ? 1 : 0),
    bits: Math.floor(rand() * 5) + 1
  };

  return {
    followedChannels,
    liveChannels,
    categories,
    recommendations,
    badges,
    identity,
    generatedAt: new Date().toISOString()
  };
}

function randomColor(rand) {
  const palette = ["#734fc8", "#3d7fb0", "#2f9d74", "#bb5a68", "#9b54b3", "#c76f35", "#4472c1", "#555780"];
  return palette[Math.floor(rand() * palette.length)];
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function applyGeneratedDefaultsToSettings(nextState) {
  const generated = nextState.data.generated;
  nextState.settings.profile.username = generated.identity.username;
  nextState.settings.profile.displayName = generated.identity.displayName;
  nextState.settings.profile.creationDate = generated.identity.creationDate;
  nextState.settings.profile.id = generated.identity.userId;
  nextState.settings.security.email = generated.identity.email;
  nextState.settings.channelVideos.partnerEligible = generated.identity.partnerEligible;

  const rand = mulberry32(nextState.data.seed + (nextState.data.mode === "dynamic" ? 99 : 1));
  for (const def of connectionDefs) {
    nextState.settings.connections[def.id] = {
      connected: rand() > 0.67,
      warning: rand() > 0.86,
      method: rand() > 0.5 ? "oauth" : "device",
      lastSynced: `${Math.floor(rand() * 26) + 2} min ago`
    };
  }
  if (nextState.data.mode === "stable") {
    nextState.settings.connections.youtube.connected = false;
    nextState.settings.connections.steam.connected = true;
    nextState.settings.connections.prime.connected = false;
  }
}

function ensureScrollMaps(nextState) {
  if (!nextState.route.scrollPositions || typeof nextState.route.scrollPositions !== "object") {
    nextState.route.scrollPositions = {};
  }
  for (const route of routes) {
    if (typeof nextState.route.scrollPositions[route.id] !== "number") {
      nextState.route.scrollPositions[route.id] = 0;
    }
  }
}

function ensureNotificationStructure(nextState) {
  const defaults = createDefaultNotificationState();
  nextState.settings.notifications = deepMerge(defaults, nextState.settings.notifications || {});
}

function ensureConnectionsStructure(nextState) {
  if (!nextState.settings.connections || typeof nextState.settings.connections !== "object") {
    nextState.settings.connections = {};
  }
  for (const def of connectionDefs) {
    if (!nextState.settings.connections[def.id]) {
      nextState.settings.connections[def.id] = {
        connected: false,
        warning: false,
        method: "oauth",
        lastSynced: "never"
      };
    }
  }
}

function ensureContentStructure(nextState) {
  const defaults = createDefaultState(nextState.data.mode, nextState.data.seed, nextState.data.generated).settings.content;
  nextState.settings.content = deepMerge(defaults, nextState.settings.content || {});
}

function setupGlobalListeners() {
  window.addEventListener("hashchange", onHashChange);

  document.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) {
      if (state.shell.accountMenuOpen && !event.target.closest("#account-menu") && !event.target.closest("[data-action='toggle-account-menu']")) {
        state.shell.accountMenuOpen = false;
        renderAccountMenu();
      }
      return;
    }

    const action = actionEl.dataset.action;
    switch (action) {
      case "route":
        navigateTo(actionEl.dataset.route || "profile");
        break;
      case "toggle-account-menu":
        state.shell.accountMenuOpen = !state.shell.accountMenuOpen;
        renderAccountMenu();
        schedulePersist();
        break;
      case "toggle-rail":
        state.shell.leftRailCompact = !state.shell.leftRailCompact;
        renderLeftRailMode();
        schedulePersist();
        break;
      case "show-more":
        incrementShowMore(actionEl.dataset.group || "followed");
        break;
      case "select-ambient":
        selectAmbient(actionEl.dataset.group, actionEl.dataset.id || "");
        break;
      case "toggle-live-mutations":
        state.shell.liveMutationsEnabled = !state.shell.liveMutationsEnabled;
        renderLiveMutationToggle();
        pushToast(state.shell.liveMutationsEnabled ? "Live mutations enabled" : "Live mutations disabled");
        schedulePersist();
        break;
      case "toggle-setting":
        toggleSetting(actionEl.dataset.settingKey || "");
        break;
      case "toggle-notification-item":
        toggleNotificationItem(actionEl.dataset.category || "", actionEl.dataset.item || "", actionEl.dataset.target || "enabled");
        break;
      case "toggle-notification-category":
        toggleNotificationCategory(actionEl.dataset.category || "");
        break;
      case "open-avatar-picker":
        openAssetPickerModal("avatar");
        break;
      case "open-banner-picker":
        openAssetPickerModal("banner");
        break;
      case "clear-avatar":
        state.settings.profile.avatarUrl = demoAvatarPresets[0];
        renderTopAvatar();
        rerenderCurrentRoute();
        pushToast("Profile picture reset");
        schedulePersist();
        break;
      case "open-email-edit":
        openEmailEditModal();
        break;
      case "reveal-email":
        state.settings.security.emailRevealed = !state.settings.security.emailRevealed;
        rerenderCurrentRoute();
        schedulePersist();
        break;
      case "open-phone-modal":
        openPhoneModal();
        break;
      case "open-password-modal":
        openPasswordModal();
        break;
      case "open-two-fa":
        openTwoFactorWizard();
        break;
      case "open-signout-modal":
        openSignOutModal();
        break;
      case "open-oauth":
        openOAuthModal(actionEl.dataset.service || "");
        break;
      case "disconnect-service":
        disconnectService(actionEl.dataset.service || "");
        break;
      case "feedback-reco":
        handleRecommendationFeedback(actionEl.dataset.id || "", actionEl.dataset.feedback || "up");
        break;
      case "clear-feedback":
        clearFeedback(actionEl.dataset.feedbackType || "category");
        break;
      case "claim-prime-reward":
        state.settings.primePerks.claimedThisMonth = true;
        rerenderCurrentRoute();
        pushToast("Monthly reward claimed locally");
        schedulePersist();
        break;
      case "reset-dynamic-seed":
        resetDynamicSeed();
        break;
      case "top-nav":
      case "show-prime":
      case "open-notifications":
      case "noop":
      default:
        pushToast("Navigation is mocked for this local fixture.");
        break;
    }
  });

  document.addEventListener("change", (event) => {
    const el = event.target;
    const settingKey = el.dataset.settingKey;
    if (settingKey) {
      const value = inputValue(el);
      setPath(state, settingKey, value);
      enforceDependenciesAfterSetting(settingKey);
      schedulePersist();
      if (settingKey.startsWith("settings.content.hideLabels") || settingKey === "settings.content.blurSexualThemes") {
        renderLeftRail();
      }
      if (settingKey.includes("notifications") || settingKey.startsWith("settings.content") || settingKey.startsWith("settings.connections")) {
        rerenderCurrentRoute();
      }
      return;
    }

    if (el.matches("[data-notif-delivery]")) {
      const category = el.dataset.category;
      const item = el.dataset.item;
      const channel = el.dataset.notifDelivery;
      if (category && item && channel) {
        const path = `settings.notifications.categories.${category}.${item}.${channel}`;
        setPath(state, path, el.checked);
        schedulePersist();
        rerenderCurrentRoute();
      }
    }
  });

  document.addEventListener("input", (event) => {
    const el = event.target;
    const settingKey = el.dataset.settingKey;
    if (!settingKey) {
      return;
    }
    const value = inputValue(el);
    setPath(state, settingKey, value);
    if (settingKey === "settings.profile.username") {
      validateUsername(false);
      updateUsernameErrorInline();
    }
    schedulePersist();
  });

  document.addEventListener("focusout", (event) => {
    const el = event.target;
    if (el?.dataset?.settingKey === "settings.profile.username") {
      validateUsername(true);
      rerenderCurrentRoute();
      schedulePersist();
    }
  });

  dom.mainScroll.addEventListener("scroll", () => {
    state.route.scrollPositions[state.route.activeRoute] = dom.mainScroll.scrollTop;
    schedulePersist();
  });

  dom.leftRailScroll.addEventListener("scroll", () => {
    state.shell.leftRailScrollTop = dom.leftRailScroll.scrollTop;
    schedulePersist();
  });

  dom.avatarUpload.addEventListener("change", () => {
    const file = dom.avatarUpload.files?.[0];
    if (!file) {
      return;
    }
    fileToDataUrl(file).then((dataUrl) => {
      state.settings.profile.avatarUrl = dataUrl;
      renderTopAvatar();
      rerenderCurrentRoute();
      pushToast("Profile picture updated");
      schedulePersist();
    }).catch(() => {
      pushToast("Could not load selected image");
    }).finally(() => {
      dom.avatarUpload.value = "";
    });
  });

  dom.bannerUpload.addEventListener("change", () => {
    const file = dom.bannerUpload.files?.[0];
    if (!file) {
      return;
    }
    fileToDataUrl(file).then((dataUrl) => {
      state.settings.profile.bannerUrl = dataUrl;
      rerenderCurrentRoute();
      pushToast("Profile banner updated");
      schedulePersist();
    }).catch(() => {
      pushToast("Could not load selected image");
    }).finally(() => {
      dom.bannerUpload.value = "";
    });
  });

  document.addEventListener("submit", (event) => {
    if (event.target.matches(".search-wrap")) {
      event.preventDefault();
      pushToast("Search is mocked in this fixture.");
    }
  });
}

function inputValue(el) {
  if (el.type === "checkbox") {
    return el.checked;
  }
  return el.value;
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistNow();
  }, PERSIST_DEBOUNCE_MS);
}

function persistNow() {
  const payload = {
    version: STORAGE_VERSION,
    shell: state.shell,
    route: state.route,
    settings: state.settings,
    data: {
      mode: state.data.mode,
      seed: state.data.seed,
      generated: state.data.generated
    }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function onHashChange() {
  const rawRoute = readRouteFromUrl();
  const route = normalizeRoute(rawRoute);
  if (rawRoute !== route) {
    ensureRouteInUrl(route);
  }
  if (route === state.route.activeRoute) {
    return;
  }
  renderRoute(route, { restoreScroll: true });
}

function readRouteFromUrl() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#/")) {
    return null;
  }
  return hash.slice(2);
}

function normalizeRoute(route) {
  const safe = route || "profile";
  return routes.some((item) => item.id === safe) ? safe : "profile";
}

function ensureRouteInUrl(route) {
  const normalized = normalizeRoute(route);
  if (readRouteFromUrl() !== normalized) {
    window.location.hash = `/${normalized}`;
  }
}

function navigateTo(route) {
  const normalized = normalizeRoute(route);
  if (normalized === state.route.activeRoute) {
    return;
  }
  window.location.hash = `/${normalized}`;
}

function renderShell() {
  renderTopAvatar();
  renderAccountMenu();
  renderLeftRailMode();
  renderLeftRail();
  renderTopBadges();
  renderLiveMutationToggle();
  renderTabs();
  if (typeof state.shell.leftRailScrollTop === "number") {
    dom.leftRailScroll.scrollTop = state.shell.leftRailScrollTop;
  }
}

function renderTopAvatar() {
  dom.topAvatar.src = state.settings.profile.avatarUrl;
}

function renderTopBadges() {
  dom.notifBadge.textContent = String(state.shell.topBadges.notifications);
  dom.bitsBadge.textContent = String(state.shell.topBadges.bits);
}

function renderLiveMutationToggle() {
  dom.liveMutationToggle.setAttribute("aria-checked", state.shell.liveMutationsEnabled ? "true" : "false");
}

function renderAccountMenu() {
  dom.accountMenu.classList.toggle("hidden", !state.shell.accountMenuOpen);
  const trigger = document.querySelector("[data-action='toggle-account-menu']");
  if (trigger) {
    trigger.setAttribute("aria-expanded", state.shell.accountMenuOpen ? "true" : "false");
  }
}

function renderLeftRailMode() {
  document.body.classList.toggle("rail-compact", state.shell.leftRailCompact);
}

function renderLeftRail() {
  const filteredFollowed = filteredAmbientItems(state.data.generated.followedChannels);
  const filteredLive = filteredAmbientItems(state.data.generated.liveChannels);
  const filteredCategories = filteredCategoriesItems(state.data.generated.categories);

  dom.followedList.innerHTML = listItemsMarkup("followed", filteredFollowed, state.shell.showMore.followed);
  dom.liveList.innerHTML = listItemsMarkup("live", filteredLive, state.shell.showMore.live);
  dom.categoryList.innerHTML = categoryListMarkup(filteredCategories, state.shell.showMore.categories);

  renderRecommendations();
}

function listItemsMarkup(group, list, showCount) {
  const limited = list.slice(0, Math.max(1, showCount));
  return limited.map((item) => {
    const selected = state.shell.selectedAmbient.group === group && state.shell.selectedAmbient.id === item.id;
    const liveBadge = item.live ? `<span><span class="dot-live"></span>${formatCount(item.viewers)}</span>` : "offline";
    return `
      <li>
        <button class="rail-item ${selected ? "active" : ""}" type="button" data-action="select-ambient" data-group="${group}" data-id="${item.id}" data-testid="ambient-${group}-${item.id}">
          <span class="rail-avatar" style="background:${item.color}">${escapeHtml(initials(item.name))}</span>
          <span class="rail-title-wrap">
            <span class="rail-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <span class="rail-sub">${escapeHtml(item.game || item.category)}</span>
          </span>
          <span class="rail-meta">${liveBadge}</span>
        </button>
      </li>
    `;
  }).join("");
}

function categoryListMarkup(list, showCount) {
  const limited = list.slice(0, Math.max(1, showCount));
  return limited.map((item) => {
    const selected = state.shell.selectedAmbient.group === "categories" && state.shell.selectedAmbient.id === item.id;
    return `
      <li>
        <button class="rail-item ${selected ? "active" : ""}" type="button" data-action="select-ambient" data-group="categories" data-id="${item.id}" data-testid="ambient-categories-${item.id}">
          <span class="rail-avatar" style="background:#5a5f98">${escapeHtml(initials(item.name))}</span>
          <span class="rail-title-wrap">
            <span class="rail-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <span class="rail-sub">${escapeHtml(item.sub)}</span>
          </span>
          <span class="rail-meta">${formatCount(item.viewers)}</span>
        </button>
      </li>
    `;
  }).join("");
}

function renderRecommendations() {
  const list = filteredRecommendations();
  dom.recommendations.innerHTML = list.map((item) => {
    const isBlurred = state.settings.content.blurSexualThemes && item.tags.includes("sexualThemes");
    return `
      <article class="recommendation-card" data-testid="recommendation-${item.id}">
        <div class="reco-thumb ${isBlurred ? "blurred" : ""}">${escapeHtml(item.title)}</div>
        <div class="reco-body">
          <div>
            <p class="reco-title">${escapeHtml(item.channel)}</p>
            <p class="reco-sub">${escapeHtml(item.title)} | ${formatCount(item.viewers)} viewers</p>
          </div>
          <div class="reco-actions">
            <button type="button" data-action="feedback-reco" data-id="${item.id}" data-feedback="up">Up</button>
            <button type="button" data-action="feedback-reco" data-id="${item.id}" data-feedback="down">Down</button>
            <button type="button" data-action="feedback-reco" data-id="${item.id}" data-feedback="hide">Hide</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderTabs() {
  dom.tabs.innerHTML = routes.map((route) => {
    const active = route.id === state.route.activeRoute;
    return `<button class="settings-tab ${active ? "active" : ""}" type="button" data-action="route" data-route="${route.id}" data-testid="tab-${route.id}">${escapeHtml(route.label)}</button>`;
  }).join("");
}

function renderRoute(route, options = {}) {
  const normalized = normalizeRoute(route);
  state.route.scrollPositions[state.route.activeRoute] = dom.mainScroll.scrollTop;
  state.route.activeRoute = normalized;
  renderTabs();

  switch (normalized) {
    case "profile":
      dom.page.innerHTML = renderProfilePage();
      break;
    case "security":
      dom.page.innerHTML = renderSecurityPage();
      break;
    case "notifications":
      dom.page.innerHTML = renderNotificationsPage();
      initAccordionsFromState();
      break;
    case "connections":
      dom.page.innerHTML = renderConnectionsPage();
      break;
    case "content-preferences":
      dom.page.innerHTML = renderContentPreferencesPage();
      break;
    case "prime-perks":
      dom.page.innerHTML = renderPrimePerksPage();
      initAccordionsFromState();
      break;
    case "channel-and-videos":
      dom.page.innerHTML = renderChannelVideosPage();
      initAccordionsFromState();
      break;
    default:
      dom.page.innerHTML = renderProfilePage();
      break;
  }

  if (options.restoreScroll) {
    dom.mainScroll.scrollTop = state.route.scrollPositions[normalized] || 0;
  }
  schedulePersist();
}

function rerenderCurrentRoute() {
  const top = dom.mainScroll.scrollTop;
  renderRoute(state.route.activeRoute, { restoreScroll: false });
  dom.mainScroll.scrollTop = top;
}

function renderProfilePage() {
  const profile = state.settings.profile;
  const usernameError = profile.usernameError ? `<p class="field-error" data-testid="username-error">${escapeHtml(profile.usernameError)}</p>` : "";

  return `
    <section class="section" data-testid="profile-page">
      <h2 class="section-title">Profile Picture</h2>
      <div class="card pad">
        <div class="control-inline">
          <img class="avatar-preview" src="${escapeHtml(profile.avatarUrl)}" alt="Current profile avatar">
          <div class="row-control">
            <div class="control-inline">
              <button class="btn" type="button" data-action="open-avatar-picker" data-testid="profile-picture-update">Update Profile Picture</button>
              <button class="icon-only" type="button" data-action="clear-avatar" title="Remove avatar">Del</button>
            </div>
            <p class="row-helper">Supported formats: PNG, JPG, GIF. Maximum size 10MB.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Profile Banner</h2>
      <div class="card pad">
        <div class="row-control">
          <img class="banner-preview" src="${escapeHtml(profile.bannerUrl)}" alt="Current profile banner">
          <div class="control-inline">
            <button class="btn" type="button" data-action="open-banner-picker" data-testid="profile-banner-update">Update</button>
          </div>
          <p class="row-helper">Supported formats: PNG, JPG, GIF. Recommended: 1200x380. Maximum size 10MB.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Profile Settings</h2>
      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Username</h4>
            <p class="row-helper">Usernames must be 4-25 chars, letters/numbers/underscore only, and not reserved.</p>
          </div>
          <div class="row-control">
            <div class="input-with-icon">
              <input type="text" value="${escapeHtml(profile.username)}" data-setting-key="settings.profile.username" data-testid="profile-username-input" aria-label="Username">
              <button class="icon-only" type="button" aria-label="Edit username">Ed</button>
            </div>
            ${usernameError}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <label for="display-name">Display Name</label>
            <p class="row-helper">Display names can include spaces and capitalization.</p>
          </div>
          <div class="row-control">
            <input id="display-name" type="text" value="${escapeHtml(profile.displayName)}" data-setting-key="settings.profile.displayName" data-testid="profile-display-name-input">
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <label for="bio-field">Bio</label>
            <p class="row-helper">Tell viewers what you stream. 0 / 300 characters.</p>
          </div>
          <div class="row-control">
            <textarea id="bio-field" data-setting-key="settings.profile.bio" data-testid="profile-bio-input">${escapeHtml(profile.bio)}</textarea>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <label for="pronouns">Pronouns</label>
            <p class="row-helper">Optional profile metadata shown under your display name.</p>
          </div>
          <div class="row-control">
            <select id="pronouns" data-setting-key="settings.profile.pronouns" data-testid="profile-pronouns-select">
              ${selectOption(profile.pronouns, "unspecified", "Prefer not to say")}
              ${selectOption(profile.pronouns, "she/her", "she/her")}
              ${selectOption(profile.pronouns, "he/him", "he/him")}
              ${selectOption(profile.pronouns, "they/them", "they/them")}
              ${selectOption(profile.pronouns, "custom", "custom")}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <label for="accent">Profile Accent Color</label>
            <p class="row-helper">Used in selected profile highlights and callouts.</p>
          </div>
          <div class="row-control">
            <select id="accent" data-setting-key="settings.profile.accentColor" data-testid="profile-accent-select">
              ${selectOption(profile.accentColor, "Default Purple", "Default Purple")}
              ${selectOption(profile.accentColor, "Ocean Blue", "Ocean Blue")}
              ${selectOption(profile.accentColor, "Crimson", "Crimson")}
              ${selectOption(profile.accentColor, "Neon Mint", "Neon Mint")}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Featured Badge Style</h4>
            <p class="row-helper">Choose how your channel achievement badge appears.</p>
          </div>
          <div class="row-control">
            <select data-setting-key="settings.profile.badgeStyle" data-testid="profile-badge-style">
              ${selectOption(profile.badgeStyle, "Classic", "Classic")}
              ${selectOption(profile.badgeStyle, "Minimal", "Minimal")}
              ${selectOption(profile.badgeStyle, "Neon", "Neon")}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Profile Link Visibility</h4>
            <p class="row-helper">Allow your channel link to be visible on recommendation cards.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.profile.profileLinkVisibility", profile.profileLinkVisibility, { testid: "profile-link-visibility" })}
          </div>
        </div>

        <div class="row stack">
          <p class="kicker">Account metadata</p>
          <div class="meta-table">
            <div class="meta-row"><div>Account ID</div><div>${escapeHtml(profile.id)}</div></div>
            <div class="meta-row"><div>Account creation date</div><div>${escapeHtml(profile.creationDate)}</div></div>
            <div class="meta-row"><div>Mode / Seed</div><div>${escapeHtml(`${state.data.mode} / ${state.data.seed}`)}</div></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSecurityPage() {
  const security = state.settings.security;
  const masked = maskEmail(security.email);
  const displayEmail = security.emailRevealed ? security.email : masked;

  return `
    <section class="section" data-testid="security-page">
      <h2 class="section-title">Contact</h2>
      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Email</h4>
            <p class="row-helper">Used for account recovery and security notifications.</p>
          </div>
          <div class="row-control">
            <p><strong>${escapeHtml(displayEmail)}</strong></p>
            <div class="control-inline">
              <span class="status success">Verified</span>
              <button class="icon-only" type="button" data-action="reveal-email" data-testid="security-email-reveal">${security.emailRevealed ? "Hide" : "Show"}</button>
              <button class="icon-only" type="button" data-action="open-email-edit" data-testid="security-email-edit">Edit</button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Enable additional account creation</h4>
            <p class="row-helper">Allow additional accounts with this verified email address.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.security.allowExtraAccountsEmail", security.allowExtraAccountsEmail, { testid: "security-extra-account-email" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Phone Number</h4>
            <p class="row-helper">Required for SMS-based two-factor authentication flows.</p>
          </div>
          <div class="row-control">
            <p>${security.phoneNumber ? escapeHtml(security.phoneNumber) : "No phone number added"}</p>
            <div class="control-inline">
              ${security.phoneVerified ? '<span class="status success">Verified</span>' : '<span class="status">Not added</span>'}
              <button class="btn" type="button" data-action="open-phone-modal" data-testid="security-phone-add">${security.phoneNumber ? "Manage" : "Add a number"}</button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Enable additional account creation</h4>
            <p class="row-helper">Available after a verified phone number is added.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.security.allowExtraAccountsPhone", security.allowExtraAccountsPhone, {
              disabled: !security.phoneVerified,
              testid: "security-extra-account-phone"
            })}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Security</h2>
      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Password</h4>
            <p class="row-helper">Last changed ${escapeHtml(security.lastPasswordChange)}.</p>
          </div>
          <div class="row-control">
            <button class="link-btn" type="button" data-action="open-password-modal" data-testid="security-change-password">Change password</button>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Two-Factor Authentication</h4>
            <p class="row-helper">Add extra protection to your account by requiring a verification code.</p>
          </div>
          <div class="row-control">
            ${security.twoFactorEnabled ? '<span class="status success">Enabled</span>' : '<span class="status warning">Not enabled</span>'}
            <button class="btn primary" type="button" data-action="open-two-fa" data-testid="security-two-fa-action">${security.twoFactorEnabled ? "Manage 2FA" : "Set Up Two-Factor Authentication"}</button>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Sign Out Everywhere</h4>
            <p class="row-helper">Ends active sessions and clears ephemeral shell state.</p>
          </div>
          <div class="row-control">
            <button class="btn" type="button" data-action="open-signout-modal" data-testid="security-signout-everywhere">Sign Out Everywhere</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotificationsPage() {
  const notifications = state.settings.notifications;

  const categoryCards = Object.entries(notifSchema).map(([catKey, catDef]) => {
    const expanded = !!notifications.expanded[catKey];
    const summary = notificationSummary(catKey);

    const itemRows = catDef.items.map((itemDef) => {
      const itemState = notifications.categories[catKey][itemDef.key];
      const desktopDisabled = !notifications.desktopEnabled;
      const smartManaged = notifications.smartDelivery && (catKey === "channels" || catKey === "social");
      const rowDisabled = !itemState.enabled;

      return `
        <div class="delivery-row ${rowDisabled ? "" : ""}" data-disabled="${rowDisabled ? "true" : "false"}">
          <div>
            <strong>${escapeHtml(itemDef.label)}</strong>
            <p class="row-helper">${escapeHtml(itemDef.desc)}${smartManaged ? " Smart Delivery may reroute this notification." : ""}</p>
          </div>
          <div class="control-inline">
            <label class="sr-only" for="notif-${catKey}-${itemDef.key}-enabled">Enable ${escapeHtml(itemDef.label)}</label>
            <button id="notif-${catKey}-${itemDef.key}-enabled" class="toggle" role="switch" type="button" aria-checked="${itemState.enabled ? "true" : "false"}" data-action="toggle-notification-item" data-category="${catKey}" data-item="${itemDef.key}" data-target="enabled" data-testid="notif-${catKey}-${itemDef.key}-enabled"></button>

            <label><input type="checkbox" ${itemState.desktop ? "checked" : ""} ${desktopDisabled || !itemState.enabled ? "disabled" : ""} data-notif-delivery="desktop" data-category="${catKey}" data-item="${itemDef.key}"> desktop</label>
            <label><input type="checkbox" ${itemState.mobile ? "checked" : ""} ${!itemState.enabled ? "disabled" : ""} data-notif-delivery="mobile" data-category="${catKey}" data-item="${itemDef.key}"> mobile</label>
            <label><input type="checkbox" ${itemState.email ? "checked" : ""} ${smartManaged || !itemState.enabled ? "disabled" : ""} data-notif-delivery="email" data-category="${catKey}" data-item="${itemDef.key}"> email</label>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="accordion" data-testid="notif-category-${catKey}">
        <button class="acc-trigger" type="button" data-action="toggle-notification-category" data-category="${catKey}" aria-expanded="${expanded ? "true" : "false"}">
          <span class="acc-head">
            <span class="acc-title">${escapeHtml(catDef.title)}</span>
            <span class="acc-desc">${escapeHtml(catDef.description)}</span>
            <span class="acc-summary">${escapeHtml(summary)}</span>
          </span>
          <span class="acc-chevron">></span>
        </button>
        <div class="acc-panel" data-panel-for="notif-${catKey}" style="max-height:${expanded ? "1200px" : "0px"}">
          <div class="acc-panel-content">${itemRows}</div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="section" data-testid="notifications-page">
      <p class="page-intro">Manage what you are notified about and where those notifications appear across Twitch-like surfaces.</p>

      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Desktop Notifications</h4>
            <p class="row-helper">Receive browser desktop notifications while the browser is active.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.notifications.desktopEnabled", notifications.desktopEnabled, { testid: "notif-desktop-enabled" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Smart Delivery</h4>
            <p class="row-helper">Route notifications based on where you are active so duplicate notifications are reduced.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.notifications.smartDelivery", notifications.smartDelivery, { testid: "notif-smart-delivery" })}
          </div>
        </div>
      </div>

      <div class="card">${categoryCards}</div>
    </section>
  `;
}

function renderConnectionsPage() {
  const rows = connectionDefs.map((def) => {
    const conn = state.settings.connections[def.id];
    const connected = !!conn.connected;
    const warning = !!conn.warning;

    const status = connected
      ? (warning ? '<span class="status warning">Reconnect required</span>' : '<span class="status success">Connected</span>')
      : '<span class="status">Not connected</span>';

    const actions = connected
      ? `<button class="btn" type="button" data-action="open-oauth" data-service="${def.id}" data-testid="connect-${def.id}">Manage</button>
         <button class="btn danger" type="button" data-action="disconnect-service" data-service="${def.id}" data-testid="disconnect-${def.id}">Disconnect</button>`
      : `<button class="btn" type="button" data-action="open-oauth" data-service="${def.id}" data-testid="connect-${def.id}">Connect</button>`;

    const detail = connectionDetail(def.id, conn);

    return `
      <div class="service-row" data-testid="service-${def.id}">
        <span class="service-icon">${escapeHtml(initials(def.name))}</span>
        <div>
          <p class="service-name">${escapeHtml(def.name)}</p>
          <p class="service-sub">${escapeHtml(def.sub)}</p>
        </div>
        <div>
          <p class="row-helper">${escapeHtml(def.body)}</p>
          <p class="row-helper">${escapeHtml(detail)}</p>
        </div>
        <div class="row-control">
          ${status}
          <div class="control-inline">${actions}</div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="section" data-testid="connections-page">
      <h2 class="section-title">Recommended Connections</h2>
      <p class="section-subtitle">Manage connected accounts and services for identity sync, archive exports, and campaign eligibility.</p>
      <div class="card">${rows}</div>
    </section>
  `;
}

function connectionDetail(id, conn) {
  if (!conn.connected) {
    return "Ready to connect.";
  }
  if (id === "youtube") {
    return "Archive export and clips sync options available.";
  }
  if (id === "steam") {
    return "Game metadata sharing enabled.";
  }
  if (id === "amazon" || id === "prime") {
    return "Linked profile and membership details synced locally.";
  }
  return `Last synced ${conn.lastSynced}.`;
}

function renderContentPreferencesPage() {
  const content = state.settings.content;

  const labelRows = labelSettingDefs.map((def) => {
    return `
      <div class="row">
        <div class="row-label">
          <h4>${escapeHtml(def.label)}</h4>
        </div>
        <div class="row-control">
          ${toggleButton(`settings.content.hideLabels.${def.key}`, content.hideLabels[def.key], { testid: `ccl-${def.key}` })}
        </div>
      </div>
    `;
  }).join("");

  const categoryFeedback = renderFeedbackList(content.categoryFeedback, "category");
  const channelFeedback = renderFeedbackList(content.channelFeedback, "channel");

  return `
    <section class="section" data-testid="content-preferences-page">
      <h2 class="section-title">Content Display Preferences</h2>
      <p class="section-subtitle">Choose how content labeled with classification labels is displayed across recommendations.</p>

      <div class="card">${labelRows}</div>

      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Blur Sexual Themes</h4>
            <p class="row-helper">Blur thumbnails and recommendation previews that include sexual themes labels.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.content.blurSexualThemes", content.blurSexualThemes, { testid: "blur-sexual-themes" })}
          </div>
        </div>
      </div>

      <section class="section">
        <h3 class="section-title">Category Feedback</h3>
        ${categoryFeedback}
      </section>

      <section class="section">
        <h3 class="section-title">Channel Feedback</h3>
        ${channelFeedback}
      </section>
    </section>
  `;
}

function renderFeedbackList(items, type) {
  if (!items.length) {
    return `<div class="empty-state">No ${type} feedback has been given yet.</div>`;
  }

  const list = items.map((item) => `
    <div class="feedback-item">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p class="row-helper">${escapeHtml(item.feedback)} | ${escapeHtml(item.at)}</p>
      </div>
      <span class="status">${type}</span>
    </div>
  `).join("");

  return `
    <div class="feedback-list">${list}</div>
    <div><button class="btn" type="button" data-action="clear-feedback" data-feedback-type="${type}">Clear feedback</button></div>
  `;
}

function renderPrimePerksPage() {
  const prime = state.settings.primePerks;
  const conn = state.settings.connections.prime;

  return `
    <section class="section" data-testid="prime-perks-page">
      <div class="promo-card">
        <p class="kicker">Prime Perks</p>
        <h2 class="section-title">Membership-linked rewards and claims</h2>
        <p class="section-subtitle">Manage linked Prime benefits, monthly claim cycles, and campaign reminders.</p>
        <div class="control-inline">
          <span class="status ${conn.connected ? "success" : ""}">${conn.connected ? "Prime linked" : "Prime not linked"}</span>
          <button class="btn ${conn.connected ? "" : "primary"}" type="button" data-action="open-oauth" data-service="prime" data-testid="prime-link-action">${conn.connected ? "Manage Link" : "Link Prime"}</button>
        </div>
      </div>

      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Monthly Reward</h4>
            <p class="row-helper">Claim this month's featured bundle and keep your streak active.</p>
          </div>
          <div class="row-control">
            <button class="btn" type="button" data-action="claim-prime-reward">${prime.claimedThisMonth ? "Claimed" : "Claim Reward"}</button>
            <p class="row-helper">Claims are local in this fixture and reset only by full reset.</p>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Auto-claim monthly reward</h4>
            <p class="row-helper">Automatically apply the month's reward when available.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.primePerks.autoClaimMonthly", prime.autoClaimMonthly, { testid: "prime-auto-claim" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Prime reminder notifications</h4>
            <p class="row-helper">Receive monthly reminder if you have not claimed your reward.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.primePerks.showPrimeLootReminder", prime.showPrimeLootReminder, { testid: "prime-reminder-toggle" })}
          </div>
        </div>
      </div>

      <div class="card">
        ${faqAccordion("prime-monthly", "Monthly Reward Cycle", "View details about timing and eligibility windows.", prime.perksExpanded.monthly, "Rewards become available on the first of each month and remain claimable for 30 days.")}
        ${faqAccordion("prime-faq", "FAQ", "General questions about Prime linking and permissions.", prime.perksExpanded.faq, "Linking allows local mock synchronization of membership state and claim records.")}
        ${faqAccordion("prime-trial", "Trial and eligibility", "Requirements for trial accounts and promo periods.", prime.perksExpanded.trial, "Trial periods may not include all campaign benefits depending on regional settings.")}
      </div>
    </section>
  `;
}

function renderChannelVideosPage() {
  const page = state.settings.channelVideos;

  return `
    <section class="section" data-testid="channel-videos-page">
      <h2 class="section-title">Channel and Videos</h2>
      <p class="section-subtitle">Configure creator-facing defaults for archive behavior, clips, discoverability, and layout settings.</p>

      <div class="card">
        <div class="row">
          <div class="row-label">
            <label for="featured-layout">Featured content layout</label>
            <p class="row-helper">Choose default featured module layout on your channel page.</p>
          </div>
          <div class="row-control">
            <select id="featured-layout" data-setting-key="settings.channelVideos.featuredLayout" data-testid="channel-featured-layout">
              ${selectOption(page.featuredLayout, "grid", "Grid")}
              ${selectOption(page.featuredLayout, "carousel", "Carousel")}
              ${selectOption(page.featuredLayout, "spotlight", "Spotlight")}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Auto-archive broadcasts</h4>
            <p class="row-helper">Automatically keep past broadcasts for replay.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.autoArchive", page.autoArchive, { testid: "channel-auto-archive" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Enable clips</h4>
            <p class="row-helper">Allow viewers and editors to create clips from your streams.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.clipsEnabled", page.clipsEnabled, { testid: "channel-clips-enabled" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Review clips before publish</h4>
            <p class="row-helper">Available for partner-eligible channels.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.clipsReviewBeforePublish", page.clipsReviewBeforePublish, {
              disabled: !page.partnerEligible,
              testid: "channel-clips-review"
            })}
            ${!page.partnerEligible ? '<p class="row-helper">Disabled because this account is not partner-eligible in this seed.</p>' : ""}
          </div>
        </div>
      </div>

      <div class="card">
        ${faqAccordion("chan-archive", "Archive Defaults", "Retention and archive automation options.", page.sectionsExpanded.archiveDefaults, `Auto-archive is currently ${page.autoArchive ? "enabled" : "disabled"}.`) }
        ${faqAccordion("chan-clips", "Clips and Highlights", "Control clip visibility and auto-highlights.", page.sectionsExpanded.clips, "Use clip moderation and review settings to reduce accidental publishes.")}
        ${faqAccordion("chan-discoverability", "Discoverability", "Category pinning and recommendation visibility.", page.sectionsExpanded.discoverability, "Adjust category pinning to stabilize where your channel appears across discovery surfaces.")}
      </div>

      <div class="card">
        <div class="row">
          <div class="row-label">
            <h4>Category pinning</h4>
            <p class="row-helper">Pin a preferred category for discoverability surfaces.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.categoryPinning", page.categoryPinning, { testid: "channel-category-pinning" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Auto-export highlights</h4>
            <p class="row-helper">Export highlights to connected video services after stream end.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.autoHighlightExport", page.autoHighlightExport, { testid: "channel-auto-highlight-export" })}
          </div>
        </div>

        <div class="row">
          <div class="row-label">
            <h4>Mature category confirmation</h4>
            <p class="row-helper">Show confirmation prompt when selecting mature-rated categories.</p>
          </div>
          <div class="row-control">
            ${toggleButton("settings.channelVideos.matureCategoryConfirmation", page.matureCategoryConfirmation, { testid: "channel-mature-confirm" })}
          </div>
        </div>
      </div>
    </section>
  `;
}

function toggleButton(settingKey, checked, options = {}) {
  const disabled = !!options.disabled;
  const attrs = [
    `class="toggle"`,
    `role="switch"`,
    `type="button"`,
    `aria-checked="${checked ? "true" : "false"}"`,
    `data-action="toggle-setting"`,
    `data-setting-key="${settingKey}"`,
    `data-testid="${options.testid || settingKey.replace(/[^a-z0-9]+/gi, "-")}"`
  ];
  if (disabled) {
    attrs.push(`aria-disabled="true"`);
  }
  return `<button ${attrs.join(" ")} ${disabled ? "disabled" : ""}></button>`;
}

function selectOption(current, value, label) {
  return `<option value="${escapeHtml(value)}" ${current === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function faqAccordion(id, title, desc, expanded, content) {
  const chevron = ">";
  return `
    <div class="accordion">
      <button class="acc-trigger" type="button" data-action="toggle-setting" data-setting-key="${accordionPathFromId(id)}" aria-expanded="${expanded ? "true" : "false"}">
        <span class="acc-head">
          <span class="acc-title">${escapeHtml(title)}</span>
          <span class="acc-desc">${escapeHtml(desc)}</span>
        </span>
        <span class="acc-chevron">${chevron}</span>
      </button>
      <div class="acc-panel" data-panel-for="${id}" style="max-height:${expanded ? "220px" : "0px"}">
        <div class="acc-panel-content">
          <p class="row-helper">${escapeHtml(content)}</p>
        </div>
      </div>
    </div>
  `;
}

function accordionPathFromId(id) {
  if (id.startsWith("prime-")) {
    if (id === "prime-monthly") {
      return "settings.primePerks.perksExpanded.monthly";
    }
    if (id === "prime-faq") {
      return "settings.primePerks.perksExpanded.faq";
    }
    return "settings.primePerks.perksExpanded.trial";
  }
  if (id === "chan-archive") {
    return "settings.channelVideos.sectionsExpanded.archiveDefaults";
  }
  if (id === "chan-clips") {
    return "settings.channelVideos.sectionsExpanded.clips";
  }
  return "settings.channelVideos.sectionsExpanded.discoverability";
}

function initAccordionsFromState() {
  const panels = dom.page.querySelectorAll(".acc-panel");
  panels.forEach((panel) => {
    if (panel.style.maxHeight === "0px") {
      panel.style.maxHeight = "0px";
    }
  });
}

function toggleSetting(path) {
  if (!path) {
    return;
  }

  const current = getPath(state, path);
  if (typeof current === "boolean") {
    setPath(state, path, !current);
  } else {
    return;
  }

  enforceDependenciesAfterSetting(path);
  rerenderCurrentRoute();
  renderLeftRail();
  renderLiveMutationToggle();
  schedulePersist();
}

function enforceDependenciesAfterSetting(path) {
  if (path === "settings.security.allowExtraAccountsPhone" && !state.settings.security.phoneVerified) {
    state.settings.security.allowExtraAccountsPhone = false;
  }

  if (path === "settings.notifications.desktopEnabled" && !state.settings.notifications.desktopEnabled) {
    const categories = state.settings.notifications.categories;
    for (const catState of Object.values(categories)) {
      for (const itemState of Object.values(catState)) {
        itemState.desktop = false;
      }
    }
  }

  if (path === "settings.channelVideos.clipsEnabled" && !state.settings.channelVideos.clipsEnabled) {
    state.settings.channelVideos.clipsReviewBeforePublish = false;
  }

  if (path === "settings.channelVideos.clipsReviewBeforePublish" && !state.settings.channelVideos.partnerEligible) {
    state.settings.channelVideos.clipsReviewBeforePublish = false;
  }
}

function toggleNotificationItem(category, item, target) {
  const path = `settings.notifications.categories.${category}.${item}.${target}`;
  const current = getPath(state, path);
  if (typeof current !== "boolean") {
    return;
  }
  setPath(state, path, !current);

  if (target === "enabled" && !getPath(state, path)) {
    setPath(state, `settings.notifications.categories.${category}.${item}.desktop`, false);
  }

  rerenderCurrentRoute();
  schedulePersist();
}

function toggleNotificationCategory(category) {
  const path = `settings.notifications.expanded.${category}`;
  const value = !!getPath(state, path);
  setPath(state, path, !value);
  rerenderCurrentRoute();
  schedulePersist();
}

function notificationSummary(categoryKey) {
  const cat = state.settings.notifications.categories[categoryKey];
  const values = Object.values(cat);
  const enabledCount = values.filter((item) => item.enabled).length;
  if (enabledCount === 0) {
    return "All notifications are OFF";
  }
  if (enabledCount === values.length) {
    return "All notifications are ON";
  }
  return "Some notifications are ON";
}

function renderConnectionsFromState() {
  if (state.route.activeRoute === "connections") {
    rerenderCurrentRoute();
  }
}

function openAssetPickerModal(kind) {
  const presets = kind === "avatar" ? demoAvatarPresets : demoBannerPresets;
  const current = kind === "avatar" ? state.settings.profile.avatarUrl : state.settings.profile.bannerUrl;
  const title = kind === "avatar" ? "Update Profile Picture" : "Update Profile Banner";
  const testPrefix = kind === "avatar" ? "avatar" : "banner";

  const options = presets.map((src, idx) => {
    return `
      <button class="btn" type="button" data-modal-action="preset" data-modal-value="${idx}" data-testid="${testPrefix}-preset-${idx}">
        ${kind === "avatar" ? `<img class="avatar-preview" src="${src}" alt="Preset ${idx + 1}">` : `<img class="banner-preview" src="${src}" alt="Preset ${idx + 1}">`}
      </button>
    `;
  }).join("");

  openModal({
    title,
    bodyHtml: `
      <p class="row-helper">Choose a demo asset or upload your own local file.</p>
      <div class="control-inline">${options}</div>
      <div class="control-inline">
        <button class="btn" type="button" data-modal-action="upload">Upload local file</button>
        <button class="btn" type="button" data-modal-action="reset">Revert to default</button>
      </div>
      <p class="row-helper">Current ${kind}: ${escapeHtml(current.slice(0, 35))}...</p>
    `,
    actions: [
      { id: "close", label: "Close", className: "btn" }
    ],
    onAction: (actionId, modalData) => {
      if (actionId === "preset") {
        const idx = Number(modalData?.dataset?.modalValue || "0");
        if (kind === "avatar") {
          state.settings.profile.avatarUrl = presets[idx] || presets[0];
          renderTopAvatar();
          pushToast("Profile picture updated");
        } else {
          state.settings.profile.bannerUrl = presets[idx] || presets[0];
          pushToast("Profile banner updated");
        }
        rerenderCurrentRoute();
        schedulePersist();
      }
      if (actionId === "upload") {
        closeModal();
        if (kind === "avatar") {
          dom.avatarUpload.click();
        } else {
          dom.bannerUpload.click();
        }
      }
      if (actionId === "reset") {
        if (kind === "avatar") {
          state.settings.profile.avatarUrl = demoAvatarPresets[0];
          renderTopAvatar();
          pushToast("Profile picture reset");
        } else {
          state.settings.profile.bannerUrl = demoBannerPresets[0];
          pushToast("Profile banner reset");
        }
        rerenderCurrentRoute();
        schedulePersist();
      }
      if (actionId === "close") {
        closeModal();
      }
    }
  });
}

function openEmailEditModal() {
  const current = state.settings.security.email;
  openModal({
    title: "Change email address",
    bodyHtml: `
      <label for="modal-email">New email</label>
      <input id="modal-email" type="email" value="${escapeHtml(current)}" data-modal-input="email">
      <p class="row-helper">A confirmation flow is simulated locally and does not send any email.</p>
      <p class="field-error hidden" data-modal-error></p>
    `,
    actions: [
      { id: "cancel", label: "Cancel", className: "btn" },
      { id: "confirm", label: "Confirm", className: "btn primary" }
    ],
    onAction: (actionId, modalData, modalEl) => {
      if (actionId === "cancel") {
        closeModal();
        return;
      }
      if (actionId === "confirm") {
        const input = modalEl.querySelector("[data-modal-input='email']");
        const email = String(input?.value || "").trim();
        const errorEl = modalEl.querySelector("[data-modal-error]");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (errorEl) {
            errorEl.textContent = "Enter a valid email address.";
            errorEl.classList.remove("hidden");
          }
          return;
        }
        state.settings.security.email = email;
        state.settings.security.emailVerified = true;
        state.settings.security.emailRevealed = false;
        pushToast("Email updated locally");
        rerenderCurrentRoute();
        schedulePersist();
        closeModal();
      }
    }
  });
}

function openPhoneModal() {
  let step = state.settings.security.phoneNumber ? 2 : 1;
  let tempPhone = state.settings.security.phoneNumber || "";
  let code = "";

  const renderStep = () => {
    if (step === 1) {
      return `
        <label for="modal-country">Country code</label>
        <select id="modal-country" data-modal-input="country">
          <option value="+1">+1 (US)</option>
          <option value="+44">+44 (UK)</option>
          <option value="+49">+49 (DE)</option>
          <option value="+81">+81 (JP)</option>
        </select>
        <label for="modal-phone">Phone number</label>
        <input id="modal-phone" type="tel" placeholder="5551239876" data-modal-input="phone" value="${escapeHtml(tempPhone.replace(/^\+\d+\s*/, ""))}">
        <p class="row-helper">A local verification code will be generated for testing.</p>
        <p class="field-error hidden" data-modal-error></p>
      `;
    }

    if (step === 2) {
      return `
        <p class="row-helper">Enter verification code <strong>424242</strong> to complete this local flow.</p>
        <input type="text" maxlength="6" data-modal-input="code" value="${escapeHtml(code)}" placeholder="Enter code">
        <p class="field-error hidden" data-modal-error></p>
      `;
    }

    return `
      <p class="row-helper">Phone number verification complete.</p>
      <p><strong>${escapeHtml(tempPhone)}</strong></p>
    `;
  };

  const render = () => {
    openModal({
      title: "Phone number setup",
      bodyHtml: renderStep(),
      actions: step === 3
        ? [{ id: "done", label: "Done", className: "btn primary" }]
        : [{ id: "cancel", label: "Cancel", className: "btn" }, { id: "next", label: step === 1 ? "Send code" : "Verify", className: "btn primary" }],
      onAction: (actionId, _data, modalEl) => {
        if (actionId === "cancel") {
          closeModal();
          return;
        }

        if (actionId === "next" && step === 1) {
          const country = modalEl.querySelector("[data-modal-input='country']")?.value || "+1";
          const phone = String(modalEl.querySelector("[data-modal-input='phone']")?.value || "").replace(/\D+/g, "");
          const err = modalEl.querySelector("[data-modal-error]");
          if (phone.length < 7 || phone.length > 13) {
            if (err) {
              err.textContent = "Enter a valid phone number.";
              err.classList.remove("hidden");
            }
            return;
          }
          tempPhone = `${country} ${phone}`;
          step = 2;
          closeModal();
          render();
          return;
        }

        if (actionId === "next" && step === 2) {
          const entered = String(modalEl.querySelector("[data-modal-input='code']")?.value || "").trim();
          const err = modalEl.querySelector("[data-modal-error]");
          if (entered !== "424242") {
            if (err) {
              err.textContent = "Incorrect verification code. Use 424242.";
              err.classList.remove("hidden");
            }
            return;
          }
          state.settings.security.phoneNumber = tempPhone;
          state.settings.security.phoneVerified = true;
          state.settings.security.allowExtraAccountsPhone = true;
          pushToast("Phone number verified");
          schedulePersist();
          rerenderCurrentRoute();
          step = 3;
          closeModal();
          render();
          return;
        }

        if (actionId === "done") {
          closeModal();
        }
      }
    });
  };

  render();
}

function openPasswordModal() {
  openModal({
    title: "Change password",
    bodyHtml: `
      <label for="pwd-current">Current password</label>
      <input id="pwd-current" type="password" data-modal-input="current">
      <label for="pwd-new">New password</label>
      <input id="pwd-new" type="password" data-modal-input="next">
      <label for="pwd-confirm">Confirm password</label>
      <input id="pwd-confirm" type="password" data-modal-input="confirm">
      <p class="field-error hidden" data-modal-error></p>
    `,
    actions: [
      { id: "cancel", label: "Cancel", className: "btn" },
      { id: "confirm", label: "Update", className: "btn primary" }
    ],
    onAction: (actionId, _data, modalEl) => {
      if (actionId === "cancel") {
        closeModal();
        return;
      }
      const next = String(modalEl.querySelector("[data-modal-input='next']")?.value || "");
      const confirm = String(modalEl.querySelector("[data-modal-input='confirm']")?.value || "");
      const err = modalEl.querySelector("[data-modal-error]");
      if (next.length < 8) {
        if (err) {
          err.textContent = "Password must be at least 8 characters.";
          err.classList.remove("hidden");
        }
        return;
      }
      if (next !== confirm) {
        if (err) {
          err.textContent = "Password confirmation does not match.";
          err.classList.remove("hidden");
        }
        return;
      }
      state.settings.security.lastPasswordChange = "just now";
      pushToast("Password updated locally");
      rerenderCurrentRoute();
      schedulePersist();
      closeModal();
    }
  });
}

function openTwoFactorWizard() {
  let step = 1;
  let method = state.settings.security.twoFactorMethod || "authenticator";

  const renderStep = () => {
    if (step === 1) {
      return `
        <div class="wizard-steps">
          <span class="wizard-step active"></span><span class="wizard-step"></span><span class="wizard-step"></span>
        </div>
        <h4>Choose verification method</h4>
        <label><input type="radio" name="twofa-method" value="authenticator" ${method === "authenticator" ? "checked" : ""}> Authenticator app</label>
        <label><input type="radio" name="twofa-method" value="sms" ${method === "sms" ? "checked" : ""}> SMS</label>
      `;
    }
    if (step === 2) {
      return `
        <div class="wizard-steps">
          <span class="wizard-step active"></span><span class="wizard-step active"></span><span class="wizard-step"></span>
        </div>
        <h4>Enter verification code</h4>
        <p class="row-helper">Use code <strong>135790</strong> for this local setup flow.</p>
        <input type="text" data-modal-input="twofa-code" maxlength="6" placeholder="6-digit code">
        <p class="field-error hidden" data-modal-error></p>
      `;
    }
    return `
      <div class="wizard-steps">
        <span class="wizard-step active"></span><span class="wizard-step active"></span><span class="wizard-step active"></span>
      </div>
      <h4>Two-factor authentication enabled</h4>
      <p class="row-helper">Your account now requires a second verification step.</p>
    `;
  };

  const rerenderModal = () => {
    openModal({
      title: "Two-Factor Authentication",
      bodyHtml: renderStep(),
      actions: step === 3
        ? [{ id: "done", label: "Done", className: "btn primary" }]
        : [{ id: "cancel", label: "Cancel", className: "btn" }, { id: "next", label: step === 1 ? "Continue" : "Enable", className: "btn primary" }],
      onAction: (actionId, _data, modalEl) => {
        if (actionId === "cancel") {
          closeModal();
          return;
        }

        if (actionId === "next" && step === 1) {
          const selected = modalEl.querySelector("input[name='twofa-method']:checked");
          method = selected?.value || "authenticator";
          step = 2;
          closeModal();
          rerenderModal();
          return;
        }

        if (actionId === "next" && step === 2) {
          const code = String(modalEl.querySelector("[data-modal-input='twofa-code']")?.value || "").trim();
          if (code !== "135790") {
            const err = modalEl.querySelector("[data-modal-error]");
            if (err) {
              err.textContent = "Incorrect code. Use 135790.";
              err.classList.remove("hidden");
            }
            return;
          }
          state.settings.security.twoFactorEnabled = true;
          state.settings.security.twoFactorMethod = method;
          step = 3;
          rerenderCurrentRoute();
          schedulePersist();
          pushToast("2FA enabled");
          closeModal();
          rerenderModal();
          return;
        }

        if (actionId === "done") {
          closeModal();
        }
      }
    });
  };

  rerenderModal();
}

function openSignOutModal() {
  openModal({
    title: "Sign Out Everywhere",
    bodyHtml: `
      <p class="row-helper">This local action clears shell state and closes mock sessions.</p>
      <label><input type="checkbox" data-modal-input="full-reset"> Also reset durable settings and generated data</label>
    `,
    actions: [
      { id: "cancel", label: "Cancel", className: "btn" },
      { id: "confirm", label: "Confirm sign out", className: "btn danger" }
    ],
    onAction: (actionId, _data, modalEl) => {
      if (actionId === "cancel") {
        closeModal();
        return;
      }

      const fullReset = !!modalEl.querySelector("[data-modal-input='full-reset']")?.checked;

      state.shell.accountMenuOpen = false;
      state.shell.selectedAmbient = { group: "followed", id: state.data.generated.followedChannels[0]?.id || "" };
      state.shell.leftRailScrollTop = 0;
      for (const routeDef of routes) {
        state.route.scrollPositions[routeDef.id] = 0;
      }

      if (fullReset) {
        localStorage.removeItem(STORAGE_KEY);
        const fresh = buildInitialState(parseQuery(), null);
        state = fresh;
        setupAfterStateReplacement();
        pushToast("Full reset completed");
      } else {
        pushToast("Ephemeral state cleared");
      }

      renderShell();
      renderRoute(state.route.activeRoute, { restoreScroll: true });
      schedulePersist();
      closeModal();
    }
  });
}

function setupAfterStateReplacement() {
  clearTimeout(persistTimer);
  clearInterval(liveTimer);
  startLiveMutations();
}

function openOAuthModal(serviceId) {
  const def = connectionDefs.find((item) => item.id === serviceId);
  if (!def) {
    return;
  }

  let step = 1;

  const renderStep = () => {
    if (step === 1) {
      return `
        <div class="wizard-steps"><span class="wizard-step active"></span><span class="wizard-step"></span><span class="wizard-step"></span></div>
        <h4>Select account</h4>
        <select data-modal-input="account">
          <option value="main">${escapeHtml(state.settings.profile.displayName)} (main)</option>
          <option value="alt">automation_test_account</option>
        </select>
      `;
    }
    if (step === 2) {
      return `
        <div class="wizard-steps"><span class="wizard-step active"></span><span class="wizard-step active"></span><span class="wizard-step"></span></div>
        <h4>Permissions</h4>
        <label><input type="checkbox" checked disabled> Read profile metadata</label>
        <label><input type="checkbox" checked disabled> Write connected status</label>
        ${serviceId === "youtube" ? "<label><input type='checkbox' checked disabled> Export archives and clips</label>" : ""}
      `;
    }
    return `
      <div class="wizard-steps"><span class="wizard-step active"></span><span class="wizard-step active"></span><span class="wizard-step active"></span></div>
      <h4>Connected</h4>
      <p class="row-helper">${escapeHtml(def.name)} is now connected in this local fixture.</p>
    `;
  };

  const render = () => {
    openModal({
      title: `Connect ${def.name}`,
      bodyHtml: renderStep(),
      actions: step === 3
        ? [{ id: "done", label: "Done", className: "btn primary" }]
        : [{ id: "cancel", label: "Cancel", className: "btn" }, { id: "next", label: "Continue", className: "btn primary" }],
      onAction: (actionId) => {
        if (actionId === "cancel") {
          closeModal();
          return;
        }
        if (actionId === "next") {
          step += 1;
          if (step > 3) {
            step = 3;
          }
          if (step === 3) {
            state.settings.connections[serviceId].connected = true;
            state.settings.connections[serviceId].warning = false;
            state.settings.connections[serviceId].lastSynced = "just now";
            schedulePersist();
            renderConnectionsFromState();
            pushToast(`${def.name} connected`);
          }
          closeModal();
          render();
          return;
        }
        if (actionId === "done") {
          closeModal();
        }
      }
    });
  };

  render();
}

function disconnectService(serviceId) {
  const def = connectionDefs.find((item) => item.id === serviceId);
  if (!def) {
    return;
  }
  state.settings.connections[serviceId].connected = false;
  state.settings.connections[serviceId].warning = false;
  state.settings.connections[serviceId].lastSynced = "never";
  renderConnectionsFromState();
  schedulePersist();
  pushToast(`${def.name} disconnected`);
}

function handleRecommendationFeedback(id, feedback) {
  const rec = state.data.generated.recommendations.find((item) => item.id === id);
  if (!rec) {
    return;
  }

  if (feedback === "hide") {
    if (!state.settings.content.hiddenRecommendationIds.includes(id)) {
      state.settings.content.hiddenRecommendationIds.push(id);
    }
  }

  const entry = {
    id: `${id}-${feedback}`,
    label: feedback === "hide" ? `${rec.title} (${rec.channel})` : rec.title,
    feedback,
    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  state.settings.content.categoryFeedback.unshift(entry);
  state.settings.content.channelFeedback.unshift({ ...entry, label: rec.channel });
  state.settings.content.categoryFeedback = state.settings.content.categoryFeedback.slice(0, 20);
  state.settings.content.channelFeedback = state.settings.content.channelFeedback.slice(0, 20);

  renderLeftRail();
  if (state.route.activeRoute === "content-preferences") {
    rerenderCurrentRoute();
  }
  schedulePersist();
  pushToast(`Feedback saved: ${feedback}`);
}

function clearFeedback(type) {
  if (type === "category") {
    state.settings.content.categoryFeedback = [];
  } else {
    state.settings.content.channelFeedback = [];
  }
  rerenderCurrentRoute();
  schedulePersist();
  pushToast(`${type} feedback cleared`);
}

function incrementShowMore(group) {
  if (!state.shell.showMore[group]) {
    return;
  }
  state.shell.showMore[group] += 4;
  renderLeftRail();
  schedulePersist();
}

function selectAmbient(group, id) {
  state.shell.selectedAmbient = { group, id };
  renderLeftRail();
  schedulePersist();
}

function filteredAmbientItems(items) {
  return items.filter((item) => !hasHiddenTag(item.tags || []));
}

function filteredCategoriesItems(items) {
  return items.filter((item) => !hasHiddenTag(item.tags || []));
}

function filteredRecommendations() {
  return state.data.generated.recommendations.filter((item) => {
    if (state.settings.content.hiddenRecommendationIds.includes(item.id)) {
      return false;
    }
    return !hasHiddenTag(item.tags);
  });
}

function hasHiddenTag(tags) {
  return tags.some((tag) => state.settings.content.hideLabels[tag]);
}

function validateUsername(blurPhase) {
  const value = state.settings.profile.username;
  const reserved = new Set(["admin", "twitch", "support", "settings", "root", "api"]);

  let error = "";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    error = "Only letters, numbers, and underscore are allowed.";
  } else if (value.length < 4 || value.length > 25) {
    error = "Username must be between 4 and 25 characters.";
  } else if (reserved.has(value.toLowerCase())) {
    error = "This username is reserved.";
  } else if (value.toLowerCase().endsWith("000") && blurPhase) {
    error = "This username is currently unavailable.";
  }

  state.settings.profile.usernameError = error;
}

function updateUsernameErrorInline() {
  const errorEl = document.querySelector("[data-testid='username-error']");
  if (!errorEl) {
    return;
  }
  errorEl.textContent = state.settings.profile.usernameError;
}

function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) {
    return "***";
  }
  if (name.length < 3) {
    return `*${name.slice(-1)}@${domain}`;
  }
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

function resetDynamicSeed() {
  if (state.data.mode !== "dynamic") {
    pushToast("Dynamic seed reset is only available in dynamic mode.");
    return;
  }
  state.data.seed = Math.floor(Date.now() % 1000000000);
  state.data.generated = generateAmbientData(state.data.seed, state.data.mode);
  applyGeneratedDefaultsToSettings(state);
  renderShell();
  rerenderCurrentRoute();
  schedulePersist();
  pushToast(`Dynamic seed refreshed: ${state.data.seed}`);
}

function startLiveMutations() {
  clearInterval(liveTimer);
  liveTimer = window.setInterval(() => {
    if (!state.shell.liveMutationsEnabled) {
      return;
    }

    mutateViewerCounts(state.data.generated.followedChannels);
    mutateViewerCounts(state.data.generated.liveChannels);
    mutateCategoryCounts(state.data.generated.categories);

    if (Math.random() > 0.7) {
      const pick = state.data.generated.followedChannels[Math.floor(Math.random() * state.data.generated.followedChannels.length)];
      if (pick) {
        pick.live = !pick.live;
      }
    }

    state.shell.topBadges.notifications = Math.max(0, Math.min(99, state.shell.topBadges.notifications + (Math.random() > 0.55 ? 1 : -1)));
    state.shell.topBadges.bits = Math.max(1, Math.min(99, state.shell.topBadges.bits + (Math.random() > 0.7 ? 1 : 0)));

    renderTopBadges();
    renderLeftRail();
    schedulePersist();
  }, LIVE_MUTATION_INTERVAL_MS);
}

function mutateViewerCounts(list) {
  for (const item of list) {
    const delta = Math.floor(Math.random() * 1200) - 450;
    item.viewers = Math.max(0, item.viewers + delta);
  }
}

function mutateCategoryCounts(list) {
  for (const item of list) {
    const delta = Math.floor(Math.random() * 2800) - 900;
    item.viewers = Math.max(0, item.viewers + delta);
  }
}

function openModal(config) {
  closeModal();

  const actionsHtml = (config.actions || []).map((action) => {
    return `<button type="button" class="${action.className || "btn"}" data-modal-action="${action.id}">${escapeHtml(action.label)}</button>`;
  }).join("");

  dom.modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-backdrop>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(config.title)}">
        <header>
          <strong>${escapeHtml(config.title)}</strong>
          <button class="modal-close" type="button" data-modal-action="close" aria-label="Close">X</button>
        </header>
        <div class="modal-body">${config.bodyHtml || ""}</div>
        <footer>${actionsHtml}</footer>
      </div>
    </div>
  `;

  const backdrop = dom.modalRoot.querySelector("[data-modal-backdrop]");
  const modal = dom.modalRoot.querySelector(".modal");
  if (!backdrop || !modal) {
    return;
  }

  const lastFocused = document.activeElement;
  modalContext = {
    onAction: config.onAction,
    lastFocused
  };

  document.body.classList.add("modal-open");

  const firstFocusable = modal.querySelector("button, input, select, textarea, [href]");
  if (firstFocusable) {
    firstFocusable.focus();
  }

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key === "Tab") {
      trapFocus(event, modal);
    }
  });

  modal.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-modal-action]");
    if (!actionEl) {
      return;
    }
    const actionId = actionEl.dataset.modalAction;
    if (actionId === "close") {
      closeModal();
      return;
    }
    if (typeof config.onAction === "function") {
      config.onAction(actionId, actionEl, modal);
    }
  });
}

function closeModal() {
  if (!dom.modalRoot) {
    return;
  }
  dom.modalRoot.innerHTML = "";
  document.body.classList.remove("modal-open");
  if (modalContext?.lastFocused && typeof modalContext.lastFocused.focus === "function") {
    modalContext.lastFocused.focus();
  }
  modalContext = null;
}

function trapFocus(event, modal) {
  const focusables = Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
    .filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  if (!focusables.length) {
    event.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function pushToast(message) {
  const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const el = document.createElement("div");
  el.className = "toast";
  el.dataset.toastId = id;
  el.innerHTML = `<span>${escapeHtml(message)}</span><button type="button" aria-label="Dismiss">x</button>`;
  const dismissBtn = el.querySelector("button");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => removeToast(id));
  }
  dom.toastRoot.appendChild(el);
  window.setTimeout(() => removeToast(id), 4200);
}

function removeToast(id) {
  const el = dom.toastRoot.querySelector(`[data-toast-id='${id}']`);
  if (el) {
    el.remove();
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function getPath(obj, path) {
  const steps = path.split(".");
  let cursor = obj;
  for (const key of steps) {
    if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
      return undefined;
    }
    cursor = cursor[key];
  }
  return cursor;
}

function setPath(obj, path, value) {
  const steps = path.split(".");
  let cursor = obj;
  for (let i = 0; i < steps.length - 1; i += 1) {
    const key = steps[i];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[steps[steps.length - 1]] = value;
}

function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 100) / 10}K`;
  }
  return String(n);
}

function initials(text) {
  return String(text || "?")
    .split(/\s+|_|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("") || "?";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

window.addEventListener("beforeunload", () => {
  state.route.scrollPositions[state.route.activeRoute] = dom.mainScroll.scrollTop;
  state.shell.leftRailScrollTop = dom.leftRailScroll.scrollTop;
  persistNow();
});
