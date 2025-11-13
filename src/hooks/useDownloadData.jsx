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

const EXT = ".apk";
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=come.nanodata.armsx2";
const GITHUB_API_URL = "https://api.github.com/repos/ARMSX2/ARMSX2/releases";
const BACKUP_APK_URL = "/ARMSX2_12_202510271921-release.apk";

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
  const playURL = PLAY_URL;

  useEffect(() => {
    const fetchAllReleases = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API returned status: ${response.status}`);
        }
        const data = await response.json();
        const releasesWithApk = data
          .map((release) => {
            const tagName = release.tag_name || "0";
            let cleanVersion = "0";
            const match = tagName.match(/(\d+\.\d+\.\d+)/);
            if (match && match[1]) {
              cleanVersion = match[1];
            } else if (tagName.startsWith("v")) {
              cleanVersion = tagName.substring(1);
            } else {
              cleanVersion = tagName;
            }
            const asset = release.assets?.find((asset) =>
              asset.browser_download_url.toLowerCase().endsWith(EXT)
            );
            return {
              id: release.id,
              version: cleanVersion,
              name: release.name || tagName,
              url: asset ? asset.browser_download_url : null,
              date: release.published_at,
              isPrerelease: release.prerelease,
            };
          })
          .filter((release) => release.url !== null);
        const stableReleases = releasesWithApk.filter((r) => !r.isPrerelease);
        const nightlyReleases = releasesWithApk.filter((r) => r.isPrerelease);
        setAllReleases(stableReleases);
        setAllNightlyReleases(nightlyReleases);
        if (releasesWithApk.length > 0) {
          const latest = releasesWithApk[0];
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
    isLoading,
  };
};
