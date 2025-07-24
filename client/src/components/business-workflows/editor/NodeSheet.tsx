import React, { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Settings, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NodeSheetProps {
  node: Node;
  open: boolean;
  onClose: () => void;
  onUpdateNode?: (nodeId: string, updates: any) => void;
}

const nodeTypeOptions = [
  { value: 'Trigger Node', label: 'Trigger Node' },
  { value: 'Delay Node', label: 'Delay Node' },
  { value: 'Decision Node', label: 'Decision Node' },
  { value: 'Business Node', label: 'Business Node' }
];

const NodeSheet: React.FC<NodeSheetProps> = ({ node, open, onClose, onUpdateNode }) => {
  if (!open) return null;
  // Type guards for node.data
  const data = node.data || {};
  const nodeType = typeof data.nodeType === 'string' ? data.nodeType : 'Trigger Node';
  const name = typeof data.name === 'string' ? data.name : '';
  const description = typeof data.description === 'string' ? data.description : '';

  // Local state for editable fields
  const [localNodeType, setLocalNodeType] = useState<string>(nodeType);
  const [localName, setLocalName] = useState<string>(name);
  const [localDescription, setLocalDescription] = useState<string>(description);

  // Update local state when node data changes
  useEffect(() => {
    setLocalNodeType(nodeType);
    setLocalName(name);
    setLocalDescription(description);
  }, [nodeType, name, description]);

  const handleNodeTypeChange = (newNodeType: string) => {
    setLocalNodeType(newNodeType);
    if (onUpdateNode) {
      onUpdateNode(node.id, { nodeType: newNodeType });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalName(value);
    if (onUpdateNode) {
      onUpdateNode(node.id, { name: value });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalDescription(value);
    if (onUpdateNode) {
      onUpdateNode(node.id, { description: value });
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end pointer-events-none">
      {/* Overlay for click-outside-to-close */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />
      {/* Sheet */}
      <div className="relative w-80 h-full bg-white shadow-xl px-4 py-6 flex flex-col pointer-events-auto">
        <div className="flex items-center mb-1 sticky top-0 bg-white z-10">
          <Settings className="w-4 h-4 mr-2" />
          <h2 className="text-lg font-semibold">Node Settings</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 mt-4 flex flex-col px-1">
          {/* Node Type Section */}
          <div className="space-y-2">
            <Label htmlFor="node-type" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Node Type
            </Label>
            <Select value={localNodeType} onValueChange={handleNodeTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <Label htmlFor="node-name" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Name
            </Label>
            <Input
              id="node-name"
              type="text"
              value={localName}
              onChange={handleNameChange}
              placeholder="Enter node name..."
              maxLength={50}
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="node-description" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </Label>
            <Textarea
              id="node-description"
              value={localDescription}
              onChange={handleDescriptionChange}
              placeholder="Enter node description..."
              className="min-h-[80px] resize-y"
              maxLength={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeSheet; 