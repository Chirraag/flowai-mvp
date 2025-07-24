import { GitBranch, Clock, GitBranch as DecisionIcon, Settings, Zap, Timer, Split, Cog } from 'lucide-react';
import React from 'react';

interface NodeType {
  id: string;
  nodeType: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface NodePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onNodeSelect: (node: NodeType) => void;
}

const predefinedNodeTypes: NodeType[] = [
  {
    id: 'trigger',
    nodeType: 'Trigger Node',
    name: 'Trigger Node',
    description: 'Starts a workflow when activated',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'delay',
    nodeType: 'Delay Node',
    name: 'Delay Node',
    description: 'Pauses workflow execution for a specified time',
    icon: <Timer className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'decision',
    nodeType: 'Decision Node',
    name: 'Decision Node',
    description: 'Routes workflow based on conditions',
    icon: <Split className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'business',
    nodeType: 'Business Node',
    name: 'Business Node',
    description: 'Executes business logic and operations',
    icon: <Cog className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  }
];

const NodePickerSheet: React.FC<NodePickerSheetProps> = ({ open, onClose, onNodeSelect }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex justify-end pointer-events-none">
      {/* Overlay for click-outside-to-close */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />
      {/* Sheet */}
      <div className="relative w-80 h-full bg-white shadow-xl px-4 py-6 flex flex-col pointer-events-auto">
        <div className="flex items-center mb-1 sticky top-0 bg-white z-10">
          <GitBranch className="w-4 h-4 mr-2" />
          <h2 className="text-lg font-semibold">Add Node</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto mt-4 flex flex-col px-1">
          <div>
            <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Node Types</div>
            <div className="flex flex-col gap-2">
              {predefinedNodeTypes.map((node) => (
                <button
                  key={node.id}
                  className={`w-full px-4 py-3 rounded-lg border text-left transition-all hover:scale-[1.02] hover:shadow-md ${node.color}`}
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${node.color.replace('bg-', 'bg-opacity-20 ')}`}>
                      {node.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{node.name}</div>
                      <div className="text-xs opacity-75">{node.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePickerSheet; 