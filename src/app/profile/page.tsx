
"use client";

import { useState, useEffect, type FormEvent } from 'react';
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
import Image from 'next/image'; // Not strictly needed if using AvatarImage but good to keep if direct img use planned
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, loading: authLoading, firebaseUser, updateUserProfileInContext } = useAuth();
  const [editableUser, setEditableUser] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEditableUser({
        name: user.name,
        email: user.email,
        flatNumber: user.flatNumber,
        avatarUrl: user.avatarUrl,
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !editableUser) return;
    setIsSaving(true);
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    
    try {
      const profileUpdateData: Partial<User> = {
        name: editableUser.name,
        email: editableUser.email, // Note: Email updates might require re-authentication or special handling in Firebase Auth. Here we just update Firestore.
        flatNumber: editableUser.flatNumber,
        // avatarUrl: editableUser.avatarUrl, // Avatar URL update logic would go here if implemented
      };
      await updateDoc(userDocRef, profileUpdateData);
      
      // Update user in AuthContext state
      if (user) {
        updateUserProfileInContext(profileUpdateData);
      }

      setIsSaving(false);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsSaving(false);
      toast({ title: "Error", description: "Could not update profile.", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) { // Reset form to original user data from context
        setEditableUser({
            name: user.name,
            email: user.email,
            flatNumber: user.flatNumber,
            avatarUrl: user.avatarUrl,
        });
    }
  }

  if (authLoading || (!user && !firebaseUser)) { // Show loader if auth is loading or if no user and no firebaseUser (initial state)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!user && firebaseUser && !authLoading) { // Case where firebaseUser exists but profile couldn't be fetched or is still loading
     return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) { // Should ideally not be reached if loading states are handled, but as a fallback
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">User not found. Please try logging in again.</p>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <form onSubmit={handleSave}>
            <CardHeader className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Avatar className="w-32 h-32 border-4 border-primary shadow-md">
                  <AvatarImage src={editableUser.avatarUrl || `https://placehold.co/128x128.png?text=${editableUser.name?.charAt(0)}`} alt={editableUser.name} data-ai-hint="user avatar large"/>
                  <AvatarFallback className="text-4xl">{editableUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-background" onClick={() => toast({title: "Feature not implemented", description: "Avatar change is not yet supported."})}>
                    <Edit3 className="h-4 w-4"/>
                    <span className="sr-only">Change Avatar</span>
                  </Button>
                )}
              </div>
              <CardTitle className="text-3xl">{isEditing ? editableUser.name : user.name}</CardTitle>
              <CardDescription>{user.isAdmin ? 'Administrator' : 'Resident'} - Flat: {isEditing ? editableUser.flatNumber : user.flatNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={editableUser.name || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={editableUser.email || ''} onChange={handleInputChange} disabled={!isEditing || true} /* Email editing disabled for now */ title="Email address cannot be changed here." />
                 {!isEditing && <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed after account creation.</p>}
                 {isEditing && <p className="text-xs text-muted-foreground mt-1">Email address updates are handled by Firebase Auth directly and are not editable here.</p>}
              </div>
              <div>
                <Label htmlFor="flatNumber">Flat Number</Label>
                <Input id="flatNumber" name="flatNumber" value={editableUser.flatNumber || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              {/* Add more fields as necessary, e.g., phone number */}
            </CardContent>
            <CardFooter className="border-t pt-6">
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={handleCancelEdit} type="button" className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} type="button" className="w-full">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
