
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileFormData } from '@/types/profile';

interface ProfileFormProps {
  formData: ProfileFormData;
  isUpdating: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLogout: () => void;
}

export const ProfileForm = ({ formData, isUpdating, onNameChange, onSubmit, onLogout }: ProfileFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your account details</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Your name" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={formData.email} 
              disabled 
              className="bg-muted" 
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onLogout}
          >
            Logout
          </Button>
          <Button 
            type="submit" 
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
