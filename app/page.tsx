import { MedicineBottle } from '@/components/medicine-bottle';
import { MedicineForm } from '@/components/medicine-form';
import { MedicineStats } from '@/components/medicine-stats';
import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-end items-center mb-8">
        
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-8">
            <Card className="overflow-hidden border-none bg-background/60 backdrop-blur-lg">
              <CardHeader className="pb-0">
                <CardTitle>Your Medication</CardTitle>
                <CardDescription>
                  Track your daily medication intake
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <MedicineBottle />
              </CardContent>
            </Card>
            
            <Card className="border-none bg-background/60 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Medication Settings</CardTitle>
                <CardDescription>
                  Configure your medication details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MedicineForm />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-7">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-0">
                <Card className="border-none bg-background/60 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle>Medication Statistics</CardTitle>
                    <CardDescription>
                      Track your medication usage and plan ahead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MedicineStats />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <Card className="border-none bg-background/60 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle>Intake History</CardTitle>
                    <CardDescription>
                      Your medication intake history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IntakeHistory />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}

function IntakeHistory() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Your intake history will appear here once you start recording your medication.
      </p>
    </div>
  );
}