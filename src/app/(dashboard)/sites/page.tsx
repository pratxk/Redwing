"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map } from '@/components/shared/Map';
import { 
  Plus, 
  MapPin, 
  Target, 
  Clock, 
  CheckCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { SitesProvider, useSites } from '../../../features/data/SitesContext';
import type { Site } from '@/types/mission';

const getSuccessRate = (completed: number, total: number) => {
  return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
};

const getStatusColor = (isActive: boolean) => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

function SitesPageContent() {
  const { sites, loading: sitesLoading, error: sitesError, addSite, refetch: refetchSites } = useSites() as {
    sites: (Site & { missions?: { id: string; status: string; createdAt: string; type: string; name: string; }[] })[] | null;
    loading: boolean;
    error: any;
    addSite: (site: Site) => void;
    refetch: () => Promise<void>;
  };
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const handleMarkerClick = (id: string, type: 'drone' | 'mission' | 'site') => {
    if (type === 'site') {
      setSelectedSite(id);
    }
    toast.info(`Clicked ${type}: ${id}`);
  };

  const handleSiteAction = (siteId: string, action: string) => {
    toast.success(`Site ${action}: ${siteId}`);
  };

  // Show loading state with skeleton
  if (sitesLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sites"
          description="Manage and monitor operational sites"
        >
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (sitesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600">Error Loading Sites</h2>
          <p className="text-muted-foreground">{sitesError?.message}</p>
        </div>
      </div>
    );
  }

  // Ensure sites is not null before processing
  const sitesArray = sites || [];
  const activeSites = sitesArray.filter((site) => site.isActive);
  const inactiveSites = sitesArray.filter((site) => !site.isActive);

  // Helper functions
  const getTotalMissions = (site: typeof sitesArray[number]) => site.missions ? site.missions.length : 0;
  const getCompletedMissions = (site: typeof sitesArray[number]) => site.missions ? site.missions.filter(m => m.status === 'COMPLETED').length : 0;

  // For overall stats
  const totalMissions = sitesArray.reduce((sum, site) => sum + getTotalMissions(site), 0);
  const completedMissions = sitesArray.reduce((sum, site) => sum + getCompletedMissions(site), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sites"
        description="Manage and monitor operational sites"
      >
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">Site List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sitesArray.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeSites.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalMissions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all sites
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getSuccessRate(completedMissions, totalMissions)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* avgMissionDuration calculation removed */}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per mission
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sites</CardTitle>
                <CardDescription>
                  Currently operational sites with recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSites.map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <MapPin className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{site.name}</h4>
                          <p className="text-sm text-muted-foreground">{site.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{getTotalMissions(site)} missions</span>
                            <span>{getSuccessRate(getCompletedMissions(site), getTotalMissions(site))}% success</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Performance</CardTitle>
                <CardDescription>
                  Mission success rates and activity levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sitesArray.map((site) => (
                    <div key={site.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{site.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(site.isActive)}>
                            {site.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getSuccessRate(getCompletedMissions(site), getTotalMissions(site))}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${getSuccessRate(getCompletedMissions(site), getTotalMissions(site))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sites Map</CardTitle>
              <CardDescription>
                Geographic distribution of all operational sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Map
                height="600px"
                sites={sitesArray.map((site) => ({
                  id: site.id,
                  name: site.name,
                  latitude: site.latitude,
                  longitude: site.longitude,
                }))}
                onMarkerClick={handleMarkerClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sites</CardTitle>
              <CardDescription>
                Complete list of sites with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sitesArray.map((site) => (
                  <div key={site.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{site.name}</h3>
                          <p className="text-sm text-muted-foreground">{site.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium">Coordinates</p>
                            <p className="text-sm text-muted-foreground">
                              {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Altitude</p>
                            <p className="text-sm text-muted-foreground">{site.altitude}m</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Missions</p>
                            <p className="text-sm text-muted-foreground">{getTotalMissions(site)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Success Rate</p>
                            <p className="text-sm text-muted-foreground">
                              {getSuccessRate(getCompletedMissions(site), getTotalMissions(site))}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(site.isActive)}>
                            {site.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          Missions
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SitesPage() {
  return (
    <SitesProvider>
      <SitesPageContent />
    </SitesProvider>
  );
} 