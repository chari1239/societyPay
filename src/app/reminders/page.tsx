import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockReminders } from '@/lib/mockData';
import type { Reminder } from '@/types';
import { Bell, CalendarClock, MessageSquare, User, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function ReminderCard({ reminder }: { reminder: Reminder }) {
  const isOverdue = new Date(reminder.dueDate) < new Date() && reminder.status !== 'Acknowledged';
  
  let statusIcon = <Bell className="h-4 w-4 text-blue-500" />;
  let statusColor = "bg-blue-100 text-blue-700 border-blue-300";
  if (reminder.status === 'Sent') {
    statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
    statusColor = "bg-green-100 text-green-700 border-green-300";
  }
  if (isOverdue) {
    statusIcon = <AlertTriangle className="h-4 w-4 text-red-500" />;
    statusColor = "bg-red-100 text-red-700 border-red-300";
  }


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${reminder.userName.charAt(0)}`} alt={reminder.userName} data-ai-hint="user avatar small"/>
                <AvatarFallback>{reminder.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md">{reminder.userName}</CardTitle>
              <CardDescription>Flat: {reminder.flatNumber}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={statusColor}>
            {statusIcon}
            <span className="ml-1">{isOverdue ? "Overdue" : reminder.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-start">
          <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
          <p className="text-muted-foreground">{reminder.message}</p>
        </div>
        <div className="flex items-center">
          <CalendarClock className="h-4 w-4 mr-2 text-primary" />
          <span>Due: {format(new Date(reminder.dueDate), 'PPP')} ({formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })})</span>
        </div>
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-primary" />
          <span>Amount: <span className="font-medium">₹{reminder.amountDue.toLocaleString()}</span></span>
        </div>
        {reminder.sentDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Bell className="h-3 w-3 mr-1" />
            <span>Sent: {format(new Date(reminder.sentDate), 'Pp')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RemindersPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Reminders</CardTitle>
            <CardDescription>
              View scheduled and sent payment reminders. AI helps optimize reminder delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockReminders.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockReminders.map(reminder => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reminders to display at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-xl bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="text-lg text-blue-800">Smart Reminder System</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-blue-700">
                Our AI-powered system analyzes payment patterns and intelligently schedules reminders
                to maximize on-time payments while minimizing annoyance. You don't need to manually configure anything for this core feature.
                </p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
