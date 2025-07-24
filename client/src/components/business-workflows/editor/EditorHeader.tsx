import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOSSwitch } from '@/components/ui/ios-switch';
import { Pencil, Save, Upload, Download, Clock, GitBranch } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface EditorHeaderProps {
  name: string;
  description: string;
  active: boolean;
  nodeCount: number;
  version: string;
  lastUpdated?: string;
  saving?: boolean;
  edgeType?: string;
  onEdit: (name: string, description: string) => void;
  onToggleActive: (active: boolean) => void;
  onEdgeTypeChange?: (edgeType: string) => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
}

const edgeTypeOptions = [
  { value: 'default', label: 'Default (Bezier)' },
  { value: 'straight', label: 'Straight' },
  { value: 'smoothstep', label: 'Smooth Step' }
];

const EditorHeader: React.FC<EditorHeaderProps> = ({
  name,
  description,
  active,
  nodeCount,
  version,
  lastUpdated,
  saving = false,
  edgeType = 'default',
  onEdit,
  onToggleActive,
  onEdgeTypeChange,
  onSave,
  onImport,
  onExport,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);

  const handleEditSave = () => {
    onEdit(editName, editDescription);
    setEditDialogOpen(false);
  };

  const handleEdgeTypeChange = (newEdgeType: string) => {
    if (onEdgeTypeChange) {
      onEdgeTypeChange(newEdgeType);
    }
  };

  React.useEffect(() => {
    setEditName(name);
    setEditDescription(description);
  }, [name, description]);

  return (
    <div className="relative rounded-t-lg shadow-sm border-b bg-white">
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 pt-4">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg truncate text-foreground">{name || 'Untitled Workflow'}</CardTitle>
            <Button size="icon" variant="ghost" onClick={() => setEditDialogOpen(true)} aria-label="Edit name and description">
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Version: {version}</span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              {nodeCount} nodes
            </span>
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={active ? 'text-xs text-muted-foreground font-normal' : 'text-xs text-primary font-semibold'}>
              Inactive
            </span>
            <IOSSwitch checked={active} onCheckedChange={onToggleActive} />
            <span className={active ? 'text-xs text-primary font-semibold' : 'text-xs text-muted-foreground font-normal'}>
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-normal">Edge Type:</span>
              <Select value={edgeType} onValueChange={handleEdgeTypeChange}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {edgeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button size="sm" variant="default" onClick={onSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={onImport}>
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Workflow Name"
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Description"
                maxLength={128}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorHeader; 