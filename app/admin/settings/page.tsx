'use client';

import { useState } from 'react';
import { Card, Switch } from '@/components/admin/raycast';
import { fetchSystemConfig, updateSystemConfig } from '@/lib/admin/analytics-client';
import { useDataSource } from '@/hooks/useDataSource';
import { formatDate } from '@/lib/admin/format';
import { VideoCamera } from '@phosphor-icons/react';

export default function SettingsPage() {
  const { source } = useDataSource();
  const [googleMeetEnabled, setGoogleMeetEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [updatedBy, setUpdatedBy] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetchSystemConfig(source).then((config) => {
      setGoogleMeetEnabled(config.googleMeetEnabled);
      setLastUpdated(config.lastUpdated);
      setUpdatedBy(config.updatedBy);
      setLoaded(true);
    });
  }

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    setGoogleMeetEnabled(enabled);
    try {
      const config = await updateSystemConfig({ googleMeetEnabled: enabled });
      setLastUpdated(config.lastUpdated);
      setUpdatedBy(config.updatedBy);
    } catch (error) {
      setGoogleMeetEnabled(!enabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#07080a] border-b border-white/[0.06]">
        <div className="px-8 py-4">
          <h1 className="text-[#f9f9f9] font-semibold text-2xl tracking-wide">Settings</h1>
          <p className="text-[#6a6b6c] text-sm mt-1">System configuration</p>
        </div>
      </div>

      <div className="p-8 max-w-2xl">
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#55b3ff]/10 flex items-center justify-center shrink-0">
              <VideoCamera className="w-5 h-5 text-[#55b3ff]" weight="regular" />
            </div>
            <div>
              <h2 className="text-[#f9f9f9] text-lg font-semibold tracking-wide">Google Meet Integration</h2>
              <p className="text-[#9c9c9d] text-sm mt-0.5 tracking-wide">Allow users to create and manage Google Meet calls</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f9f9f9] font-medium text-sm tracking-wide">Enable Google Meet</p>
                <p className="text-[#6a6b6c] text-xs mt-1">
                  {googleMeetEnabled ? 'Users can create meetings' : 'Meeting feature is disabled'}
                </p>
              </div>
              <Switch
                checked={googleMeetEnabled}
                onChange={handleToggle}
                disabled={loading}
              />
            </div>
          </div>

          {lastUpdated && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-[#6a6b6c] text-xs tracking-wide">
                Last updated: {formatDate(lastUpdated)} {updatedBy && `by ${updatedBy}`}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}