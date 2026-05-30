/** @file useDownloadData.jsx
 * @description: Custom hook to retrieve versions and download URLs from GitHub

 * @returns {{
 * latestVersion: string,
 * latestDownloadURL: string | null,
 * allReleases: Array<object>,
 * playURL: string,
 * isLoading: boolean
 * }} */

import { useState, useEffect } from "react";

const ANDROID_EXT = ".apk";
const IOS_EXT = ".ipa";
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=come.nanodata.armsx2";
const GITHUB_API_URL = "https://api.github.com/repos/ARMSX2/ARMSX2/releases";
const BACKUP_APK_URL = "/ARMSX2_12_202510271921-release.apk";

const cleanVersionTag = (tagName) => {
  const stripped = (tagName || "0").replace(/^ios\s*v?/i, "");
  const match = stripped.match(/(\d+\.\d+\.\d+)/);
  if (match && match[1]) return match[1];
  if (stripped.startsWith("v")) return stripped.substring(1);
  return stripped;
};

const findAsset = (release, ext) =>
  release.assets?.find((asset) =>
    asset.browser_download_url.toLowerCase().endsWith(ext)
  );

const buildEntry = (release, asset, platform) => ({
  id: `${release.id}_${platform}`,
  version: cleanVersionTag(release.tag_name || "0"),
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
  const [allIosReleases, setAllIosReleases] = useState([]);
  const [allIosNightlyReleases, setAllIosNightlyReleases] = useState([]);
  const playURL = PLAY_URL;

  useEffect(() => {
    const fetchAllReleases = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API returned status: ${response.status}`);
        }
        const data = await response.json();
        const androidEntries = [];
        const iosEntries = [];
        data.forEach((release) => {
          const apk = findAsset(release, ANDROID_EXT);
          const ipa = findAsset(release, IOS_EXT);
          if (apk) androidEntries.push(buildEntry(release, apk, "android"));
          if (ipa) iosEntries.push(buildEntry(release, ipa, "ios"));
        });
        const androidStable = androidEntries.filter((r) => !r.isPrerelease);
        const androidNightly = androidEntries.filter((r) => r.isPrerelease);
        const iosStable = iosEntries.filter((r) => !r.isPrerelease);
        const iosNightly = iosEntries.filter((r) => r.isPrerelease);
        setAllReleases(androidStable);
        setAllNightlyReleases(androidNightly);
        setAllIosReleases(iosStable);
        setAllIosNightlyReleases(iosNightly);
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
    allIosReleases,
    allIosNightlyReleases,
    isLoading,
  };
};
