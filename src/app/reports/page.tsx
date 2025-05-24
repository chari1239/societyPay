import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { MONTH_OPTIONS, CURRENT_MONTH_VALUE } from '@/lib/constants';

export default function ReportsPage() {
  // Mock data for report summary
  const reportSummary = {
    totalCollected: 50000,
    totalPending: 5000,
    paidHouseholds: 20,
    pendingHouseholds: 2,
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="text-2xl">Monthly Reports</CardTitle>
                    <CardDescription>
                    Generate and view monthly maintenance payment reports.
                    </CardDescription>
                </div>
                 <div className="w-full sm:w-auto min-w-[200px]">
                    <Label htmlFor="month-select-report" className="text-sm font-medium mb-1 block">Report Month:</Label>
                    <Select defaultValue={CURRENT_MONTH_VALUE}>
                    <SelectTrigger id="month-select-report">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTH_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-blue-50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-blue-700">Total Collected</CardDescription>
                  <CardTitle className="text-3xl text-blue-800">₹{reportSummary.totalCollected.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-yellow-700">Total Pending</CardDescription>
                  <CardTitle className="text-3xl text-yellow-800">₹{reportSummary.totalPending.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-green-50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-green-700">Paid Households</CardDescription>
                  <CardTitle className="text-3xl text-green-800">{reportSummary.paidHouseholds}</CardTitle>
                </CardHeader>
              </Card>
               <Card className="bg-red-50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-red-700">Pending Households</CardDescription>
                  <CardTitle className="text-3xl text-red-800">{reportSummary.pendingHouseholds}</CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            <div className="text-center">
              <Button size="lg" disabled> {/* Disabled as it's a mock */}
                <Download className="mr-2 h-5 w-5" />
                Download Report (PDF)
              </Button>
              <p className="text-sm text-muted-foreground mt-2">(Feature coming soon)</p>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Payment Trends (Placeholder)</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Chart data will be displayed here.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
