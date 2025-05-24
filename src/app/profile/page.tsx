"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';
import { Loader2, Edit3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, login } = useAuth(); // Using login to "update" user in mock
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you'd update the user via an API.
    // For mock, we'll update the AuthContext's user by "logging in" again with updated info
    // This is a hack for mock purposes.
    if (currentUser.email) { // Assuming email doesn't change for login re-auth
        const updatedUserForStorage = { ...currentUser };
        localStorage.setItem('societyPayUser', JSON.stringify(updatedUserForStorage));
        // Trigger a re-fetch or context update if your AuthProvider supports it.
        // For this simple mock, we'll just update local state and assume context reflects changes on next load.
        // Or, if login function updates context user:
        // login(currentUser.email, "mockPassword"); // pass a mock password
    }

    setIsSaving(false);
    setIsEditing(false);
    toast({ title: "Profile Updated", description: "Your information has been saved." });
  };

  if (loading || !currentUser) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Avatar className="w-32 h-32 border-4 border-primary shadow-md">
                <AvatarImage src={currentUser.avatarUrl || `https://placehold.co/128x128.png?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} data-ai-hint="user avatar large"/>
                <AvatarFallback className="text-4xl">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-background">
                  <Edit3 className="h-4 w-4"/>
                  <span className="sr-only">Change Avatar</span>
                </Button>
              )}
            </div>
            <CardTitle className="text-3xl">{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.isAdmin ? 'Administrator' : 'Resident'} - Flat: {currentUser.flatNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={currentUser.name} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={currentUser.email} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="flatNumber">Flat Number</Label>
              <Input id="flatNumber" name="flatNumber" value={currentUser.flatNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            {/* Add more fields as necessary, e.g., phone number */}
          </CardContent>
          <CardFooter className="border-t pt-6">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={() => { setIsEditing(false); setCurrentUser(user); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
