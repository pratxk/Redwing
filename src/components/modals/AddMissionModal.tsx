"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  MapPin, 
  DroneIcon, 
  Calendar,
  Clock,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { MissionsProvider, useMissions } from '@/features/data/MissionsContext';
import { DronesProvider, useDrones } from '@/features/data/DronesContext';
import { SitesProvider, useSites } from '@/features/data/SitesContext';

interface AddMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddMissionModalContent({ isOpen, onClose }: AddMissionModalProps) {
  const { addMission, loading } = useMissions() as {
    addMission: (mission: any) => void;
    loading: boolean;
  };
  const { drones, loading: dronesLoading } = useDrones() as { 
    drones: any[] | null;
    loading: boolean;
  };
  const { sites, loading: sitesLoading } = useSites() as { 
    sites: any[] | null;
    loading: boolean;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'INSPECTION',
    priority: '1',
    flightPattern: 'CROSSHATCH',
    plannedAltitude: '',
    plannedSpeed: '',
    overlapPercentage: '',
    scheduledAt: '',
    estimatedDuration: '',
    droneId: '',
    siteId: '',
  });

  const availableDrones = drones?.filter(drone => drone.status === 'AVAILABLE') || [];

  // Show loading state if data is still loading
  if (dronesLoading || sitesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
            <DialogDescription>Please wait while we load the available resources.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.droneId || !formData.siteId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const missionData = {
        ...formData,
        priority: parseInt(formData.priority),
        plannedAltitude: parseFloat(formData.plannedAltitude),
        plannedSpeed: parseFloat(formData.plannedSpeed),
        overlapPercentage: parseFloat(formData.overlapPercentage),
        estimatedDuration: parseFloat(formData.estimatedDuration),
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null,
      };

      await addMission(missionData);
      toast.success('Mission created successfully');
      onClose();
      setFormData({
        name: '',
        description: '',
        type: 'INSPECTION',
        priority: '1',
        flightPattern: 'CROSSHATCH',
        plannedAltitude: '',
        plannedSpeed: '',
        overlapPercentage: '',
        scheduledAt: '',
        estimatedDuration: '',
        droneId: '',
        siteId: '',
      });
    } catch (error) {
      toast.error('Failed to create mission');
      console.error('Error creating mission:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Create New Mission</span>
          </DialogTitle>
          <DialogDescription>
            Configure a new drone mission with all necessary parameters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Mission Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mission Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter mission name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Mission Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                    <SelectItem value="SECURITY_PATROL">Security Patrol</SelectItem>
                    <SelectItem value="SITE_MAPPING">Site Mapping</SelectItem>
                    <SelectItem value="SURVEY">Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the mission objectives"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                    <SelectItem value="4">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Flight Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Flight Configuration</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flightPattern">Flight Pattern</Label>
                <Select value={formData.flightPattern} onValueChange={(value) => handleInputChange('flightPattern', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CROSSHATCH">Crosshatch</SelectItem>
                    <SelectItem value="PERIMETER">Perimeter</SelectItem>
                    <SelectItem value="WAYPOINT">Waypoint</SelectItem>
                    <SelectItem value="GRID">Grid</SelectItem>
                    <SelectItem value="SPIRAL">Spiral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedAltitude">Planned Altitude (m)</Label>
                <Input
                  id="plannedAltitude"
                  type="number"
                  value={formData.plannedAltitude}
                  onChange={(e) => handleInputChange('plannedAltitude', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedSpeed">Planned Speed (m/s)</Label>
                <Input
                  id="plannedSpeed"
                  type="number"
                  value={formData.plannedSpeed}
                  onChange={(e) => handleInputChange('plannedSpeed', e.target.value)}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overlapPercentage">Overlap Percentage (%)</Label>
                <Input
                  id="overlapPercentage"
                  type="number"
                  value={formData.overlapPercentage}
                  onChange={(e) => handleInputChange('overlapPercentage', e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          {/* Resource Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <DroneIcon className="h-4 w-4" />
              <span>Resource Assignment</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="droneId">Select Drone *</Label>
                <Select value={formData.droneId} onValueChange={(value) => handleInputChange('droneId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a drone" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrones.map((drone) => (
                      <SelectItem key={drone.id} value={drone.id}>
                        <div className="flex items-center space-x-2">
                          <span>{drone.name}</span>
                          <Badge variant="secondary">{drone.batteryLevel}%</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableDrones.length === 0 && (
                  <p className="text-sm text-muted-foreground">No available drones</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteId">Select Site *</Label>
                <Select value={formData.siteId} onValueChange={(value) => handleInputChange('siteId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{site.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Resources Preview */}
            {formData.droneId && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Selected Resources</h4>
                  <div className="space-y-2">
                    {formData.droneId && (
                      <div className="flex items-center space-x-2">
                        <DroneIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          {availableDrones.find(d => d.id === formData.droneId)?.name}
                        </span>
                      </div>
                    )}
                    {formData.siteId && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {sites?.find(s => s.id === formData.siteId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Mission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AddMissionModal({ isOpen, onClose }: AddMissionModalProps) {
  return (
    <MissionsProvider>
      <DronesProvider>
        <SitesProvider>
          <AddMissionModalContent isOpen={isOpen} onClose={onClose} />
        </SitesProvider>
      </DronesProvider>
    </MissionsProvider>
  );
} 