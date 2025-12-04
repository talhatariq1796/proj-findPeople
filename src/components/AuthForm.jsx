import React, { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const AuthForm = ({ mode, onToggleMode, apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    api_key: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [includeApiKey, setIncludeApiKey] = useState(false);

  useEffect(() => {
    if (mode !== 'signup') {
      setIncludeApiKey(false);
      setFormData((prev) => ({ ...prev, api_key: '' }));
    }
  }, [mode]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => password.length >= 6;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(formData.email)) {
      return setError('Please enter a valid email');
    }
    if (!validatePassword(formData.password)) {
      return setError('Password must be at least 6 characters');
    }

    if (mode === 'signup' && (!formData.first_name || !formData.last_name)) {
      return setError('First and last name are required');
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/icp/api/auth/signup' : '/icp/api/auth/signin';

      let payload;

      if (mode === 'signup') {
        payload = {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        };

        if (includeApiKey && formData.api_key.trim()) {
          payload.api_key = formData.api_key.trim();
        }
      } else {
        payload = { email: formData.email, password: formData.password };
      }

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (data.session?.access_token) {
        localStorage.setItem('auth_token', data.session.access_token);
      }

      setSuccess(mode === 'signup' ? 'Account created! Please verify the email.' : 'Welcome back!');

      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        api_key: '',
      });
      setIncludeApiKey(false);

      if (mode === 'signin') {
        window.location.href = '/home';
      }
    } catch (err) {
      setError('Network error — please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-linear-to-br from-indigo-50 via-white to-blue-100 p-4">
      <div className="backdrop-blur-xl bg-white/60 shadow-xl border border-white/30 rounded-3xl max-w-md w-full p-8">

        {/* Header */}
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center mt-2 text-gray-600">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={onToggleMode}
            className="text-indigo-600 hover:underline font-medium"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        {/* Alerts */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="peer w-full border rounded-xl px-4 py-3 bg-white/70 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    required
                  />
                  <label className="absolute text-gray-500 text-sm left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-valid:top-2 peer-valid:text-xs">
                    First name
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="peer w-full border rounded-xl px-4 py-3 bg-white/70 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    required
                  />
                  <label className="absolute text-gray-500 text-sm left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-valid:top-2 peer-valid:text-xs">
                    Last name
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={includeApiKey}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeApiKey(checked);
                      if (!checked) {
                        setFormData((prev) => ({ ...prev, api_key: '' }));
                      }
                    }}
                  />
                  <span>Add optional API key (stored hashed)</span>
                </label>

                {includeApiKey && (
                  <div className="relative">
                    <input
                      type="password"
                      name="api_key"
                      value={formData.api_key}
                      onChange={handleInputChange}
                      className="peer w-full border rounded-xl px-4 py-3 bg-white/70 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none transition-all 
                      peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                      peer-valid:top-2 peer-valid:text-xs">
                      API key (kept hidden & hashed)
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              className="peer w-full border rounded-xl px-4 py-3 bg-white/70 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder=" "
              required
              value={formData.email}
              onChange={handleInputChange}
            />
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-valid:top-2 peer-valid:text-xs">
              Email address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="peer w-full border rounded-xl px-4 py-3 bg-white/70 focus:ring-2 focus:ring-indigo-500 outline-none transition pr-12"
              placeholder=" "
              required
              value={formData.password}
              onChange={handleInputChange}
            />
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none transition-all 
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
              peer-valid:top-2 peer-valid:text-xs">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {mode === 'signin' && (
            <div className="text-right">
              <a href="#" className="text-indigo-600 text-sm hover:underline">
                Forgot password?
              </a>
            </div>
          )}
          {/* here is the api key input */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? (mode === 'signup' ? 'Creating...' : 'Signing in...') : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
