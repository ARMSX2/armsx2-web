import { useState, useEffect } from "react";

const EXT = ".apk";
const PLAY_URL = "https://play.google.com/store/apps/details?id=xyz.aether.armsx2";
const GITHUB_API_URL = "https://api.github.com/repos/ARMSX2/ARMSX2/releases/latest";
const BACKUP_APK_URL = "/ARMSX2_12_202510271921-release.apk";

/**
 * Custom hook to retrieve the latest version and download URL from GitHub.
 * @returns {{ downloadURL: string | null, playURL: string, version: string, isLoading: boolean }}
 */
export const useDownloadData = () => {
  const [downloadURL, setApkUrl] = useState(null);
  const [version, setVersion] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [backAPK, setBackup] = useState(null) || "0";
  const playURL = PLAY_URL;

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        
        if (!response.ok) {
          console.error("Failed to fetch latest release from GitHub API.");
          setApkUrl(BACKUP_APK_URL);
          setVersion("fallback");
          return;
        }

        const data = await response.json();
        const tagName = data.tag_name || "0";
        setVersion(tagName.startsWith('v') ? tagName.substring(1) : tagName);

        const asset = data.assets?.find(asset => 
          asset.browser_download_url.endsWith(EXT)
        );

        if (asset) {
          setApkUrl(asset.browser_download_url);
        } else {
          console.warn("No APK asset found in release. Using backup.");
          setApkUrl(BACKUP_APK_URL);
          setVersion(tagName + " (backup)");
        }

      } catch (error) {
        console.error("Error fetching release data. Using backup:", error);
        setApkUrl(BACKUP_APK_URL);
        setVersion("fallback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  return { 
    downloadURL, 
    playURL,
    version, 
    isLoading 
  };
};
