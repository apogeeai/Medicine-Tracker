import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MedicineState {
  name: string;
  totalPills: number;
  pillsRemaining: number;
  dailyDose: number;
  startDate: string;
  intakeHistory: { date: string; count: number }[];
  setName: (name: string) => void;
  setTotalPills: (count: number) => void;
  setPillsRemaining: (count: number) => void;
  setDailyDose: (count: number) => void;
  setStartDate: (date: string) => void;
  recordIntake: (count: number) => void;
  resetMedicine: () => void;
}

export const useMedicineStore = create<MedicineState>()(
  persist(
    (set, get) => ({
      name: 'My Medication',
      totalPills: 30,
      pillsRemaining: 30,
      dailyDose: 1,
      startDate: new Date().toISOString().split('T')[0],
      intakeHistory: [],
      setName: (name) => set({ name }),
      setTotalPills: (count) => set({ totalPills: count, pillsRemaining: count }),
      setPillsRemaining: (count) => set({ pillsRemaining: count }),
      setDailyDose: (count) => set({ dailyDose: count }),
      setStartDate: (date) => set({ startDate: date }),
      recordIntake: (count) => {
        const today = new Date().toISOString().split('T')[0];
        const { pillsRemaining, intakeHistory } = get();
        
        // Check if we already have an entry for today
        const todayEntry = intakeHistory.find(entry => entry.date === today);
        
        let newHistory;
        if (todayEntry) {
          // Update today's entry
          newHistory = intakeHistory.map(entry => 
            entry.date === today 
              ? { ...entry, count: entry.count + count } 
              : entry
          );
        } else {
          // Add new entry for today
          newHistory = [...intakeHistory, { date: today, count }];
        }
        
        set({ 
          pillsRemaining: Math.max(0, pillsRemaining - count),
          intakeHistory: newHistory
        });
      },
      resetMedicine: () => set({
        pillsRemaining: get().totalPills,
        intakeHistory: []
      })
    }),
    {
      name: 'medicine-storage',
    }
  )
);