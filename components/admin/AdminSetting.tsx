// components/admin/AdminSettings.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { clientAuth } from '@/lib/auth/clientAuth';

interface AdminSettingsState {
  currentInterval: number;
  isSubmissionsOpen: boolean;
  maxSubmissionsPerInterval: number;
}

interface IntervalStat {
  interval: number;
  submissions: number;
  avgScore: number;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsState>({
    currentInterval: 1,
    isSubmissionsOpen: true,
    maxSubmissionsPerInterval: 3,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [originalSettings, setOriginalSettings] = useState<AdminSettingsState>(settings);
  const [intervalStats, setIntervalStats] = useState<IntervalStat[]>([]);
  const [intervalSubmissionCount, setIntervalSubmissionCount] = useState<number | null>(null);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await clientAuth.authFetch('/api/admin/settings');

        if (!response.ok) {
          // throw new Error('Failed to fetch admin settings');
        }

        const data = await response.json();
        setSettings(data);
        setOriginalSettings(data);
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        toast.error('Failed to load admin settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Fetch interval stats
  useEffect(() => {
    fetchIntervalStats({ skipToast: true });
  }, []);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  // Handle setting changes
  const handleSettingChange = (key: keyof AdminSettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const fetchIntervalStats = async ({ skipToast = false }: { skipToast?: boolean } = {}) => {
    try {
      setIsLoadingStats(true);
      const res = await clientAuth.authFetch('/api/admin/stats');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load interval stats');
      }

      setIntervalStats(Array.isArray(data.intervalStats) ? data.intervalStats : []);
      setIntervalSubmissionCount(
        typeof data.submissionsThisInterval === 'number' ? data.submissionsThisInterval : null
      );
    } catch (error) {
      console.error('Error fetching interval stats:', error);
      if (!skipToast) {
        toast.error(error instanceof Error ? error.message : 'Failed to load interval stats');
      }
    } finally {
      setIsLoadingStats(false);
    }
  };

  const persistSettings = async (nextSettings: AdminSettingsState) => {
    try {
      setIsSaving(true);
      const response = await clientAuth.authFetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextSettings),
      });

      const updatedSettings = await response.json();

      if (!response.ok) {
        throw new Error(updatedSettings?.error || 'Failed to save settings');
      }

      setSettings(updatedSettings);
      setOriginalSettings(updatedSettings);
      setHasChanges(false);
      toast.success('Settings saved successfully');
      fetchIntervalStats({ skipToast: true });
      return updatedSettings;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      await persistSettings(settings);
    } catch {
      // Error already handled in persistSettings
    }
  };

  const handleAdvanceInterval = async () => {
    if (isSaving) return;
    const previousSettings = settings;
    const nextSettings = { ...settings, currentInterval: settings.currentInterval + 1 };
    setSettings(nextSettings); // Optimistic update so UI reflects change immediately

    try {
      await persistSettings(nextSettings);
    } catch (error) {
      // Revert optimistic update on failure
      setSettings(previousSettings);
    }
  };

  // Reset changes
  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="admin-card rounded-xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoadingStats && (
        <div className="text-sm text-gray-500">Refreshing interval stats…</div>
      )}

      {/* Competition Settings */}
      <div className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">Competition Settings</h2>
            <p className="text-gray-600 text-sm">Manage global competition parameters and intervals</p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Interval */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Current Interval
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={settings.currentInterval}
                onChange={(e) => handleSettingChange('currentInterval', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Current competition interval. Changing this will affect all new submissions.
            </p>
          </div>

          {/* Max Submissions Per Interval */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Max Submissions Per Interval
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxSubmissionsPerInterval}
                onChange={(e) => handleSettingChange('maxSubmissionsPerInterval', parseInt(e.target.value) || 3)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Maximum number of submissions each participant can make per interval.
            </p>
          </div>
        </div>

        {/* Submissions Status Toggle */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Submissions Status</h3>
              <p className="text-sm text-gray-600">Control whether participants can submit new entries</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isSubmissionsOpen}
                  onChange={(e) => handleSettingChange('isSubmissionsOpen', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-medium ${settings.isSubmissionsOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.isSubmissionsOpen ? 'Open' : 'Closed'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {!settings.isSubmissionsOpen && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-amber-800 font-medium text-sm">Submissions Currently Closed</h4>
                <p className="text-amber-700 text-xs mt-1">
                  Participants cannot submit new entries while submissions are closed. Existing submissions remain accessible.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interval Management */}
      <div className="admin-card rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">Interval Management</h2>
          <p className="text-gray-600 text-sm">Advanced interval controls and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Current Interval Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{settings.currentInterval}</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Current Interval</h3>
                <p className="text-blue-700 text-sm">Active submission period</p>
              </div>
            </div>
          </div>

          {/* Submissions Count */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-900">Total Submissions</h3>
                <p className="text-green-700 text-sm">
                  {isLoadingStats
                    ? 'Loading...'
                    : `${intervalSubmissionCount ?? 0} submission${(intervalSubmissionCount ?? 0) === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Next Interval Action */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-center">
              <button
                onClick={() => {
                  if (isSaving) return;
                  if (confirm('Are you sure you want to advance to the next interval? This action cannot be undone.')) {
                    handleAdvanceInterval();
                  }
                }}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Advance to Interval {settings.currentInterval + 1}
              </button>
              <p className="text-purple-700 text-xs mt-2">
                Start new submission period
              </p>
            </div>
          </div>
        </div>

        {/* Interval History */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Recent Intervals</h3>
          <div className="space-y-2">
            {Array.from({ length: Math.min(5, settings.currentInterval) }, (_, i) => {
              const intervalNum = settings.currentInterval - i;
              const isCurrent = intervalNum === settings.currentInterval;
              const submissionsForInterval =
                intervalStats.find(stat => stat.interval === intervalNum)?.submissions ??
                (isCurrent && intervalSubmissionCount !== null ? intervalSubmissionCount : 0);
              return (
                <div
                  key={intervalNum}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {intervalNum}
                    </div>
                    <div>
                      <span className="font-medium">Interval {intervalNum}</span>
                      {isCurrent && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Current</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isLoadingStats
                      ? 'Loading...'
                      : `${submissionsForInterval} submission${submissionsForInterval === 1 ? '' : 's'}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="admin-card rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">System Information</h2>
          <p className="text-gray-600 text-sm">Platform status and configuration details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Platform Version</span>
              <span className="text-sm text-gray-900">v2.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Database Status</span>
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Last Settings Update</span>
              <span className="text-sm text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Active Users</span>
              <span className="text-sm text-gray-900">--</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Total Submissions</span>
              <span className="text-sm text-gray-900">--</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Storage Used</span>
              <span className="text-sm text-gray-900">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
