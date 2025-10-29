import { useState, useEffect } from "react";

const EXT = ".apk";
const PLAY_URL = "https://play.google.com/store/apps/details?id=xyz.aether.armsx2";
const GITHUB_API_URL = "https://api.github.com/repos/ARMSX2/ARMSX2/releases";
const BACKUP_APK_URL = "/ARMSX2_12_202510271921-release.apk";

/**
 * Custom hook to retrieve versions and download URLs from GitHub.
 * @returns {{ 
 * latestVersion: string, 
 * latestDownloadURL: string | null, 
 * allReleases: Array<object>,
 * playURL: string, 
 * isLoading: boolean 
 * }}
 */
export const useDownloadData = () => {
  const [latestDownloadURL, setLatestApkUrl] = useState(null);
  const [latestVersion, setLatestVersion] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [allReleases, setAllReleases] = useState([]);
  const playURL = PLAY_URL;

  useEffect(() => {
    const fetchAllReleases = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API returned status: ${response.status}`);
        }
        const data = await response.json();
        const releasesWithApk = data.map(release => {
          const tagName = release.tag_name || "0";
          const version = tagName.startsWith('v') ? tagName.substring(1) : tagName;
          const asset = release.assets?.find(asset =>
            asset.browser_download_url.toLowerCase().endsWith(EXT)
          );
          return {
            id: release.id,
            version: version,
            name: release.name || tagName,
            url: asset ? asset.browser_download_url : null,
            date: release.published_at,
          };
        }).filter(release => release.url !== null);
        setAllReleases(releasesWithApk);
        if (releasesWithApk.length > 0) {
          setLatestApkUrl(releasesWithApk[0].url);
          setLatestVersion(releasesWithApk[0].version);
        } else {
          console.warn("API returned data, but no valid APK assets found. Using fallback.");
          setLatestApkUrl(BACKUP_APK_URL);
          setLatestVersion("v0");
        }
      } catch (error) {
        console.error("Error fetching GitHub releases:", error);
        setLatestApkUrl(BACKUP_APK_URL);
        setLatestVersion("v0 (Fallback)");
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
    allReleases,
    isLoading
  };
};
