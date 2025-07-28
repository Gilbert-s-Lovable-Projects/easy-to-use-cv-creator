import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { CVSection } from '@/components/CVSection';

interface Section {
  id: string;
  type: 'container' | 'text' | 'image';
  content: string;
  styles: {
    backgroundColor: string;
    padding: string;
    margin: string;
  };
  children: Section[];
}

interface CVData {
  sections: Section[];
}

interface CVEditorProps {
  selectedCVId: string | null;
}

export const CVEditor = ({ selectedCVId }: CVEditorProps) => {
  const [cvData, setCVData] = useState<CVData | null>(null);

  useEffect(() => {
    if (selectedCVId) {
      const savedCV = localStorage.getItem(`cv_${selectedCVId}`);
      if (savedCV) {
        setCVData(JSON.parse(savedCV));
      }
    } else {
      setCVData(null);
    }
  }, [selectedCVId]);

  const saveCVData = (data: CVData) => {
    if (selectedCVId) {
      localStorage.setItem(`cv_${selectedCVId}`, JSON.stringify(data));
      setCVData(data);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!cvData) return;
    
    const updateSectionRecursive = (sections: Section[]): Section[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, ...updates };
        }
        if (section.children.length > 0) {
          return {
            ...section,
            children: updateSectionRecursive(section.children)
          };
        }
        return section;
      });
    };

    const updatedData = {
      ...cvData,
      sections: updateSectionRecursive(cvData.sections)
    };
    saveCVData(updatedData);
  };

  const addSection = (parentId: string, direction: 'horizontal' | 'vertical') => {
    if (!cvData) return;
    
    const newSection: Section = {
      id: crypto.randomUUID(),
      type: 'container',
      content: '',
      styles: {
        backgroundColor: 'transparent',
        padding: '10px',
        margin: '0px'
      },
      children: []
    };

    const addSectionRecursive = (sections: Section[]): Section[] => {
      return sections.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: [...section.children, newSection]
          };
        }
        if (section.children.length > 0) {
          return {
            ...section,
            children: addSectionRecursive(section.children)
          };
        }
        return section;
      });
    };

    const updatedData = {
      ...cvData,
      sections: addSectionRecursive(cvData.sections)
    };
    saveCVData(updatedData);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedCVId) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No CV Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a CV from the sidebar to start editing, or create a new one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">CV Editor</h2>
        <Button onClick={handlePrint} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* CV Canvas */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[297mm]" style={{ width: '210mm' }}>
          {cvData.sections.map((section) => (
            <CVSection
              key={section.id}
              section={section}
              onUpdate={updateSection}
              onAddSection={addSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};