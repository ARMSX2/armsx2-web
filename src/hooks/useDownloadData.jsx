/** @file useDownloadData.jsx
 * @description: Custom hook to retrieve versions and download URLs from GitHub */

import { useState, useEffect } from "react";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=come.nanodata.armsx2";
const GITHUB_API_URL =
  "https://api.github.com/repos/ARMSX2/ARMSX2/releases?per_page=100";
const BACKUP_APK_URL = "/ARMSX2_12_202510271921-release.apk";

const getPlatform = (release, asset) => {
  const name = (asset.name || "").toLowerCase();
  const haystack = `${asset.name || ""} ${release.tag_name || ""} ${
    release.name || ""
  }`.toLowerCase();
  if (name.endsWith(".apk")) return "android";
  if (name.endsWith(".ipa")) return "ios";
  if (
    name.endsWith(".dmg") ||
    name.endsWith(".pkg") ||
    name.endsWith(".app.zip")
  )
    return "macos";
  if (haystack.includes("macos") || haystack.includes("mac os")) return "macos";
  return null;
};

const extractVersion = (release, asset) => {
  const sources = [release.tag_name, release.name, asset.name];
  for (const source of sources) {
    const match = (source || "").match(/(\d+\.\d+(?:\.\d+)?)/);
    if (match) return match[1];
  }
  return "0";
};

const isNightlyRelease = (release) =>
  `${release.tag_name || ""} ${release.name || ""}`
    .toLowerCase()
    .includes("nightly");

const isRefreshRelease = (release, version) => {
  const haystack = `${release.tag_name || ""} ${release.name || ""}`.toLowerCase();
  if (haystack.includes("refresh")) return true;
  const major = parseInt((version || "0").split(".")[0], 10);
  return Number.isFinite(major) && major >= 2;
};

const getChannel = (release, version) => {
  if (isRefreshRelease(release, version)) return "refresh";
  if (release.prerelease || isNightlyRelease(release)) return "nightly";
  return "stable";
};

const buildEntry = (release, asset, platform, version) => ({
  id: `${release.id}_${platform}`,
  version,
  name: release.name || release.tag_name,
  url: asset.browser_download_url,
  date: release.published_at,
  isPrerelease: release.prerelease,
});

export const useDownloadData = () => {
  const [latestDownloadURL, setLatestApkUrl] = useState(null);
  const [latestVersion, setLatestVersion] = useState("0");
  const [latestVersionData, setLatestVersionData] = useState({
    version: "0",
    isPrerelease: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [allReleases, setAllReleases] = useState([]);
  const [allNightlyReleases, setAllNightlyReleases] = useState([]);
  const [allRefreshReleases, setAllRefreshReleases] = useState([]);
  const [allIosReleases, setAllIosReleases] = useState([]);
  const [allIosNightlyReleases, setAllIosNightlyReleases] = useState([]);
  const [allIosRefreshReleases, setAllIosRefreshReleases] = useState([]);
  const [allMacReleases, setAllMacReleases] = useState([]);
  const [platformVersions, setPlatformVersions] = useState({
    android: null,
    ios: null,
    macos: null,
  });
  const playURL = PLAY_URL;

  useEffect(() => {
    const fetchAllReleases = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API returned status: ${response.status}`);
        }
        const data = await response.json();
        const buckets = {
          android: { stable: [], nightly: [], refresh: [] },
          ios: { stable: [], nightly: [], refresh: [] },
          macos: [],
        };
        const androidEntries = [];
        const latest = { android: null, ios: null, macos: null };

        data.forEach((release) => {
          (release.assets || []).forEach((asset) => {
            const platform = getPlatform(release, asset);
            if (!platform) return;
            const version = extractVersion(release, asset);
            const channel = getChannel(release, version);
            const entry = buildEntry(release, asset, platform, version);
            if (!latest[platform]) latest[platform] = { version, channel };
            if (platform === "macos") {
              buckets.macos.push(entry);
              return;
            }
            buckets[platform][channel].push(entry);
            if (platform === "android") androidEntries.push(entry);
          });
        });

        setAllReleases(buckets.android.stable);
        setAllNightlyReleases(buckets.android.nightly);
        setAllRefreshReleases(buckets.android.refresh);
        setAllIosReleases(buckets.ios.stable);
        setAllIosNightlyReleases(buckets.ios.nightly);
        setAllIosRefreshReleases(buckets.ios.refresh);
        setAllMacReleases(buckets.macos);
        setPlatformVersions(latest);

        if (androidEntries.length > 0) {
          const latest = androidEntries[0];
          setLatestApkUrl(latest.url);
          setLatestVersion(latest.version);
          setLatestVersionData({
            version: latest.version,
            isPrerelease: latest.isPrerelease,
          });
        } else {
          console.warn(
            "API returned data, but no valid APK assets found. Using fallback."
          );
          setLatestApkUrl(BACKUP_APK_URL);
          setLatestVersion("v0");
          setLatestVersionData({
            version: "0",
            isPrerelease: false,
          });
        }
      } catch (error) {
        console.error("Error fetching GitHub releases:", error);
        setLatestApkUrl(BACKUP_APK_URL);
        setLatestVersion("v0 (Fallback)");
        setLatestVersionData({
          version: "0 (Fallback)",
          isPrerelease: false,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllReleases();
  }, []);

  return {
    latestDownloadURL,
    playURL,
    latestVersion,
    latestVersionData,
    allReleases,
    allNightlyReleases,
    allRefreshReleases,
    allIosReleases,
    allIosNightlyReleases,
    allIosRefreshReleases,
    allMacReleases,
    platformVersions,
    isLoading,
  };
};
