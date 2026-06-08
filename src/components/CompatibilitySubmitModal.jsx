import React, { useEffect, useMemo, useState } from "react";
import { FaTimes, FaPlus, FaGithub, FaMicrochip, FaInfoCircle, FaAndroid, FaApple, FaLaptop } from "react-icons/fa";

const STATUS_OPTIONS = ["Perfect", "Playable", "In-Game", "Menu", "Not Tested", "Crash"];
const REGION_OPTIONS = ["NTSC-U", "NTSC-J", "PAL-E", "PAL-A", "Other"];
const SOC_DATALIST_ID = "compat-soc-options";

const PLATFORM_OPTIONS = [
  { key: "android", label: "Android", Icon: FaAndroid },
  { key: "ios", label: "iOS", Icon: FaApple },
  { key: "macos", label: "Mac OS", Icon: FaLaptop },
];

const isApplePlatform = (platform) => platform === "ios" || platform === "macos";

const defaultHardwareRow = (platform) =>
  isApplePlatform(platform)
    ? { soc_name: "", metal_status: "Playable" }
    : { soc_name: "", vulkan_status: "Playable", opengl_status: "Playable" };

const hardwarePlaceholder = (platform) => {
  if (platform === "ios") return "e.g. iPhone 15 Pro (A17)";
  if (platform === "macos") return "e.g. MacBook Air M2";
  return "e.g. Snapdragon 8 Gen 2";
};

const CompatibilitySubmitModal = ({ isOpen, onClose, onSubmitted, socOptions = [] }) => {
  const [githubUser, setGithubUser] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const apiBase = useMemo(() => {
    const envBase = import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env && import.meta.env.DEV) {
      return envBase || "http://localhost:4000";
    }
    return envBase || "https://api.armsx2.net";
  }, []);
  const apiOrigin = useMemo(() => {
    try {
      return new URL(apiBase, window.location.origin).origin;
    } catch (error) {
      return window.location.origin;
    }
  }, [apiBase]);
  const isTrustedAuthOrigin = useMemo(() => {
    return (origin) => {
      if (origin === apiOrigin) return true;
      if (!import.meta.env.DEV) return false;

      try {
        const { hostname, protocol } = new URL(origin);
        return (
          (hostname === "localhost" || hostname === "127.0.0.1") &&
          (protocol === "http:" || protocol === "https:")
        );
      } catch (error) {
        return false;
      }
    };
  }, [apiOrigin]);

  const [formData, setFormData] = useState({
    title: "",
    titleId: "",
    region: "NTSC-U",
    platform: "android",
    status: "Playable",
    version: "",
    notes: "",
    testedSocs: [defaultHardwareRow("android")]
  });

  const [submissionError, setSubmissionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apple = isApplePlatform(formData.platform);
  const hardwareHeading = apple ? "Tested Devices" : "Tested SoCs";
  const hardwareNameLabel = apple ? "Device / Chip" : "SoC Name";

  const mergedSocOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        socOptions
          .filter(Boolean)
          .map((soc) => soc.trim())
          .filter((soc) => soc.length > 0)
      )
    );
    return unique.length ? unique : ["SD 888", "Snapdragon 8 Gen 1", "Dimensity 9200"];
  }, [socOptions]);

  useEffect(() => {
    const receiveAuth = (event) => {
      if (!isTrustedAuthOrigin(event.origin)) return;
      const data = event.data || {};
      if (data.type === "armsx2/github-auth") {
        const username = data.payload?.username || "";
        if (!username) return;
        setGithubUser(username);
        setIsVerified(true);
        setIsVerifying(false);
        setVerificationError("");
      } else if (data.type === "armsx2/github-auth-error") {
        setIsVerified(false);
        setIsVerifying(false);
        setVerificationError(data.payload?.message || "GitHub authentication failed.");
      }
    };
    window.addEventListener("message", receiveAuth);
    return () => window.removeEventListener("message", receiveAuth);
  }, [isTrustedAuthOrigin]);

  if (!isOpen) return null;

  const handleGithubVerification = () => {
    setIsVerifying(true);
    setVerificationError("");
    setSuccessMessage("");
    const width = 640;
    const height = 720;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${apiBase}/auth/github`,
      "armsx2-github-auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (!popup) {
      setIsVerifying(false);
      setVerificationError("Please allow popups to sign in with GitHub.");
    }
  };

  const updateFormField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updatePlatform = (platform) => {
    setFormData((prev) => ({
      ...prev,
      platform,
      testedSocs: [defaultHardwareRow(platform)]
    }));
  };

  const updateSoc = (index, key, value) => {
    setFormData((prev) => {
      const next = [...prev.testedSocs];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, testedSocs: next };
    });
  };

  const addSocRow = () => {
    setFormData((prev) => ({
      ...prev,
      testedSocs: [...prev.testedSocs, defaultHardwareRow(prev.platform)]
    }));
  };

  const removeSocRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      testedSocs: prev.testedSocs.filter((_, idx) => idx !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      titleId: "",
      region: "NTSC-U",
      platform: "android",
      status: "Playable",
      version: "",
      notes: "",
      testedSocs: [defaultHardwareRow("android")]
    });
    setGithubUser("");
    setIsVerified(false);
    setIsVerifying(false);
    setSuccessMessage("");
    setSubmissionError("");
    setVerificationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionError("");
    setSuccessMessage("");

    if (!isVerified) {
      setSubmissionError("Please sign in with GitHub before submitting.");
      return;
    }
    if (!githubUser.trim()) {
      setSubmissionError("GitHub sign-in did not return a username. Please try again.");
      return;
    }

    const cleanedSocs = formData.testedSocs.map((soc) => {
      const base = { soc_name: soc.soc_name.trim() };
      if (apple) {
        return { ...base, metal_status: soc.metal_status };
      }
      return { ...base, vulkan_status: soc.vulkan_status, opengl_status: soc.opengl_status };
    });

    const missingSoc = cleanedSocs.find((soc) =>
      !soc.soc_name ||
      (apple ? !soc.metal_status : (!soc.vulkan_status || !soc.opengl_status))
    );
    if (missingSoc) {
      setSubmissionError(
        apple
          ? "Every tested device entry must include a name and Metal status."
          : "Every tested SoC entry must be fully filled out."
      );
      return;
    }

    const payload = {
      title: formData.title.trim(),
      "title-id": formData.titleId.trim(),
      region: formData.region.trim(),
      platform: formData.platform,
      status: formData.status.trim(),
      version: formData.version.trim(),
      notes: formData.notes.trim(),
      tested_socs: cleanedSocs,
      githubUser: githubUser.trim()
    };

    const requiredFields = ["title", "title-id", "region", "status", "version", "notes"];
    const missing = requiredFields.filter((key) => !payload[key]);
    if (missing.length) {
      setSubmissionError(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/compatibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmissionError(responseBody.error || "Unable to save your submission.");
        return;
      }

      setSuccessMessage("Thanks! Your compatibility report is live.");
      onSubmitted?.();
      setTimeout(() => {
        resetForm();
        onClose();
      }, 600);
    } catch (error) {
      setSubmissionError("Network error while sending your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0f1015] border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#13141c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <FaPlus />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Submit Compatibility Report</h2>
              <p className="text-sm text-gray-400">
                Every field is required. Sign in with GitHub to attribute your report.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">GitHub Username</label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaGithub />
                  </span>
                  <input
                    required
                    type="text"
                    value={githubUser}
                    readOnly
                    className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 pl-10 pr-3 focus:outline-none focus:border-indigo-500"
                    placeholder="Sign in with GitHub to autofill"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGithubVerification}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                    isVerified
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isVerified ? "Signed In" : isVerifying ? "Opening..." : "Sign in with GitHub"}
                </button>
              </div>
              {verificationError && <p className="text-sm text-red-400 mt-1">{verificationError}</p>}
              {isVerified && (
                <p className="text-sm text-emerald-400 mt-1">
                  Verified as @{githubUser.trim()} on GitHub.
                </p>
              )}
              {!isVerified && !verificationError && (
                <p className="text-sm text-gray-400 mt-1">
                  A new window will open from api.armsx2.net to complete OAuth.
                </p>
              )}
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-300 bg-blue-500/10 border border-blue-800 rounded-lg p-3">
              <FaInfoCircle className="mt-0.5" />
              <p>
                Status scoring: Perfect=5, Playable=4, In-Game=3, Menu=2, Not Tested=1, Crash=0.
                We average these for the global score shown on the list.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updatePlatform(key)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                    formData.platform === key
                      ? "bg-purple-600/20 text-purple-200 border-purple-500/50"
                      : "bg-[#1b1c24] text-gray-300 border-gray-700 hover:bg-[#23242e]"
                  }`}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => updateFormField("title", e.target.value)}
                className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                placeholder="Game title"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title ID</label>
              <input
                required
                type="text"
                value={formData.titleId}
                onChange={(e) => updateFormField("titleId", e.target.value)}
                className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. SLUS-21168"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Region</label>
              <select
                required
                value={formData.region}
                onChange={(e) => updateFormField("region", e.target.value)}
                className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => updateFormField("status", e.target.value)}
                className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Version Tested</label>
              <input
                required
                type="text"
                value={formData.version}
                onChange={(e) => updateFormField("version", e.target.value)}
                className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 1.0.0 Debug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Emulation Notes</label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => updateFormField("notes", e.target.value)}
              className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500 min-h-[120px]"
              placeholder="Describe performance, graphical issues, or other key observations..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-300">
                <FaMicrochip />
              </div>
              <div>
                <h3 className="text-white font-semibold">{hardwareHeading}</h3>
                <p className="text-sm text-gray-400">
                  {apple
                    ? "Add the Apple device or chip you tested on and its Metal result. Add multiple rows for different devices."
                    : "Use the dropdown to pick a SoC or type your own. Add multiple rows for different devices."}
                </p>
              </div>
            </div>

            {formData.testedSocs.map((soc, index) => (
              <div
                key={index}
                className={`grid gap-3 bg-[#13141c] border border-gray-800 rounded-lg p-3 ${
                  apple ? "md:grid-cols-2" : "md:grid-cols-3"
                }`}
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{hardwareNameLabel}</label>
                  <input
                    required
                    list={apple ? undefined : SOC_DATALIST_ID}
                    value={soc.soc_name}
                    onChange={(e) => updateSoc(index, "soc_name", e.target.value)}
                    className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                    placeholder={hardwarePlaceholder(formData.platform)}
                  />
                </div>
                {apple ? (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Metal Status</label>
                    <select
                      required
                      value={soc.metal_status}
                      onChange={(e) => updateSoc(index, "metal_status", e.target.value)}
                      className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Vulkan Status</label>
                      <select
                        required
                        value={soc.vulkan_status}
                        onChange={(e) => updateSoc(index, "vulkan_status", e.target.value)}
                        className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">OpenGL Status</label>
                      <select
                        required
                        value={soc.opengl_status}
                        onChange={(e) => updateSoc(index, "opengl_status", e.target.value)}
                        className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {formData.testedSocs.length > 1 && (
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSocRow(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      {apple ? "Remove device" : "Remove SoC"}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <datalist id={SOC_DATALIST_ID}>
              {mergedSocOptions.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>

            <button
              type="button"
              onClick={addSocRow}
              className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-100"
            >
              <span className="p-1 rounded bg-indigo-500/20 text-indigo-300">
                <FaPlus />
              </span>
              {apple ? "Add another device" : "Add another SoC"}
            </button>
          </div>

          {submissionError && (
            <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-800 rounded-lg p-3">
              {submissionError}
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-800 rounded-lg p-3">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-3 rounded-lg border border-gray-700 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Submit Compatibility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompatibilitySubmitModal;
