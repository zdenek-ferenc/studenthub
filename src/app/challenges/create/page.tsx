"use client";

import withAuth from '../../../components/withAuth';
import CreateChallengeWizard from './CreateChallengeWizard';

function CreateChallengePage() {
  return (
      <div className="container mx-auto py-12">
        <div className="max-w-6xl mx-auto">
            <CreateChallengeWizard />
        </div>
      </div>
  );
}

export default withAuth(CreateChallengePage);
