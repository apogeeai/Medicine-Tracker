"use client";

import * as React from 'react';
import { useState } from 'react';
import { useMedicineStore } from '@/lib/medicine-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MinusCircle, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MedicineFormData {
  name: string;
  totalPills: number;
  dailyDose: number;
  startDate: string;
}

export function MedicineForm() {
  const { name, totalPills, dailyDose, startDate, updateSettings, recordIntake } = useMedicineStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [intakeCount, setIntakeCount] = React.useState(1);
  const [formData, setFormData] = React.useState<MedicineFormData>({
    name,
    totalPills,
    dailyDose,
    startDate
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    updateSettings(formData);
    setShowConfirmation(false);
  };

  const handleInputChange = (field: keyof MedicineFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIntake = () => {
    if (intakeCount > 0 && intakeCount <= totalPills) {
      recordIntake(intakeCount);
      setIntakeCount(1);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Intake</CardTitle>
          <CardDescription>
            Record your daily medication intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIntakeCount(Math.max(1, intakeCount - 1))}
                disabled={intakeCount <= 1}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min={1}
                value={intakeCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    setIntakeCount(value);
                  }
                }}
                className="w-20 text-center"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIntakeCount(intakeCount + 1)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={handleIntake} disabled={totalPills <= 0}>
              Record Intake
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication Settings</CardTitle>
          <CardDescription>
            Configure your medication details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Medication Name</Label>
              <Input
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Pills</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.totalPills}
                  onChange={handleInputChange('totalPills')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Daily Dose</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.dailyDose}
                  onChange={handleInputChange('dailyDose')}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange('startDate')}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to overwrite the current medication data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}