export const PLATFORM_KEYS = ["android", "ios", "macos"];

export const PLATFORM_LABELS = {
  android: "Android",
  ios: "iOS",
  macos: "Mac OS",
};

const STATUS_SCORES = {
  perfect: 5,
  playable: 4,
  "in-game": 3,
  ingame: 3,
  menu: 2,
  "not tested": 1,
  "not-tested": 1,
  not_tested: 1,
  boot: 1.5,
  crash: 0,
  broken: 0,
  unknown: 1,
};

export const getScoreForStatus = (status) => {
  if (!status) return STATUS_SCORES.unknown;
  const key = status.toString().trim().toLowerCase();
  return STATUS_SCORES[key] ?? STATUS_SCORES.unknown;
};

export const statusFromAverage = (average) => {
  if (average >= 4.5) return "Perfect";
  if (average >= 3.5) return "Playable";
  if (average >= 2.5) return "In-Game";
  if (average >= 1.5) return "Menu";
  if (average >= 0.5) return "Not Tested";
  return "Crash";
};

export const normalizePlatform = (value) => {
  const v = String(value || "").toLowerCase();
  if (v.includes("ios") || v.includes("iphone") || v.includes("ipad")) return "ios";
  if (v.includes("mac") || v.includes("osx")) return "macos";
  return "android";
};

const aggregateTestedSocs = (submissions) => {
  const seen = new Set();
  const aggregated = [];
  submissions.forEach((submission) => {
    (submission.tested_socs || []).forEach((soc) => {
      const key = `${soc.soc_name}|${soc.vulkan_status || ""}|${soc.opengl_status || ""}|${soc.metal_status || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        aggregated.push(soc);
      }
    });
  });
  return aggregated;
};

const buildPlatformGroup = (submissions) => {
  const ordered = [...submissions].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
  const totalScore = ordered.reduce((sum, sub) => sum + getScoreForStatus(sub.status), 0);
  const averageScore = ordered.length ? totalScore / ordered.length : 0;
  const last = ordered[ordered.length - 1] || {};
  return {
    status: statusFromAverage(averageScore),
    globalScore: Number(averageScore.toFixed(2)),
    version: last.version || "Unknown",
    notes: last.notes || "",
    tested_socs: aggregateTestedSocs(ordered),
    submissions: ordered,
    submissionCount: ordered.length,
  };
};

export const getGamePlatforms = (game) => {
  const result = { android: null, ios: null, macos: null };
  if (!game) return result;

  if (game.platforms && typeof game.platforms === "object") {
    PLATFORM_KEYS.forEach((key) => {
      const entry = game.platforms[key];
      result[key] = entry && entry.submissionCount ? entry : null;
    });
    if (result.android || result.ios || result.macos) return result;
  }

  const submissions = Array.isArray(game.submissions) ? game.submissions : [];
  const grouped = { android: [], ios: [], macos: [] };
  submissions.forEach((sub) => {
    grouped[normalizePlatform(sub.platform)].push(sub);
  });

  if (!submissions.length) {
    grouped.android.push({
      status: game.status,
      version: game.version,
      notes: game.notes,
      tested_socs: game.tested_socs || [],
      submittedBy: "community",
      createdAt: game.createdAt,
    });
  }

  PLATFORM_KEYS.forEach((key) => {
    result[key] = grouped[key].length ? buildPlatformGroup(grouped[key]) : null;
  });
  return result;
};

export const getPlatformsWithData = (game) => {
  const platforms = getGamePlatforms(game);
  return PLATFORM_KEYS.filter((key) => platforms[key]);
};
