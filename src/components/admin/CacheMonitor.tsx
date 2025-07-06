"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Activity,
  HardDrive,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useMissions } from '@/features/data/MissionsContext';
import { useDrones } from '@/features/data/DronesContext';
import { useUsers } from '@/features/data/UsersContext';
import { useSites } from '@/features/data/SitesContext';
import { useSettings } from '@/features/data/SettingsContext';
import { useAnalytics } from '@/features/data/AnalyticsContext';

interface CacheStats {
  totalKeys: number;
  memoryUsage: number;
  hitRate: number;
  lastUpdated: Date;
  keysByType: {
    drones: number;
    missions: number;
    sites: number;
    users: number;
    analytics: number;
  };
}

export function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshCache: refreshMissionsCache } = useMissions();
  const { refreshCache: refreshDronesCache } = useDrones();
  const { refreshCache: refreshUsersCache } = useUsers();
  const { refreshCache: refreshSitesCache } = useSites();
  const { refreshCache: refreshSettingsCache } = useSettings();
  const { refreshCache: refreshAnalyticsCache } = useAnalytics();

  const getCacheStats = async () => {
    setLoading(true);
    try {
      // Simulate cache stats - in real implementation, this would call your cache service
      const mockStats: CacheStats = {
        totalKeys: 156,
        memoryUsage: 45.2,
        hitRate: 87.5,
        lastUpdated: new Date(),
        keysByType: {
          drones: 23,
          missions: 45,
          sites: 12,
          users: 34,
          analytics: 42,
        }
      };
      setStats(mockStats);
    } catch (error) {
      toast.error('Failed to fetch cache statistics');
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache? This will force a fresh data fetch.')) {
      return;
    }

    setRefreshing(true);
    try {
      // Simulate cache clearing - in real implementation, this would call your cache service
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cache cleared successfully');
      await getCacheStats();
    } catch (error) {
      toast.error('Failed to clear cache');
      console.error('Error clearing cache:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshCache = async () => {
    setRefreshing(true);
    try {
      // Simulate cache refresh - in real implementation, this would call your cache service
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cache refreshed successfully');
      await getCacheStats();
    } catch (error) {
      toast.error('Failed to refresh cache');
      console.error('Error refreshing cache:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshAllCaches = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshMissionsCache?.(),
        refreshDronesCache?.(),
        refreshUsersCache?.(),
        refreshSitesCache?.(),
        refreshSettingsCache?.(),
        refreshAnalyticsCache?.(),
      ]);
      toast.success('All caches refreshed successfully');
      await getCacheStats();
    } catch (error) {
      toast.error('Failed to refresh all caches');
      console.error('Error refreshing all caches:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getCacheStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cache Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading cache statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cache Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-muted-foreground">Failed to load cache statistics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Cache Monitor</span>
              </CardTitle>
              <CardDescription>
                Monitor Redis cache performance and manage cached data
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCache}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCache}
                disabled={refreshing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={refreshAllCaches}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh All Caches
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Keys</span>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
              <p className="text-xs text-muted-foreground">
                Cached data entries
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.memoryUsage}MB</div>
              <p className="text-xs text-muted-foreground">
                Redis memory consumption
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hit Rate</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.hitRate}%</div>
              <Progress value={stats.hitRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Cache efficiency
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm font-bold">
                {stats.lastUpdated.toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache by Data Type</CardTitle>
          <CardDescription>
            Distribution of cached data across different entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.keysByType.drones}</div>
              <p className="text-sm font-medium">Drones</p>
              <Badge variant="secondary" className="mt-1">
                {((stats.keysByType.drones / stats.totalKeys) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.keysByType.missions}</div>
              <p className="text-sm font-medium">Missions</p>
              <Badge variant="secondary" className="mt-1">
                {((stats.keysByType.missions / stats.totalKeys) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.keysByType.sites}</div>
              <p className="text-sm font-medium">Sites</p>
              <Badge variant="secondary" className="mt-1">
                {((stats.keysByType.sites / stats.totalKeys) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.keysByType.users}</div>
              <p className="text-sm font-medium">Users</p>
              <Badge variant="secondary" className="mt-1">
                {((stats.keysByType.users / stats.totalKeys) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.keysByType.analytics}</div>
              <p className="text-sm font-medium">Analytics</p>
              <Badge variant="secondary" className="mt-1">
                {((stats.keysByType.analytics / stats.totalKeys) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 