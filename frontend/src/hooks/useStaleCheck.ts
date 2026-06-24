import {useEffect, useState} from "react";
import type {VersionInfo} from "../types.ts";


export function useStaleCheck(
  currentVersion: number | undefined,
  fetchVersion: () => Promise<VersionInfo>,
  enabled: boolean,
  intervalMs = 10000,
) {
  const [staleInfo, setStaleInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    if (!enabled || currentVersion === undefined) return;

    const check = async () => {
      try {
        const info = await fetchVersion();
        setStaleInfo(info.version !== currentVersion ? info : null);
      } catch (err) {
        console.error("Versions-Check fehlgeschlagen:", err);
      }
    };

    const interval = setInterval(check, intervalMs);
    return () => clearInterval(interval);
  }, [currentVersion, enabled, fetchVersion, intervalMs]);

  return [staleInfo, setStaleInfo] as const;
}