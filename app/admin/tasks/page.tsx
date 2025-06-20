// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\admin\tasks\page.tsx
"use client"; // This makes it a Client Component
import React, { useState, useEffect, useCallback } from 'react';
import type { UserTaskSubmission } from '@/lib/types'; // PlatformTask might not be needed directly here

interface EnrichedUserTaskSubmission extends UserTaskSubmission {
  taskTitle?: string;
  taskType?: string;
}

interface ReferralStat {
  userId: number;
  username?: string | null;
  referralCount: number;
}
const AdminTasksPage = () => {
  const [submissions, setSubmissions] = useState<EnrichedUserTaskSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStat[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null); // To disable buttons for a specific row

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // setActionMessage(null); // Keep action message until next action or manual clear
    try {
      const response = await fetch('/api/admin/tasks/submissions');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setTotalEarnings(data.totalEarnings !== undefined ? data.totalEarnings : null);
      setReferralStats(data.referralStats || []);
      setTotalUsers(data.totalUsers !== undefined ? data.totalUsers : null);
    } catch (err: any) {
      setError(err.message);
      setSubmissions([]); // Clear submissions on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (submissionId: string) => {
    if (!submissionId) return;
    setProcessingId(submissionId);
    setActionMessage(`Approving ${submissionId}...`);
    try {
      const response = await fetch('/api/admin/tasks/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to approve');
      setActionMessage(result.message);
      fetchSubmissions(); // Refresh the list
    } catch (err: any) {
      setActionMessage(`Error approving ${submissionId}: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!submissionId) return;
    setProcessingId(submissionId);
    setActionMessage(`Rejecting ${submissionId}...`);
    try {
      const response = await fetch('/api/admin/tasks/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reject');
      setActionMessage(result.message);
      fetchSubmissions(); // Refresh the list
    } catch (err: any) {
      setActionMessage(`Error rejecting ${submissionId}: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <p className="text-center p-4">Loading submissions...</p>;
  if (error) return <p className="text-center text-red-500 p-4">Error loading submissions: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Task Submissions</h1>
      
      {totalUsers !== null && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-blue-700">Total Registered Users: {totalUsers}</h2>
        </div>
      )}
      {totalEarnings !== null && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-green-700">Total Earnings Paid Out: ₦{totalEarnings}</h2>
        </div>
      )}

      {referralStats.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Referral Leaders</h2>
          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">User ID</th>
                  <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">Username</th>
                  <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">Referrals</th>
                </tr>
              </thead>
              <tbody>
                {referralStats.map((stat) => (
                  <tr key={stat.userId}>
                    <td className="py-2 px-3 border-b text-sm text-gray-700">{stat.userId}</td>
                    <td className="py-2 px-3 border-b text-sm text-gray-700">{stat.username || 'N/A'}</td>
                    <td className="py-2 px-3 border-b text-sm text-gray-700">{stat.referralCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {actionMessage && (
        <div className={`mb-4 p-3 rounded ${actionMessage.toLowerCase().includes('error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {actionMessage}
        </div>
      )}
      {submissions.length === 0 ? (
        <p>No task submissions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                {['User ID', 'Task Title', 'Task Type', 'Submitted At', 'Status', 'Proof', 'Actions'].map(header => (
                  <th key={header} className="py-2 px-4 border-b text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-2 px-4 border-b">{sub.userId}</td>
                  <td className="py-2 px-4 border-b">{sub.taskTitle}</td>
                  <td className="py-2 px-4 border-b">{sub.taskType}</td>
                  <td className="py-2 px-4 border-b">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{sub.status}</td>
                  <td className="py-2 px-4 border-b">
                    {sub.proofUrl ? <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Proof</a> : 'No proof'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {sub.status === 'pending_approval' && (
                      <>
                        <button onClick={() => sub.id && handleApprove(sub.id)} className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded mr-1 disabled:opacity-50" disabled={processingId === sub.id}>Approve</button>
                        <button onClick={() => sub.id && handleReject(sub.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded disabled:opacity-50" disabled={processingId === sub.id}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;