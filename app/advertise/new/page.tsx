import React, { Suspense } from 'react';
import CreateCampaignForm from './CreateCampaignForm';

export const metadata = {
  title: "New Campaign | TaskPlay Nigeria",
  description: "Launch your mission to thousands of active users.",
};

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-white/20 font-black tracking-widest uppercase">Initializing Interface...</div>}>
      <CreateCampaignForm />
    </Suspense>
  );
}
