import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { CVSidebar } from '@/components/CVSidebar';
import { CVEditor } from '@/components/CVEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const AppPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          navigate('/auth');
        }
        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <CVSidebar 
            user={user} 
            selectedCVId={selectedCVId}
            onSelectCV={setSelectedCVId}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <CVEditor selectedCVId={selectedCVId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AppPage;