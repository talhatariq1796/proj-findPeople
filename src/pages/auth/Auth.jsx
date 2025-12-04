import React, { useState } from 'react';
import AuthForm from '../../components/AuthForm';

const Auth = ({ 
  apiBaseUrl,
  initialMode
}) => {
  const resolvedApiBaseUrl = apiBaseUrl || import.meta.env.VITE_BACKEND_URL || 'https://g-scraper-backend-6egw.vercel.app';
  const [mode, setMode] = useState(initialMode || 'signin');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'signin' ? 'signup' : 'signin'));
  };

  return (
    <AuthForm
      mode={mode}
      onToggleMode={toggleMode}
      apiBaseUrl={resolvedApiBaseUrl}
    />
  );
};

export default Auth;
