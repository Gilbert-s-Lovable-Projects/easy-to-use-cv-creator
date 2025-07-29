import { useState, useRef } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Type, Image, Palette, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';

interface Section {
  id: string;
  type: 'container' | 'text' | 'image';
  content: string;
  styles: {
    backgroundColor: string;
    padding: string;
    margin: string;
    border: string;
  };
  children: Section[];
}

interface CVSectionProps {
  section: Section;
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onAddSection: (parentId: string, direction: 'horizontal' | 'vertical') => void;
}

export const CVSection = ({ section, onUpdate, onAddSection }: CVSectionProps) => {
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const [textContent, setTextContent] = useState(section.content);
  const [backgroundColor, setBackgroundColor] = useState(section.styles.backgroundColor);
  const [padding, setPadding] = useState(section.styles.padding);
  const [margin, setMargin] = useState(section.styles.margin);
  const [border, setBorder] = useState(section.styles.border || 'none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsertText = () => {
    setTextContent(section.content);
    setShowTextDialog(true);
  };

  const handleSaveText = () => {
    onUpdate(section.id, { 
      content: textContent,
      type: 'text'
    });
    setShowTextDialog(false);
  };

  const handleStyleChange = () => {
    setBackgroundColor(section.styles.backgroundColor);
    setPadding(section.styles.padding);
    setMargin(section.styles.margin);
    setBorder(section.styles.border || 'none');
    setShowStyleDialog(true);
  };

  const handleSaveStyles = () => {
    onUpdate(section.id, {
      styles: {
        backgroundColor,
        padding,
        margin,
        border
      }
    });
    setShowStyleDialog(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onUpdate(section.id, {
          content: imageUrl,
          type: 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (section.type) {
      case 'text':
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
          />
        );
      case 'image':
        return section.content ? (
          <img 
            src={section.content} 
            alt="CV Image" 
            className="max-w-full h-auto"
          />
        ) : null;
      default:
        return section.content ? (
          <div className="text-gray-400 text-sm">
            {section.content}
          </div>
        ) : (
          <div className="text-gray-300 text-sm text-center py-4">
            Right-click to add content
          </div>
        );
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="min-h-screen hover:bg-black/10 transition-colors duration-200 cursor-pointer"
            style={{
              backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
              padding,
              margin,
              border: border === 'none' ? 'none' : border
            }}
          >
            {renderContent()}
            
            {/* Render children sections */}
            {section.children.length > 0 && (
              <div className="space-y-2">
                {section.children.map((child) => (
                  <CVSection
                    key={child.id}
                    section={child}
                    onUpdate={onUpdate}
                    onAddSection={onAddSection}
                  />
                ))}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={handleInsertText}>
            <Type className="h-4 w-4 mr-2" />
            Insert Text
          </ContextMenuItem>
          <ContextMenuItem onClick={handleImageUpload}>
            <Image className="h-4 w-4 mr-2" />
            Insert Image
          </ContextMenuItem>
          <ContextMenuItem onClick={handleStyleChange}>
            <Palette className="h-4 w-4 mr-2" />
            Style Section
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAddSection(section.id, 'horizontal')}>
            <SplitSquareHorizontal className="h-4 w-4 mr-2" />
            Split Horizontal
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAddSection(section.id, 'vertical')}>
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            Split Vertical
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Text Edit Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Text Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text content..."
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTextDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveText}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Style Edit Dialog */}
      <Dialog open={showStyleDialog} onOpenChange={setShowStyleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Section Styles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20"
                />
                <Button
                  variant="outline"
                  onClick={() => setBackgroundColor('transparent')}
                  className="flex-1"
                >
                  Transparent
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                placeholder="e.g., 20px or 1rem"
              />
            </div>
            <div>
              <Label htmlFor="margin">Margin</Label>
              <Input
                id="margin"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="e.g., 10px or 0.5rem"
              />
            </div>
            <div>
              <Label htmlFor="border">Border</Label>
              <Input
                id="border"
                value={border}
                onChange={(e) => setBorder(e.target.value)}
                placeholder="e.g., 1px solid #000 or none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowStyleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStyles}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};