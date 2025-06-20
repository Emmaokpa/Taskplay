"use client"; // This directive makes it a Client Component

import React, { useState } from 'react';
import type { PlatformTask } from '@/lib/types';

interface TaskCardProps {
  task: PlatformTask;
}

const TaskCardClient: React.FC<TaskCardProps> = ({ task }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ensure submissionStatus is initialized to null (JavaScript primitive)
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null); 
  const [taskLinkOpened, setTaskLinkOpened] = useState(false);

  const handlePerformTask = () => {
    console.log('[TaskCardClient] handlePerformTask called. Current submissionStatus:', submissionStatus);
    window.open(task.link, '_blank');
    setTaskLinkOpened(true);
    setSubmissionStatus(null); // Reset status if they re-click
    console.log('[TaskCardClient] handlePerformTask: submissionStatus explicitly set to null. taskLinkOpened set to true.');
  };

  const handleCompleteTask = async () => {
    if (!task.id) return;
    setIsSubmitting(true);
    setSubmissionStatus('Submitting...');

    let userId: string | number | undefined;
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    }

    if (!userId) {
      // For local development, if Telegram user ID isn't available,
      // use your real, existing user ID for testing.
      if (process.env.NODE_ENV === 'development' && !(typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp)) {
        console.warn("Telegram User ID not found, using real ID '6734895836' for development testing.");
        userId = '6734895836'; 
      } else {
        setSubmissionStatus('Could not identify Telegram user. Please ensure you are running this in Telegram.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = { platformTaskId: task.id, userId: String(userId) };
      console.log('Submitting task with payload:', payload); // Add this log

      // Use relative URL for standard operation.
      // For debugging a 404, you might temporarily use 'http://localhost:3000/api/tasks/submit'
      const response = await fetch('/api/tasks/submit', {
        method: 'POST', // Ensure method is specified in the options object
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus(result.message || 'Task submitted successfully!');
      } else {
        setSubmissionStatus(result.error || 'Failed to submit task.');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setSubmissionStatus('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || (submissionStatus !== null && submissionStatus.includes('successfully'));
  // Log state during every render to see what determines button disabled status
  console.log(`[TaskCardClient Render] task.id=${task.id}, taskLinkOpened=${taskLinkOpened}, isSubmitting=${isSubmitting}, submissionStatus=${JSON.stringify(submissionStatus)}, calculatedButtonDisabled=${isButtonDisabled}`);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        <p className="text-md font-bold text-green-600 mb-4">Reward: ₦{task.rewardAmount}</p>
      </div>
      <div className="mt-auto">
        {!taskLinkOpened ? (
          <button
            onClick={handlePerformTask}
            className="w-full bg-admin-sidebar hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-150 ease-in-out"
          >
            View & Complete Task
          </button>
        ) : (
          <button
            onClick={handleCompleteTask}
            disabled={isButtonDisabled}
            className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors duration-150 ease-in-out ${
              submissionStatus?.includes('successfully')
                ? 'bg-green-500 text-white cursor-not-allowed'
                : isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-admin-sidebar hover:bg-gray-800 text-gray-200'
            }`}
          >
            {isSubmitting ? 'Submitting...' : submissionStatus?.includes('successfully') ? 'Submitted!' : "I've Completed It"}
          </button>
        )}
{submissionStatus && <p className="text-xs text-center mt-2" aria-live="polite">{submissionStatus}</p>}
      </div>
    </div>
  );
};

export default TaskCardClient;