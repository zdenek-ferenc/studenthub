"use client";

import withAuth from '../../../components/withAuth';
import CreateChallengeWizard from './CreateChallengeWizard';

function CreateChallengeView() {
  return (
      <div className="container mx-auto px-4 py-4 md:py-32">
        <div className="max-w-6xl mx-auto">
            <CreateChallengeWizard />
        </div>
      </div>
  );
}

export default withAuth(CreateChallengeView);
