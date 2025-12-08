import { useCallback, useEffect, useState } from "react";
import { clearSession, ensureFreshToken } from "../utils/auth";

const useProfile = (apiBaseUrl) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const token = await ensureFreshToken(apiBaseUrl);

        if (signal?.aborted) return;

        if (!token) {
          clearSession();
          setProfile(null);
          setError("Session expired. Please sign in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/icp/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (response.status === 401) {
          clearSession();
          setProfile(null);
          setError("Session expired. Please sign in again.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch profile details");
        }

        const data = await response.json();
        setProfile(data?.profile || null);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);

    return () => controller.abort();
  }, [fetchProfile]);

  const refetchProfile = () => fetchProfile();

  return { profile, loading, error, refetchProfile, setProfile };
};

export default useProfile;

