import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || `http://localhost:${PORT}`;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || `${BACKEND_ORIGIN}/auth/github/callback`;
const DATA_DIR = path.join(__dirname, "data");
const BASE_PATH = path.join(DATA_DIR, "compatibility.base.json");
const SUBMISSIONS_PATH = path.join(DATA_DIR, "compatibility-submissions.json");

const STATUS_SCORES = {
  perfect: 5,
  playable: 4,
  "in-game": 3,
  ingame: 3,
  menu: 2,
  "not tested": 1,
  "not-tested": 1,
  "not_tested": 1,
  boot: 1.5,
  crash: 0,
  broken: 0,
  unknown: 1
};

const app = express();
const allowedOrigins = [
  FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readJson = (filePath, fallback) => {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error);
    throw error;
  }
};

const getScoreForStatus = (status) => {
  if (!status) return STATUS_SCORES.unknown;
  const key = status.toString().trim().toLowerCase();
  return STATUS_SCORES[key] ?? STATUS_SCORES.unknown;
};

const statusFromAverage = (average) => {
  if (average >= 4.5) return "Perfect";
  if (average >= 3.5) return "Playable";
  if (average >= 2.5) return "In-Game";
  if (average >= 1.5) return "Menu";
  if (average >= 0.5) return "Not Tested";
  return "Crash";
};

const normalizeSoc = (soc, fallbackStatus) => {
  if (!soc) {
    return {
      soc_name: "Unknown SoC",
      vulkan_status: fallbackStatus || "Unknown",
      opengl_status: fallbackStatus || "Unknown"
    };
  }

  if (typeof soc === "string") {
    return {
      soc_name: soc,
      vulkan_status: fallbackStatus || "Unknown",
      opengl_status: fallbackStatus || "Unknown"
    };
  }

  return {
    soc_name: soc.soc_name || soc.name || "Unknown SoC",
    vulkan_status: soc.vulkan_status || soc.vulkan || fallbackStatus || "Unknown",
    opengl_status: soc.opengl_status || soc.opengl || fallbackStatus || "Unknown"
  };
};

const normalizeSubmission = (payload, defaults = {}) => {
  const submittedBy = payload.githubUser || payload.submittedBy || defaults.submittedBy || "anonymous";
  const status = payload.status || payload.compatibility || "Unknown";
  const titleId = payload["title-id"] || payload.titleId || "UNKNOWN";

  const testedSocs = Array.isArray(payload.tested_socs)
    ? payload.tested_socs.map((soc) => normalizeSoc(soc, status))
    : [];

  return {
    title: (payload.title || "Unknown Title").trim(),
    "title-id": titleId.trim(),
    region: (payload.region || "NTSC-U").trim(),
    status: status.trim(),
    notes: (payload.notes || "").trim(),
    tested_socs: testedSocs,
    version: (payload.version || "Unknown").trim(),
    submittedBy,
    createdAt: payload.createdAt || new Date().toISOString()
  };
};

const aggregateTestedSocs = (submissions) => {
  const seen = new Set();
  const aggregated = [];

  submissions.forEach((submission) => {
    (submission.tested_socs || []).forEach((soc) => {
      const key = `${soc.soc_name}|${soc.vulkan_status}|${soc.opengl_status}`;
      if (!seen.has(key)) {
        seen.add(key);
        aggregated.push(soc);
      }
    });
  });

  return aggregated;
};

const buildStatusBreakdown = (submissions) => {
  return submissions.reduce(
    (acc, sub) => {
      const normalized = (sub.status || "Unknown").toLowerCase();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    },
    {}
  );
};

// --- GitHub OAuth helpers ---
const oauthStateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

const createOAuthState = () => {
  const state = randomBytes(16).toString("hex");
  oauthStateStore.set(state, Date.now());
  return state;
};

const validateOAuthState = (state) => {
  const createdAt = oauthStateStore.get(state);
  if (!createdAt) return false;
  const isExpired = Date.now() - createdAt > STATE_TTL_MS;
  oauthStateStore.delete(state);
  return !isExpired;
};

const renderAuthResultPage = (type, payload) => {
  const safePayload = JSON.stringify(payload || {});
  const targetOrigin = FRONTEND_ORIGIN || "*";
  return `<!DOCTYPE html>
  <html>
    <body style="background:#0b0c11;color:#e3e3e3;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div>
        <h3>GitHub authentication complete.</h3>
        <p>You can close this window.</p>
      </div>
      <script>
        (function() {
          const data = { type: "${type}", payload: ${safePayload} };
          if (window.opener) {
            window.opener.postMessage(data, "${targetOrigin}");
            setTimeout(() => window.close(), 400);
          }
        })();
      </script>
    </body>
  </html>`;
};

app.get("/auth/github", (_req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).send("GitHub OAuth is not configured.");
  }
  const state = createOAuthState();
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "read:user user:email",
    state,
    allow_signup: "true"
  });
  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).send("Missing code or state.");
  }
  if (!validateOAuthState(state)) {
    return res.status(400).send("Invalid or expired state.");
  }
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).send("GitHub OAuth is not configured.");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
        state
      })
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || tokenPayload.error || !tokenPayload.access_token) {
      throw new Error(tokenPayload.error_description || "Unable to exchange GitHub code for token.");
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "armsx2-compat-app"
      }
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user profile.");
    }

    const user = await userResponse.json();
    const payload = { username: user.login, avatar: user.avatar_url };
    return res.send(renderAuthResultPage("armsx2/github-auth", payload));
  } catch (error) {
    console.error("GitHub OAuth failed:", error);
    return res
      .status(500)
      .send(
        renderAuthResultPage("armsx2/github-auth-error", {
          message: error.message || "GitHub authentication failed."
        })
      );
  }
});

const groupGamesWithAverages = (baseGames, userSubmissions) => {
  const groups = new Map();
  const append = (submission) => {
    const keyParts = [
      submission["title-id"] || submission.title,
      submission.region || "GLOBAL"
    ];
    const key = keyParts.map((part) => part.toUpperCase()).join("::");

    if (!groups.has(key)) {
      groups.set(key, {
        title: submission.title,
        "title-id": submission["title-id"],
        region: submission.region,
        submissions: []
      });
    }
    groups.get(key).submissions.push(submission);
  };

  baseGames.forEach(append);
  userSubmissions.forEach(append);

  const aggregatedGames = Array.from(groups.values()).map((group) => {
    const submissions = group.submissions.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const totalScore = submissions.reduce((sum, sub) => sum + getScoreForStatus(sub.status), 0);
    const averageScore = submissions.length ? totalScore / submissions.length : 0;
    const currentStatus = statusFromAverage(averageScore);
    const notesList = submissions.map((sub) => ({
      note: sub.notes,
      status: sub.status,
      submittedBy: sub.submittedBy,
      createdAt: sub.createdAt,
      version: sub.version
    }));

    return {
      title: group.title,
      "title-id": group["title-id"],
      region: group.region,
      status: currentStatus,
      globalScore: Number(averageScore.toFixed(2)),
      version: submissions[submissions.length - 1]?.version || "Unknown",
      notes: notesList[notesList.length - 1]?.note || "",
      notesList,
      tested_socs: aggregateTestedSocs(submissions),
      submissions,
      submissionCount: submissions.length,
      statusBreakdown: buildStatusBreakdown(submissions)
    };
  });

  return aggregatedGames.sort((a, b) => a.title.localeCompare(b.title));
};

const loadData = () => {
  const basePayload = readJson(BASE_PATH, { games: [] });
  const submissionPayload = readJson(SUBMISSIONS_PATH, { submissions: [] });

  const baseAsSubmissions = (basePayload.games || []).map((game) =>
    normalizeSubmission(game, { submittedBy: "official-seed" })
  );
  const userSubmissions = (submissionPayload.submissions || []).map((sub) =>
    normalizeSubmission(sub, { submittedBy: sub.githubUser || "community" })
  );

  return groupGamesWithAverages(baseAsSubmissions, userSubmissions);
};

app.get("/api/compatibility", (_req, res) => {
  const games = loadData();
  res.json({
    games,
    metadata: {
      totalGames: games.length,
      generatedAt: new Date().toISOString()
    }
  });
});

app.post("/api/compatibility", (req, res) => {
  const payload = req.body || {};
  const requiredFields = ["title", "status", "notes", "region", "version"];
  const titleId = payload["title-id"] || payload.titleId;

  const missing = requiredFields.filter((field) => !payload[field]);
  if (!titleId) {
    missing.push("title-id");
  }
  if (!payload.githubUser) {
    missing.push("githubUser");
  }
  const testedSocs = payload.tested_socs;
  if (!Array.isArray(testedSocs) || testedSocs.length === 0) {
    missing.push("tested_socs");
  }
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      missing
    });
  }

  const invalidSoc = testedSocs.find(
    (soc) => !soc.soc_name || !soc.vulkan_status || !soc.opengl_status
  );
  if (invalidSoc) {
    return res.status(400).json({
      error: "Each tested SoC entry must include soc_name, vulkan_status, and opengl_status."
    });
  }

  const normalizedSubmission = normalizeSubmission(payload, {
    submittedBy: payload.githubUser
  });
  const existing = readJson(SUBMISSIONS_PATH, { submissions: [] });
  existing.submissions = existing.submissions || [];
  existing.submissions.push(normalizedSubmission);

  try {
    writeJson(SUBMISSIONS_PATH, existing);
  } catch (error) {
    return res.status(500).json({ error: "Could not save submission." });
  }

  const games = loadData();
  return res.status(201).json({
    message: "Submission stored successfully.",
    games
  });
});

app.listen(PORT, () => {
  console.log(`ARMSX2 compatibility backend running on port ${PORT}`);
});
