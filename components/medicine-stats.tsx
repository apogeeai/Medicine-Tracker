"use client";

import { useMemo } from 'react';
import { useMedicineStore } from '@/lib/medicine-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MedicineStats() {
  const { name, totalPills, pillsRemaining, dailyDose, startDate, intakeHistory } = useMedicineStore();
  
  const daysRemaining = Math.floor(pillsRemaining / dailyDose);
  const percentRemaining = (pillsRemaining / totalPills) * 100;
  
  // Calculate refill date (19th of next month if we'll run out before then)
  const refillDate = useMemo(() => {
    const today = new Date();
    let refillMonth = today.getMonth();
    let refillYear = today.getFullYear();
    
    // If today is after the 19th, set refill date to 19th of next month
    if (today.getDate() > 19) {
      refillMonth += 1;
      if (refillMonth > 11) {
        refillMonth = 0;
        refillYear += 1;
      }
    }
    
    return new Date(refillYear, refillMonth, 19);
  }, []);
  
  // Calculate if we'll run out before refill date
  const runOutDate = useMemo(() => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() + daysRemaining));
  }, [daysRemaining]);
  
  const willRunOutBeforeRefill = runOutDate < refillDate;
  
  // Generate forecast data for chart
  const forecastData = useMemo(() => {
    const data = [];
    const today = new Date();
    let remainingPills = pillsRemaining;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Calculate pills for this day
      const pillsForDay = Math.max(0, remainingPills);
      remainingPills -= dailyDose;
      
      // Check if this is a refill date (19th)
      const isRefillDate = date.getDate() === 19;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pills: pillsForDay,
        refill: isRefillDate ? totalPills : undefined
      });
      
      // If it's a refill date, reset the pill count
      if (isRefillDate) {
        remainingPills = totalPills;
      }
    }
    
    return data;
  }, [pillsRemaining, dailyDose, totalPills]);
  
  // Calculate intake history stats
  const intakeStats = useMemo(() => {
    if (intakeHistory.length === 0) return { total: 0, average: 0 };
    
    const total = intakeHistory.reduce((sum, entry) => sum + entry.count, 0);
    const average = total / intakeHistory.length;
    
    return { total, average };
  }, [intakeHistory]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pills Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pillsRemaining} / {totalPills}</div>
            <Progress value={percentRemaining} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground mt-1">
              At {dailyDose} pill{dailyDose > 1 ? 's' : ''} per day
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            {willRunOutBeforeRefill && (
              <p className="text-xs text-destructive mt-1">
                You'll run out on {runOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Medication Forecast</CardTitle>
          <CardDescription>
            Projected pill count over the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="pillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  tickFormatter={(value) => {
                    // Show only every 5th label to avoid crowding
                    const index = forecastData.findIndex(item => item.date === value);
                    return index % 5 === 0 ? value : '';
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} pill${value !== 1 ? 's' : ''}`, 
                    name === 'pills' ? 'Remaining' : 'Refill'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="pills" 
                  stroke="hsl(var(--chart-1))" 
                  fillOpacity={1} 
                  fill="url(#pillGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="refill" 
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2))" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}