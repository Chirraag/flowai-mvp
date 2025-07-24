import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Trash2, Split } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DecisionNode: React.FC<NodeProps> = ({ data }) => {
  const { nodeType, name, description, onClick, onDelete } = data;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (typeof onDelete === 'function') {
      onDelete();
    }
  };

  // Only pass onClick if it's a valid MouseEventHandler
  const handleNodeClick = (typeof onClick === 'function')
    ? ((e: React.MouseEvent<HTMLDivElement>) => onClick(e))
    : undefined;

  // Ensure all values are valid ReactNode (string or null)
  const safeNodeType = typeof nodeType === 'string' ? nodeType : 'Decision Node';
  const safeName = typeof name === 'string' ? name : '';
  const safeDescription = typeof description === 'string' ? description : '';

  return (
    <div
      className="relative group bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 rounded-xl min-w-[180px] max-w-[260px] text-left border-2 border-blue-400 font-semibold shadow-lg p-4 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
      onClick={handleNodeClick}
    >
      {/* Delete button, only visible on hover */}
      <Button
        variant="ghost"
        className="absolute top-0 right-1 z-10 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
        title="Delete Node"
        onClick={handleDelete}
      >
        <Trash2 className="w-3 h-3 text-red-600" />
      </Button>
      
      {/* Node Type Badge */}
      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white border border-blue-600 mb-3 shadow-sm">
        <Split className="w-3 h-3" />
        {safeNodeType}
      </div>
      
      {/* Node Name */}
      <div className="text-base font-bold mb-2 break-words leading-tight text-blue-800">
        {safeName}
      </div>
      
      {/* Description */}
      {safeDescription ? (
        <div className="text-xs font-normal mb-2 text-gray-600 break-words leading-tight">{safeDescription}</div>
      ) : null}
      
      {/* Yes connection handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="yes"
        className="custom-handle" 
        style={{ top: '30%' }}
      />
      <div className="absolute -right-10 top-[15%] transform -translate-y-1/2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
        Yes
      </div>
      
      {/* No connection handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="no"
        className="custom-handle" 
        style={{ top: '70%' }}
      />
      <div className="absolute -right-10 top-[55%] transform -translate-y-1/2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
        No
      </div>
      
      {/* Input handle */}
      <Handle type="target" position={Position.Left} className="custom-handle" />
    </div>
  );
};

export default DecisionNode; 