import { BaseEdge, getBezierPath, getStraightPath, getSmoothStepPath, type EdgeProps, EdgeLabelRenderer } from '@xyflow/react';
import React, { useState } from 'react';

const ARROW_MARKER_ID = 'custom-arrow';

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, style, selected, data }) => {
  // Add hover state
  const [isHovered, setIsHovered] = useState(false);

  // Get edge type from data or default to 'default'
  const edgeType = data?.edgeType || 'default';

  // Compute path based on edge type
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  switch (edgeType) {
    case 'straight':
      [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
      break;
    case 'smoothstep':
      [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
      break;
    default:
      [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
      break;
  }

  // Style logic
  const isActive = !!selected;
  const isAnimated = isHovered || isActive;
  const color = isActive ? '#2563eb' : '#6b7280';
  const strokeWidth = isActive ? 3 : 2;
  const dash = isAnimated ? '8,6' : 'none';
  const dashOffset = isAnimated ? 0 : 0;

  // Edge click handler for deletion
  const handleEdgeDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (typeof data?.onDelete === 'function') data.onDelete(id);
  };

  return (
    <g 
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <marker
          id={ARROW_MARKER_ID}
          markerWidth="18"
          markerHeight="18"
          refX="13"
          refY="8"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M2,2 L14,8 L2,14 L5,8 Z" fill={color} />
        </marker>
        <style>{`
          @keyframes dashmove {
            to {
              stroke-dashoffset: -28;
            }
          }
        `}</style>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray: dash,
          strokeDashoffset: dashOffset,
          animation: isAnimated ? 'dashmove 1s linear infinite' : 'none',
          ...style,
        }}
        markerEnd={`url(#${ARROW_MARKER_ID})`}
      />
      <EdgeLabelRenderer>
        {(isHovered || isActive) && (
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleEdgeDelete}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#f3f4f6',
                border: `1.5px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
                color: isActive ? '#2563eb' : '#6b7280',
                fontWeight: 'bold',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s, border 0.15s',
                minHeight: 24
              }}
              title="Delete edge"
              aria-label="Delete edge"
              tabIndex={0}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#e5e7eb';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.border = '1.5px solid #ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = isActive ? '#2563eb' : '#6b7280';
                e.currentTarget.style.border = `1.5px solid ${isActive ? '#2563eb' : '#e5e7eb'}`;
              }}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && typeof data?.onDelete === 'function') {
                  e.stopPropagation();
                  data.onDelete(id);
                }
              }}
            >
              ×
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </g>
  );
};

export default CustomEdge; 