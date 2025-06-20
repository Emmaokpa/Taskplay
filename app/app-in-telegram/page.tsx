// page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import AppAuthComponent from '@/components/Auth';
import type { Task } from '@/lib/types';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}
interface WebAppUserStatus {
  isLinked: boolean;
  supabaseAuthUserId?: string;
}
type AppView =
  | 'dashboard'
  | 'create_task_form'
  | 'my_tasks_view'
  | 'available_tasks_view'
  | 'task_details_view'
  | 'auth_form'
  | 'loading'
  | 'message_display';
interface ClientTask extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export default function AppInTelegramPage() {
  const supabase = createClientComponentClient();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [userStatus, setUserStatus] = useState<WebAppUserStatus | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isTgScriptLoaded, setIsTgScriptLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('loading');

  // Task states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskTargetCount, setTaskTargetCount] = useState(10);
  const [taskReward, setTaskReward] = useState(5);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<'social_follow' | string>('social_follow');
  const [taskPlatform, setTaskPlatform] = useState('instagram');

  // Tasks data
  const [myTasks, setMyTasks] = useState<ClientTask[]>([]);
  const [loadingMyTasks, setLoadingMyTasks] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<ClientTask[]>([]);
  const [loadingAvailableTasks, setLoadingAvailableTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);

  // User balance
  const [userBalance, setUserBalance] = useState<number | null>(null);

  const checkUserStatus = useCallback(async (tgId: number) => {
    try {
      const res = await fetch('/api/telegram/get-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: tgId }),
      });
      if (!res.ok) throw new Error('Failed to fetch user status');
      const data: WebAppUserStatus = await res.json();
      setUserStatus(data);
      setCurrentView(data.isLinked ? 'dashboard' : 'auth_form');
    } catch (err: any) {
      console.error('Error checking user status:', err.message);
      setMessage('Error checking your account status.');
      setCurrentView('message_display');
    }
  }, []);

  const fetchUserBalance = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/user/balance');
      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to fetch balance:', err.error || 'Unknown error');
        setUserBalance(null); // Or keep previous balance
        return;
      }
      const data = await res.json();
      setUserBalance(data.balance);
    } catch (err: any) {
      console.error('Error fetching user balance:', err.message);
      setUserBalance(null); // Or keep previous balance
    }
  }, [session]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setMessage('Please log in to create a task.');
      setCurrentView('message_display');
      return;
    }
    setMessage('Creating task...');
    setCurrentView('message_display');

    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle || `Get ${taskTargetCount} ${taskPlatform} followers`,
          description: taskDescription,
          type: taskType,
          platform: taskPlatform,
          link: taskLink,
          targetCount: Number(taskTargetCount), // Ensure numbers are sent as numbers
          rewardPerAction: Number(taskReward),  // Ensure numbers are sent as numbers
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(`Task "${result.title || 'New Task'}" created successfully! Status: ${result.status}.`);
        setTaskTitle(''); setTaskLink(''); setTaskTargetCount(10);
        setTaskReward(5); setTaskDescription(''); setTaskPlatform('instagram'); setTaskType('social_follow');
        setCurrentView('dashboard');
      } else {
        setMessage(`Error creating task: ${result.error || 'Unknown error'}`);
        setCurrentView('create_task_form');
      }
    } catch (err: any) {
      console.error('Create task API call failed:', err.message);
      setMessage('An error occurred while creating the task.');
      setCurrentView('create_task_form');
    }
  };

  const fetchMyTasks = useCallback(async () => {
    if (!session) {
      setMessage('Please log in to view your tasks.');
      setCurrentView('message_display');
      return;
    }
    setLoadingMyTasks(true);
    setMessage('');
    try {
      const res = await fetch('/api/tasks/my-tasks');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch your tasks');
      }
      setMyTasks(await res.json());
    } catch (err: any) {
      console.error('Error fetching my tasks:', err.message);
      setMessage(`Error fetching your tasks: ${err.message}`);
    } finally {
      setLoadingMyTasks(false);
    }
  }, [session]);

  const fetchAvailableTasks = useCallback(async () => {
    if (!session) {
      setMessage('Please log in to view available tasks.');
      setCurrentView('message_display');
      return;
    }
    setLoadingAvailableTasks(true);
    setMessage('');
    try {
      const res = await fetch('/api/tasks/available');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch available tasks');
      }
      setAvailableTasks(await res.json());
    } catch (err: any) {
      console.error('Error fetching available tasks:', err.message);
      setMessage(`Error fetching available tasks: ${err.message}`);
    } finally {
      setLoadingAvailableTasks(false);
    }
  }, [session]);

  const handlePerformTaskClick = (task: ClientTask) => {
    setSelectedTask(task);
    setMessage('');
    setCurrentView('task_details_view');
  };

  const handleConfirmCompletion = useCallback(async () => {
    if (!session || !selectedTask) {
      setMessage('Authentication required or no task selected.');
      setCurrentView('message_display');
      return;
    }
    setMessage('Submitting task completion...');
    setCurrentView('message_display');

    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selectedTask.id }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(`Task "${selectedTask.title}" completion recorded! You earned ${selectedTask.rewardPerAction} points.`);
        fetchUserBalance(); // Refresh balance
        // The available tasks list will be refreshed by the useEffect when view changes to 'available_tasks_view'
        setCurrentView('available_tasks_view'); // Go back to available tasks
        setSelectedTask(null); // Clear selected task
      } else {
        setMessage(`Error submitting completion: ${result.error || 'Unknown error'}`);
        setCurrentView('task_details_view'); // Stay on details view on error
      }
    } catch (err: any) {
      console.error('Confirm completion API call failed:', err.message);
      setMessage(`An error occurred: ${err.message}`);
      setCurrentView('task_details_view'); // Stay on details view on error
    }
  }, [session, selectedTask, fetchUserBalance]);

  useEffect(() => {
    if (!isTgScriptLoaded || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.ready(); tg.expand();

    if (tg.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user as TelegramUser);
      checkUserStatus(tg.initDataUnsafe.user.id);
    } else {
      setMessage('Could not initialize Telegram user data. Please ensure you are opening this from Telegram.');
      setCurrentView('message_display');
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s && telegramUser && userStatus && !userStatus.isLinked) {
        // Avoid multiple linking attempts if message is already "Linking..."
        if (message === 'Linking your account...' || message.startsWith('Success!')) return;
        setMessage('Linking your account...');
        fetch('/api/link-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: telegramUser.id, supabaseAuthUserId: s.user.id }),
        })
          .then(r => r.json().then(json => ({ ok: r.ok, json })))
          .then(({ ok, json }) => {
            if (ok) {
              setMessage('Success! Your Telegram account is now linked.');
              setUserStatus({ isLinked: true, supabaseAuthUserId: s.user.id });
              setCurrentView('dashboard');
            } else {
              setMessage(`Error linking account: ${json.error || 'Unknown error'}`);
            }
          })
          .catch(err => {
            console.error('Link account API call failed:', err.message);
            setMessage('An error occurred while trying to link your account.');
          });
      } else if (s && userStatus?.isLinked && !['create_task_form','my_tasks_view','available_tasks_view','task_details_view'].includes(currentView)) {
        setCurrentView('dashboard');
      }
    });

    setLoading(false);
    return () => subscription?.unsubscribe();
  }, [
    isTgScriptLoaded,
    supabase,
    telegramUser,
    userStatus,
    checkUserStatus,
    currentView,
    message, // Added message to dependency array for link-account logic
  ]);

  // Sync fetches on view changes
  useEffect(() => {
    if (session && currentView === 'dashboard') fetchUserBalance();
    if (session && currentView === 'my_tasks_view') fetchMyTasks();
    if (session && currentView === 'available_tasks_view' && !selectedTask) fetchAvailableTasks();
    // Clear selected task if navigating away from details view, unless it's to message_display for completion feedback
    if (currentView !== 'task_details_view' && currentView !== 'message_display' && selectedTask) {
      setSelectedTask(null);
    }
  }, [
    currentView,
    session,
    selectedTask,
    fetchUserBalance,
    fetchMyTasks,
    fetchAvailableTasks,
  ]);

  // Loading & messaging UI
  if (
    currentView === 'loading' ||
    (loading &&
      !message &&
      !['auth_form','dashboard','create_task_form','my_tasks_view','available_tasks_view','task_details_view'].includes(currentView))
  ) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4"><p>Loading TaskPlay App...</p></div>;
  }

  if (currentView === 'message_display' && message && !message.startsWith('Success! Your Telegram account is now linked.')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div>
          <p className={message.startsWith('Error') || message.startsWith('An error occurred') ? 'text-red-600' : 'text-gray-300'}>{message}</p>
          <button
            className="mt-4 px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => {
              setMessage('');
              // Logic to determine where to go back
              if (message.includes('completion recorded')) { // After successful completion
                setCurrentView('available_tasks_view');
              } else if (message.startsWith('Error submitting completion') || (message.startsWith('An error occurred') && selectedTask)) {
                setCurrentView('task_details_view'); // Stay on task details if completion error
              } else if (userStatus?.isLinked && session) {
                setCurrentView('dashboard');
              } else if (telegramUser) {
                setCurrentView('auth_form');
              } else {
                setLoading(true); // Fallback to loading if state is unclear
              }
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => setIsTgScriptLoaded(true)}
      />
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground mb-2">
            {currentView === 'auth_form' && 'Link to TaskPlay'}
            {currentView === 'dashboard' && `Welcome, ${telegramUser?.first_name || 'User'}!`}
            {currentView === 'create_task_form' && 'Create New Task'}
            {currentView === 'my_tasks_view' && 'My Submitted Tasks'}
            {currentView === 'available_tasks_view' && 'Available Tasks'}
            {currentView === 'task_details_view' && (selectedTask ? `Task: ${selectedTask.title}` : 'Task Details')}
          </h2>
          {telegramUser && <p className="mt-2 text-center text-sm text-muted-foreground">Telegram ID: {telegramUser.id}</p>}
        </div>

        <div className="mt-8 w-full sm:mx-auto sm:max-w-lg">
          <div className="bg-card text-card-foreground p-6 sm:p-10 shadow-xl rounded-xl border border-border/50 min-h-[300px]">
            {currentView === 'auth_form' && <AppAuthComponent />}

            {currentView === 'dashboard' && (
              <div className="space-y-4">
                <p className="text-center">You are connected to TaskPlay!</p>
                {message.startsWith('Success! Your Telegram account is now linked.') && <p className="text-center text-green-600 mt-2">{message}</p>}
                {userBalance !== null && (
                  <p className="text-center text-lg font-semibold text-yellow-400">
                    Your Balance: {userBalance} Points
                  </p>
                )}
                {message.startsWith('Task') && message.includes('created successfully') && <p className="text-center text-green-600 mt-2">{message}</p>}

                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => { setMessage(''); setCurrentView('create_task_form'); }}>Create a New Task</button>
                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={() => { setMessage(''); setCurrentView('available_tasks_view'); }}>Perform Tasks</button>
                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" onClick={() => { setMessage(''); setCurrentView('my_tasks_view'); }}>View My Tasks</button>
              </div>
            )}

            {currentView === 'create_task_form' && (
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-300">Task Title (Optional)</label>
                  <input type="text" id="taskTitle" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder={`Get ${taskTargetCount} ${taskPlatform} followers`} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="taskLink" className="block text-sm font-medium text-gray-300">Link (e.g., Instagram Profile URL)</label>
                  <input type="url" id="taskLink" value={taskLink} onChange={e => setTaskLink(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taskPlatform" className="block text-sm font-medium text-gray-300">Platform</label>
                    <select id="taskPlatform" value={taskPlatform} onChange={e => setTaskPlatform(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white">
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="facebook">Facebook</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                   <div>
                    <label htmlFor="taskType" className="block text-sm font-medium text-gray-300">Task Type</label>
                    <select id="taskType" value={taskType} onChange={e => setTaskType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white">
                      <option value="social_follow">Social Follow</option>
                      {/* Add other types later */}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="taskTargetCount" className="block text-sm font-medium text-gray-300">Target Followers/Actions</label>
                  <input type="number" id="taskTargetCount" value={taskTargetCount} onChange={e => setTaskTargetCount(parseInt(e.target.value))} min="1" required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="taskReward" className="block text-sm font-medium text-gray-300">Reward per Action (Points)</label>
                  <input type="number" id="taskReward" value={taskReward} onChange={e => setTaskReward(parseInt(e.target.value))} min="1" required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-300">Description (Optional)</label>
                  <textarea id="taskDescription" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Proceed to Payment (Est. {taskTargetCount * taskReward} Points)
                </button>
                <button type="button" className="w-full text-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4" onClick={() => { setMessage(''); setCurrentView('dashboard'); }}>
                  Cancel
                </button>
              </form>
            )}

            {currentView === 'my_tasks_view' && (
              <div className="space-y-4">
                {loadingMyTasks ? <p className="text-center text-gray-400">Loading your tasks...</p> :
                  myTasks.length === 0 ? <p className="text-center text-gray-400">You haven't submitted any tasks yet.</p> :
                    <ul className="divide-y divide-gray-700">
                      {myTasks.map(task => (
                        <li key={task.id} className="py-3">
                          <h4 className="text-md font-semibold text-white">{task.title}</h4>
                          <p className="text-sm text-gray-400">Type: {task.type} - Platform: {task.platform || 'N/A'}</p>
                          <p className="text-sm text-gray-400">Link: <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{task.link}</a></p>
                          <p className="text-sm text-gray-400">Status: <span className={`font-medium ${task.status === 'active' ? 'text-green-400' : task.status === 'pending_payment' ? 'text-yellow-400' : 'text-gray-400'}`}>{task.status}</span></p>
                          <p className="text-sm text-gray-400">Progress: {task.currentCount || 0} / {task.targetCount}</p>
                          <p className="text-xs text-gray-500">Created: {new Date(task.createdAt).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                }
                <button className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={() => { setMessage(''); setCurrentView('dashboard'); }}>Back to Dashboard</button>
              </div>
            )}

            {currentView === 'available_tasks_view' && (
              <div className="space-y-4">
                {loadingAvailableTasks ? <p className="text-center text-gray-400">Loading available tasks...</p> :
                  availableTasks.length === 0 ? <p className="text-center text-gray-400">No tasks available at the moment. Check back later!</p> :
                    <ul className="divide-y divide-gray-700">
                      {availableTasks.map(task => (
                        <li key={task.id} className="py-3">
                          <h4 className="text-md font-semibold text-white">{task.title}</h4>
                          <p className="text-sm text-gray-400">Type: {task.type} - Platform: {task.platform || 'N/A'}</p>
                          <p className="text-sm text-gray-400">Reward: <span className="font-medium text-green-400">{task.rewardPerAction} Points</span></p>
                          <p className="text-sm text-gray-400">Progress: {task.currentCount || 0} / {task.targetCount}</p>
                          <button
                             onClick={() => handlePerformTaskClick(task)}
                             className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                          >
                              Perform Task
                          </button>
                        </li>
                      ))}
                    </ul>
                }
                <button className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={() => { setMessage(''); setCurrentView('dashboard'); }}>Back to Dashboard</button>
              </div>
            )}

            {currentView === 'task_details_view' && selectedTask && (
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
                 <p className="text-sm text-gray-400">Type: {selectedTask.type} - Platform: {selectedTask.platform || 'N/A'}</p>
                 <p className="text-sm text-gray-400">Reward: <span className="font-medium text-green-400">{selectedTask.rewardPerAction} Points</span></p>
                 <p className="text-sm text-gray-400">Progress: {selectedTask.currentCount || 0} / {selectedTask.targetCount}</p>
                 <p className="text-sm text-gray-400">Link: <a href={selectedTask.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{selectedTask.link}</a></p>
                 {selectedTask.description && <p className="text-sm text-gray-400">Description: {selectedTask.description}</p>}
                 <button onClick={handleConfirmCompletion} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">I have completed this task</button>
                 <button className="mt-4 w-full text-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={() => { setMessage(''); setCurrentView('available_tasks_view'); setSelectedTask(null); }}>Back to Available Tasks</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
