import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, FileText, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface CV {
  id: string;
  name: string;
  lastModified: Date;
}

interface CVSidebarProps {
  user: User;
  selectedCVId: string | null;
  onSelectCV: (id: string) => void;
}

export const CVSidebar = ({ user, selectedCVId, onSelectCV }: CVSidebarProps) => {
  const [cvs, setCVs] = useState<CV[]>([]);

  useEffect(() => {
    // Load CVs from localStorage
    const savedCVs = localStorage.getItem('cvs');
    if (savedCVs) {
      const parsedCVs = JSON.parse(savedCVs).map((cv: any) => ({
        ...cv,
        lastModified: new Date(cv.lastModified)
      }));
      setCVs(parsedCVs);
    }
  }, []);

  const saveCVs = (newCVs: CV[]) => {
    localStorage.setItem('cvs', JSON.stringify(newCVs));
    setCVs(newCVs);
  };

  const createNewCV = () => {
    const newCV: CV = {
      id: crypto.randomUUID(),
      name: `CV ${cvs.length + 1}`,
      lastModified: new Date()
    };
    
    const updatedCVs = [...cvs, newCV];
    saveCVs(updatedCVs);
    onSelectCV(newCV.id);
    
    // Create initial CV structure
    const initialCVData = {
      sections: [{
        id: crypto.randomUUID(),
        type: 'container',
        content: '',
        styles: {
          backgroundColor: 'transparent',
          padding: '20px',
          margin: '0px'
        },
        children: []
      }]
    };
    localStorage.setItem(`cv_${newCV.id}`, JSON.stringify(initialCVData));
    
    toast({
      title: "Success",
      description: "New CV created successfully!"
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getUserInitials = () => {
    const email = user.email || '';
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-full bg-muted/30 border-r flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* CV Management Section */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My CVs</h2>
          <Button size="sm" onClick={createNewCV}>
            <Plus className="h-4 w-4 mr-2" />
            New CV
          </Button>
        </div>

        <div className="space-y-2">
          {cvs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No CVs yet. Create your first CV to get started.
                </p>
                <Button size="sm" onClick={createNewCV}>
                  Create CV
                </Button>
              </CardContent>
            </Card>
          ) : (
            cvs.map((cv) => (
              <Card 
                key={cv.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedCVId === cv.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => onSelectCV(cv.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{cv.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Modified {cv.lastModified.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};