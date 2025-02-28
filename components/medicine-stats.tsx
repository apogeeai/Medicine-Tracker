"use client";

import * as React from 'react';
import { useMedicineStore } from '@/lib/medicine-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Pill, Calendar, RefreshCw } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

export function MedicineStats() {
  const { name, totalPills, pillsRemaining, dailyDose, startDate, intakeHistory } = useMedicineStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const daysRemaining = Math.floor(pillsRemaining / dailyDose);
  const percentRemaining = (pillsRemaining / totalPills) * 100;
  
  // Calculate refill date (March 17th)
  const refillDate = React.useMemo(() => {
    const refillDate = new Date(2024, 2, 17); // March 17th, 2024 (month is 0-based)
    return refillDate;
  }, []);
  
  // Calculate if we'll run out before refill date
  const runOutDate = React.useMemo(() => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() + daysRemaining));
  }, [daysRemaining]);
  
  const willRunOutBeforeRefill = runOutDate < refillDate;
  
  // Generate forecast data for chart
  const forecastData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    let remainingPills = pillsRemaining;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Format the date for comparison
      const currentDateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const refillDateStr = refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (currentDateStr === refillDateStr) {
        // On refill date (March 17th), set to 100 pills
        remainingPills = 100;
      }
      
      // Push the data point
      data.push({
        date: currentDateStr,
        pills: Math.max(0, remainingPills),
        fullDate: new Date(date)
      });
      
      // After recording the day's pills, subtract daily dose
      remainingPills = Math.max(0, remainingPills - dailyDose);
    }
    
    return data;
  }, [pillsRemaining, dailyDose, refillDate]);
  
  // Calculate intake history stats
  const intakeStats = React.useMemo(() => {
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
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Pills Remaining</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pillsRemaining} / {totalPills}</div>
            <Progress value={percentRemaining} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            </div>
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
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
            </div>
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
                  interval={isMobile ? 2 : 0} // Show every 3rd date on mobile
                  angle={-45} // Angle the dates for better readability
                  textAnchor="end" // Align angled text
                  height={60} // Increase height to accommodate angled text
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  domain={[0, totalPills]} // Set max Y value to total pills
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} pill${value !== 1 ? 's' : ''}`, 
                    name === 'pills' ? 'Remaining' : 'Refill'
                  ]}
                  labelFormatter={(label) => {
                    const date = forecastData.find(d => d.date === label)?.fullDate;
                    return date ? `${label} (${date.toLocaleDateString('en-US', { weekday: 'short' })})` : label;
                  }}
                />
                <ReferenceLine 
                  x={refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="hsl(var(--chart-2))"
                  strokeDasharray="3 3"
                  label={{
                    value: "Refill Date",
                    position: "top",
                    fill: "hsl(var(--chart-2))",
                    fontSize: 12
                  }}
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