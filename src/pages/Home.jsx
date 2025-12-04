import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SmartSearchFormWithSubmit from '../components/SmartSearchFormWithSubmit';

const Home = () => {
  const { profile, profileLoading, profileError } = useOutletContext();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <SmartSearchFormWithSubmit
        initialApiKey={profile?.api_key || ''}
        apiKeyLoading={profileLoading}
        apiKeyError={profileError}
      />
    </div>
  );
};

export default Home;
