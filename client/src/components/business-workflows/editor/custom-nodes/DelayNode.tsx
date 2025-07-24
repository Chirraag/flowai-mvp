import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Trash2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DelayNode: React.FC<NodeProps> = ({ data }) => {
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
  const safeNodeType = typeof nodeType === 'string' ? nodeType : 'Delay Node';
  const safeName = typeof name === 'string' ? name : '';
  const safeDescription = typeof description === 'string' ? description : '';

  return (
    <div
      className="relative group bg-gradient-to-br from-orange-50 to-amber-50 text-gray-800 rounded-xl min-w-[180px] max-w-[260px] text-left border-2 border-orange-400 font-semibold shadow-lg p-4 hover:border-orange-500 hover:shadow-xl transition-all duration-200"
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
      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white border border-orange-600 mb-3 shadow-sm">
        <Timer className="w-3 h-3" />
        {safeNodeType}
      </div>
      
      {/* Node Name */}
      <div className="text-base font-bold mb-2 break-words leading-tight text-orange-800">
        {safeName}
      </div>
      
      {/* Description */}
      {safeDescription ? (
        <div className="text-xs font-normal mb-2 text-gray-600 break-words leading-tight">{safeDescription}</div>
      ) : null}
      
      <Handle type="source" position={Position.Right} className="custom-handle" />
      <Handle type="target" position={Position.Left} className="custom-handle" />
    </div>
  );
};

export default DelayNode; 