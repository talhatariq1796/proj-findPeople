import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

const Profile = () => {
  const {
    profile,
    profileLoading,
    profileError,
    refetchProfile,
    setProfile,
    apiBaseUrl,
  } = useOutletContext();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    api_key: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      api_key: "",
    });
  }, [profile]);

  const fullNamePreview = useMemo(() => {
    const first = formData.first_name?.trim() || "";
    const last = formData.last_name?.trim() || "";
    return `${first} ${last}`.trim();
  }, [formData.first_name, formData.last_name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFormSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setFormError("Missing session. Please sign in again.");
      return;
    }

    const payload = {};

    if (formData.first_name.trim() !== (profile?.first_name || "")) {
      payload.first_name = formData.first_name.trim();
    }
    if (formData.last_name.trim() !== (profile?.last_name || "")) {
      payload.last_name = formData.last_name.trim();
    }
    if (formData.api_key.trim()) {
      payload.api_key = formData.api_key.trim();
    }

    if (Object.keys(payload).length === 0) {
      setFormError("Update at least one field.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/icp/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json().catch(() => ({}));
      const updatedProfile = data.profile
        ? data.profile
        : {
            ...profile,
            ...payload,
            full_name: `${payload.first_name || profile?.first_name || ""} ${payload.last_name || profile?.last_name || ""}`.trim(),
          };

      setProfile(updatedProfile);
      await refetchProfile();

      setFormData((prev) => ({ ...prev, api_key: "" }));
      setFormSuccess("Profile updated successfully.");
    } catch (err) {
      setFormError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
          <p className="text-sm text-gray-500">Manage your profile information.</p>
        </div>
        <button
          type="button"
          disabled={profileLoading}
          onClick={refetchProfile}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {profileLoading ? (
        <p className="text-sm text-gray-500">Loading profile...</p>
      ) : profileError ? (
        <p className="text-sm text-red-600">{profileError}</p>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name (preview)</label>
            <input
              type="text"
              readOnly
              value={fullNamePreview || profile?.full_name || ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API key (hashed, optional)
            </label>
            <input
              type="password"
              name="api_key"
              value={formData.api_key}
              onChange={handleInputChange}
              placeholder="Enter new API key to replace existing"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              API key stays hidden. Leave blank to keep your current key.
            </p>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 break-all">
                {profile?.email || "Not provided"}
              </dd>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Current API key (hashed)</dt>
              <dd className="mt-1 text-sm text-gray-900 break-all">
                {profile?.api_key ? (
                  <input
                    type="password"
                    readOnly
                    value={profile.api_key}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
          </dl>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}
          {formSuccess && (
            <p className="text-sm text-green-600">{formSuccess}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;

