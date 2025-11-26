import React, { useEffect, useMemo, useState } from "react";
import { FaTimes, FaPlus, FaGithub, FaMicrochip, FaInfoCircle } from "react-icons/fa";

const STATUS_OPTIONS = ["Perfect", "Playable", "In-Game", "Menu", "Not Tested", "Crash"];
const REGION_OPTIONS = ["NTSC-U", "NTSC-J", "PAL-E", "PAL-A", "Other"];
const SOC_DATALIST_ID = "compat-soc-options";

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

  const [formData, setFormData] = useState({
    title: "",
    titleId: "",
    region: "NTSC-U",
    status: "Playable",
    version: "",
    notes: "",
    testedSocs: [
      {
        soc_name: "",
        vulkan_status: "Playable",
        opengl_status: "Playable"
      }
    ]
  });

  const [submissionError, setSubmissionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (event.origin !== apiOrigin && !event.origin.includes("localhost")) return;
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
  }, [apiOrigin]);

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
      testedSocs: [
        ...prev.testedSocs,
        {
          soc_name: "",
          vulkan_status: "Playable",
          opengl_status: "Playable"
        }
      ]
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
      status: "Playable",
      version: "",
      notes: "",
      testedSocs: [
        {
          soc_name: "",
          vulkan_status: "Playable",
          opengl_status: "Playable"
        }
      ]
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

    const cleanedSocs = formData.testedSocs.map((soc) => ({
      soc_name: soc.soc_name.trim(),
      vulkan_status: soc.vulkan_status,
      opengl_status: soc.opengl_status
    }));

    const missingSoc = cleanedSocs.find(
      (soc) => !soc.soc_name || !soc.vulkan_status || !soc.opengl_status
    );
    if (missingSoc) {
      setSubmissionError("Every tested SoC entry must be fully filled out.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      "title-id": formData.titleId.trim(),
      region: formData.region.trim(),
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
                <h3 className="text-white font-semibold">Tested SoCs</h3>
                <p className="text-sm text-gray-400">
                  Use the dropdown to pick a SoC or type your own. Add multiple rows for different devices.
                </p>
              </div>
            </div>

            {formData.testedSocs.map((soc, index) => (
              <div
                key={index}
                className="grid md:grid-cols-3 gap-3 bg-[#13141c] border border-gray-800 rounded-lg p-3"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SoC Name</label>
                  <input
                    required
                    list={SOC_DATALIST_ID}
                    value={soc.soc_name}
                    onChange={(e) => updateSoc(index, "soc_name", e.target.value)}
                    className="w-full bg-[#1b1c24] border border-gray-700 rounded-lg text-white py-3 px-4 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Snapdragon 8 Gen 2"
                  />
                </div>
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

                {formData.testedSocs.length > 1 && (
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSocRow(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove SoC
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
              Add another SoC
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
