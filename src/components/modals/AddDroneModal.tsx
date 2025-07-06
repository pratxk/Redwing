"use client";

import { useState } from "react";
import * as changeCase from "change-case";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DroneIcon,
  Settings,
  Battery,
  Camera,
  Wifi,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { DronesProvider, useDrones } from "@/features/data/DronesContext";

interface AddDroneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddDroneModalContent({ isOpen, onClose }: AddDroneModalProps) {
  const { addDrone, loading } = useDrones() as {
    addDrone: (drone: any) => void;
    loading: boolean;
  };

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serialNumber: "",
    maxFlightTime: "",
    maxSpeed: "",
    maxAltitude: "",
    cameraResolution: "",
    sensorTypes: [] as string[],
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.model || !formData.serialNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const droneData = {
        ...formData,
        maxFlightTime: parseFloat(formData.maxFlightTime),
        maxSpeed: parseFloat(formData.maxSpeed),
        maxAltitude: parseFloat(formData.maxAltitude),
        sensorTypes: formData.sensorTypes,
      };

      await addDrone(droneData);
      toast.success("Drone added successfully");
      onClose();
      setFormData({
        name: "",
        model: "",
        serialNumber: "",
        maxFlightTime: "",
        maxSpeed: "",
        maxAltitude: "",
        cameraResolution: "",
        sensorTypes: [],
        isActive: true,
      });
    } catch (error) {
      toast.error("Failed to add drone");
      console.error("Error adding drone:", error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSensorToggle = (sensor: string) => {
    setFormData((prev) => ({
      ...prev,
      sensorTypes: prev.sensorTypes.includes(sensor)
        ? prev.sensorTypes.filter((s) => s !== sensor)
        : [...prev.sensorTypes, sensor],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DroneIcon className="h-5 w-5" />
            <span>Add New Drone</span>
          </DialogTitle>
          <DialogDescription>
            Register a new drone to your fleet with all specifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <DroneIcon className="h-4 w-4" />
              <span>Drone Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Drone Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter drone name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="e.g., DJI Mavic 3 Pro"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
                placeholder="Enter serial number"
                required
              />
            </div>
          </div>

          {/* Performance Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Performance Specifications</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFlightTime">Max Flight Time (min)</Label>
                <Input
                  id="maxFlightTime"
                  type="number"
                  value={formData.maxFlightTime}
                  onChange={(e) =>
                    handleInputChange("maxFlightTime", e.target.value)
                  }
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSpeed">Max Speed (m/s)</Label>
                <Input
                  id="maxSpeed"
                  type="number"
                  value={formData.maxSpeed}
                  onChange={(e) =>
                    handleInputChange("maxSpeed", e.target.value)
                  }
                  placeholder="15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAltitude">Max Altitude (m)</Label>
                <Input
                  id="maxAltitude"
                  type="number"
                  value={formData.maxAltitude}
                  onChange={(e) =>
                    handleInputChange("maxAltitude", e.target.value)
                  }
                  placeholder="120"
                />
              </div>
            </div>
          </div>

          {/* Camera & Sensors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Camera & Sensors</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="cameraResolution">Camera Resolution</Label>
              <Input
                id="cameraResolution"
                value={formData.cameraResolution}
                onChange={(e) =>
                  handleInputChange("cameraResolution", e.target.value)
                }
                placeholder="e.g., 4K, 20MP"
              />
            </div>

            <div className="space-y-2">
              <Label>Sensor Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "RGB_CAMERA",
                  "THERMAL_CAMERA",
                  "MULTISPECTRAL",
                  "LIDAR",
                  "RADAR",
                  "GPS",
                  "IMU",
                  "BAROMETER",
                  "MAGNETOMETER",
                ].map((sensor) => (
                  <Button
                    key={sensor}
                    type="button"
                    variant={
                      formData.sensorTypes.includes(sensor)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleSensorToggle(sensor)}
                    className="justify-start"
                  >
                    {changeCase.capitalCase((sensor))}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Battery className="h-4 w-4" />
              <span>Status</span>
            </h3>

            <div className="space-y-2">
              <Label>Initial Status</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isActive" className="text-sm">
                  Active (ready for missions)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Drone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AddDroneModal({ isOpen, onClose }: AddDroneModalProps) {
  return (
    <DronesProvider>
      <AddDroneModalContent isOpen={isOpen} onClose={onClose} />
    </DronesProvider>
  );
}
