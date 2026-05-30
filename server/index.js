import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

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

const SMTP_HOST = process.env.SMTP_HOST || "mail.nanodata.cloud";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "ARMSX2 Contact <noreply@armsx2.net>";

const CONTACT_RECIPIENTS = {
  communication: "communication@armsx2.net",
  medievalshell: "medievalshell@armsx2.net",
  design: "design@armsx2.net",
  general: "armsx2mail@gmail.com",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mailTransporter = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

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

const ALLOWED_COMPATIBILITY_STATUSES = new Set([
  "Perfect",
  "Playable",
  "In-Game",
  "Menu",
  "Not Tested",
  "Crash"
]);
const ALLOWED_REGIONS = new Set(["NTSC-U", "NTSC-J", "PAL-E", "PAL-A", "Other"]);
const DANGEROUS_TEXT_PATTERN =
  /[<>]|&(?:lt|gt|#0*60|#x0*3c|#0*62|#x0*3e);|javascript:|srcdoc\s*=|on[a-z]+\s*=/i;

const app = express();
const allowedOrigins = [
  FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173"
];

const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
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

const validatePlainText = (errors, field, value, { maxLength, allowNewlines = false } = {}) => {
  if (typeof value !== "string") {
    errors.push(`${field} must be text.`);
    return;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    errors.push(`${field} is required.`);
    return;
  }

  if (maxLength && trimmed.length > maxLength) {
    errors.push(`${field} must be ${maxLength} characters or fewer.`);
  }

  const controlPattern = allowNewlines
    ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
    : /[\u0000-\u001f\u007f]/;
  if (controlPattern.test(trimmed)) {
    errors.push(`${field} contains unsupported control characters.`);
  }

  if (DANGEROUS_TEXT_PATTERN.test(trimmed)) {
    errors.push(`${field} must be plain text and cannot contain HTML, scripts, or event handlers.`);
  }
};

const validateSubmissionPayload = (payload, activeUser) => {
  const errors = [];
  const titleId = payload["title-id"] || payload.titleId;
  const testedSocs = payload.tested_socs;

  validatePlainText(errors, "title", payload.title, { maxLength: 140 });
  validatePlainText(errors, "title-id", titleId, { maxLength: 80 });
  validatePlainText(errors, "region", payload.region, { maxLength: 20 });
  validatePlainText(errors, "status", payload.status, { maxLength: 20 });
  validatePlainText(errors, "version", payload.version, { maxLength: 80 });
  validatePlainText(errors, "notes", payload.notes, { maxLength: 1500, allowNewlines: true });
  validatePlainText(errors, "githubUser", activeUser, { maxLength: 39 });

  if (typeof activeUser === "string" && !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(activeUser)) {
    errors.push("githubUser must be a valid GitHub username.");
  }

  if (typeof payload.region === "string" && !ALLOWED_REGIONS.has(payload.region.trim())) {
    errors.push(`region must be one of: ${Array.from(ALLOWED_REGIONS).join(", ")}.`);
  }

  if (typeof payload.status === "string" && !ALLOWED_COMPATIBILITY_STATUSES.has(payload.status.trim())) {
    errors.push(`status must be one of: ${Array.from(ALLOWED_COMPATIBILITY_STATUSES).join(", ")}.`);
  }

  if (!Array.isArray(testedSocs) || testedSocs.length === 0) {
    errors.push("tested_socs must include at least one device.");
  } else if (testedSocs.length > 8) {
    errors.push("tested_socs cannot include more than 8 devices.");
  } else {
    testedSocs.forEach((soc, index) => {
      validatePlainText(errors, `tested_socs[${index}].soc_name`, soc?.soc_name, { maxLength: 80 });
      validatePlainText(errors, `tested_socs[${index}].vulkan_status`, soc?.vulkan_status, {
        maxLength: 20
      });
      validatePlainText(errors, `tested_socs[${index}].opengl_status`, soc?.opengl_status, {
        maxLength: 20
      });

      if (
        typeof soc?.vulkan_status === "string" &&
        !ALLOWED_COMPATIBILITY_STATUSES.has(soc.vulkan_status.trim())
      ) {
        errors.push(`tested_socs[${index}].vulkan_status must be a valid compatibility status.`);
      }
      if (
        typeof soc?.opengl_status === "string" &&
        !ALLOWED_COMPATIBILITY_STATUSES.has(soc.opengl_status.trim())
      ) {
        errors.push(`tested_socs[${index}].opengl_status must be a valid compatibility status.`);
      }
    });
  }

  return errors;
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
  const submissionId =
    payload.id ||
    `sub_${(titleId || "UNKNOWN").replace(/\s+/g, "_")}_${(submittedBy || "user").replace(/\W+/g, "_")}_${Date.now()}`;

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
    id: submissionId,
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

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

const getSessionUser = (req) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies["armsx2_session"] || req.headers["x-session-token"];
  if (!token) return null;
  const data = sessions.get(token);
  if (!data) return null;
  const isExpired = Date.now() - data.createdAt > SESSION_TTL_MS;
  if (isExpired) {
    sessions.delete(token);
    return null;
  }
  return data.username;
};

const createSession = (username) => {
  const token = randomBytes(24).toString("hex");
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
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

const toScriptJson = (payload) =>
  JSON.stringify(payload || {}).replace(/[<>&\u2028\u2029]/g, (char) => {
    const replacements = {
      "<": "\\u003C",
      ">": "\\u003E",
      "&": "\\u0026",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    return replacements[char];
  });

const authPageCsp = (nonce) =>
  [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    "style-src 'unsafe-inline'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'"
  ].join("; ");

const renderAuthResultPage = (type, payload, nonce) => {
  const safePayload = toScriptJson(payload);
  const targetOrigin = FRONTEND_ORIGIN || "*";
  return `<!DOCTYPE html>
  <html>
    <body style="background:#0b0c11;color:#e3e3e3;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div>
        <h3>GitHub authentication complete.</h3>
        <p>You can close this window.</p>
      </div>
      <script nonce="${nonce}">
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
    const sessionToken = createSession(user.login);
    res.cookie("armsx2_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: BACKEND_ORIGIN.startsWith("https"),
      maxAge: SESSION_TTL_MS
    });

    const payload = { username: user.login, avatar: user.avatar_url, sessionToken };
    const nonce = randomBytes(16).toString("base64url");
    res.setHeader("Content-Security-Policy", authPageCsp(nonce));
    return res.send(renderAuthResultPage("armsx2/github-auth", payload, nonce));
  } catch (error) {
    console.error("GitHub OAuth failed:", error);
    const nonce = randomBytes(16).toString("base64url");
    res.setHeader("Content-Security-Policy", authPageCsp(nonce));
    return res
      .status(500)
      .send(
        renderAuthResultPage("armsx2/github-auth-error", {
          message: error.message || "GitHub authentication failed."
        }, nonce)
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
  const userSubmissions = (submissionPayload.submissions || []).map((sub) => {
    const normalized = normalizeSubmission(sub, { submittedBy: sub.githubUser || "community" });
    return normalized;
  });

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
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return res.status(401).json({ error: "Sign in with GitHub to submit." });
  }
  const activeUser = sessionUser;

  const missing = requiredFields.filter((field) => !payload[field]);
  if (!titleId) {
    missing.push("title-id");
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
    (soc) => !soc || !soc.soc_name || !soc.vulkan_status || !soc.opengl_status
  );
  if (invalidSoc) {
    return res.status(400).json({
      error: "Each tested SoC entry must include soc_name, vulkan_status, and opengl_status."
    });
  }

  const validationErrors = validateSubmissionPayload(payload, activeUser);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors
    });
  }

  const { githubUser: _ignoredGithubUser, submittedBy: _ignoredSubmittedBy, ...safePayload } = payload;
  const normalizedSubmission = normalizeSubmission(
    { ...safePayload, githubUser: activeUser },
    { submittedBy: activeUser }
  );
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

app.put("/api/compatibility/:id", (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return res.status(401).json({ error: "Authentication required to edit submissions." });
  }
  const activeUser = sessionUser;

  const requiredFields = ["title", "status", "notes", "region", "version"];
  const titleId = payload["title-id"] || payload.titleId;
  const missing = requiredFields.filter((field) => !payload[field]);
  if (!titleId) {
    missing.push("title-id");
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
    (soc) => !soc || !soc.soc_name || !soc.vulkan_status || !soc.opengl_status
  );
  if (invalidSoc) {
    return res.status(400).json({
      error: "Each tested SoC entry must include soc_name, vulkan_status, and opengl_status."
    });
  }

  const validationErrors = validateSubmissionPayload(payload, activeUser);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors
    });
  }

  const existing = readJson(SUBMISSIONS_PATH, { submissions: [] });
  existing.submissions = existing.submissions || [];
  const targetIndex = existing.submissions.findIndex((sub) => sub.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: "Submission not found." });
  }

  const existingSub = normalizeSubmission(existing.submissions[targetIndex], {});
  if ((existingSub.submittedBy || existingSub.githubUser) !== activeUser) {
    return res.status(403).json({ error: "You can only edit your own submissions." });
  }

  const updated = normalizeSubmission(
    {
      ...existing.submissions[targetIndex],
      ...payload,
      id,
      submittedBy: activeUser,
      githubUser: activeUser,
      updatedAt: new Date().toISOString()
    },
    { submittedBy: activeUser }
  );

  existing.submissions[targetIndex] = updated;

  try {
    writeJson(SUBMISSIONS_PATH, existing);
  } catch (error) {
    return res.status(500).json({ error: "Could not save edited submission." });
  }

  const games = loadData();
  return res.status(200).json({
    message: "Submission updated successfully.",
    games
  });
});

app.post("/api/send-email", async (req, res) => {
  const payload = req.body || {};
  const errors = [];
  validatePlainText(errors, "name", payload.name, { maxLength: 100 });
  validatePlainText(errors, "email", payload.email, { maxLength: 200 });
  validatePlainText(errors, "message", payload.message, {
    maxLength: 5000,
    allowNewlines: true,
  });

  if (typeof payload.email === "string" && !EMAIL_PATTERN.test(payload.email.trim())) {
    errors.push("email must be a valid email address.");
  }

  const recipientId = String(payload.recipient || "").trim();
  if (!Object.prototype.hasOwnProperty.call(CONTACT_RECIPIENTS, recipientId)) {
    errors.push("recipient must be a valid contact target.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  if (!mailTransporter) {
    return res.status(503).json({ error: "Email service is not configured." });
  }

  const to = CONTACT_RECIPIENTS[recipientId];
  const visitorName = payload.name.trim();
  const visitorEmail = payload.email.trim();
  const messageBody = payload.message.trim();

  try {
    await mailTransporter.sendMail({
      from: SMTP_FROM,
      to,
      replyTo: `${visitorName} <${visitorEmail}>`,
      subject: `ARMSX2 contact form: ${visitorName}`,
      text: `From: ${visitorName} <${visitorEmail}>\n\n${messageBody}`,
    });
    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return res.status(500).json({ error: "Could not send the email." });
  }
});

app.listen(PORT, () => {
  console.log(`ARMSX2 compatibility backend running on port ${PORT}`);
});
