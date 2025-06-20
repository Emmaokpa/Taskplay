// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\admin\platform-tasks\create\page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import type { PlatformTask } from '@/lib/types'; // Assuming PlatformTask type is defined

type TaskFormData = Omit<PlatformTask, 'id' | 'createdAt'>; // We'll omit id and createdAt as they'll be handled by backend/Firestore

const CreatePlatformTaskPage = () => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    rewardAmount: 0,
    link: '',
    taskType: '', // e.g., 'joinTelegram', 'followInstagram', 'likeCommentPost', 'visitWebsite'
    status: 'active', // Default to active
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rewardAmount' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/platform-tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task');
      }

      setMessage({ type: 'success', text: result.message || 'Task created successfully!' });
      // Optionally reset form
      setFormData({
        title: '',
        description: '',
        rewardAmount: 0,
        link: '',
        taskType: '',
        status: 'active',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Create New Platform Task</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Reward Amount (e.g., 50)
          </label>
          <input
            type="number"
            name="rewardAmount"
            id="rewardAmount"
            value={formData.rewardAmount}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
            Task Link (URL)
          </label>
          <input
            type="url"
            name="link"
            id="link"
            value={formData.link}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com/task-link"
          />
        </div>

        <div>
          <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <input
            type="text"
            name="taskType"
            id="taskType"
            value={formData.taskType}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., joinTelegram, followInstagram"
          />
           <p className="mt-1 text-xs text-gray-500">
            Examples: joinTelegram, joinWhatsApp, followInstagram, followTikTok, likeCommentPost, visitWebsite
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlatformTaskPage;
