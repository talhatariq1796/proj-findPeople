import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SmartSearchFormWithSubmit from '../components/SmartSearchFormWithSubmit';

const Home = () => {
  const { profile, profileLoading, profileError } = useOutletContext();

  return (
    <div className="w-full flex justify-center gap-7">
      <SmartSearchFormWithSubmit
        initialApiKey={profile?.api_key || ''}
        apiKeyLoading={profileLoading}
        apiKeyError={profileError}
      />
    </div>
  );
};

export default Home;
