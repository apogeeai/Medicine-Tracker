"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, PlusCircle, MinusCircle } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMedicineStore } from "@/lib/medicine-store";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  totalPills: z.coerce.number().min(1, "Must have at least 1 pill"),
  dailyDose: z.coerce.number().min(1, "Daily dose must be at least 1"),
  startDate: z.date(),
  intakeCount: z.coerce.number().min(0, "Cannot take negative pills"),
});

export function MedicineForm() {
  const { toast } = useToast();
  const { 
    name, 
    totalPills, 
    pillsRemaining, 
    dailyDose, 
    startDate,
    setName, 
    setTotalPills, 
    setDailyDose, 
    setStartDate,
    recordIntake,
    resetMedicine
  } = useMedicineStore();
  
  const [intakeCount, setIntakeCount] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      totalPills,
      dailyDose,
      startDate: startDate ? new Date(startDate) : new Date(),
      intakeCount: 1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setName(values.name);
    setTotalPills(values.totalPills);
    setDailyDose(values.dailyDose);
    setStartDate(values.startDate.toISOString().split('T')[0]);
    
    toast({
      title: "Settings updated",
      description: "Your medication settings have been updated.",
    });
  }

  function handleIntake() {
    if (intakeCount > 0 && intakeCount <= pillsRemaining) {
      recordIntake(intakeCount);
      toast({
        title: "Intake recorded",
        description: `You've taken ${intakeCount} pill${intakeCount > 1 ? 's' : ''}.`,
      });
      setIntakeCount(1);
    } else if (intakeCount > pillsRemaining) {
      toast({
        title: "Not enough pills",
        description: `You only have ${pillsRemaining} pill${pillsRemaining !== 1 ? 's' : ''} left.`,
        variant: "destructive",
      });
    }
  }

  function handleReset() {
    resetMedicine();
    toast({
      title: "Medication reset",
      description: "Your medication has been refilled.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIntakeCount(Math.max(1, intakeCount - 1))}
            disabled={intakeCount <= 1}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          
          <div className="w-16 text-center">
            <span className="text-2xl font-bold">{intakeCount}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIntakeCount(intakeCount + 1)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleIntake} disabled={pillsRemaining <= 0}>
            Record Intake
          </Button>
          
          <Button variant="outline" onClick={handleReset}>
            Refill
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter medication name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalPills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Pills</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormDescription>
                    Total number of pills in a full bottle
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dailyDose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Dose</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormDescription>
                    How many pills you take each day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When you started taking this medication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit">Save Settings</Button>
        </form>
      </Form>
    </div>
  );
}