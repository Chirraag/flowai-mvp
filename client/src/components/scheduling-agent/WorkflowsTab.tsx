import React, { useImperativeHandle, forwardRef, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, Plus, Save } from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/**
 * WorkflowsTab
 * - Scheduling workflows and automation design
 * - Mirrors the launchpad tab styling and structure
 * - React Flow integration for workflow visualization
 */
export type WorkflowsTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
    workflowData: any; // Placeholder for React Flow data
  };
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const WorkflowsTab = forwardRef<WorkflowsTabHandle>((_props, ref) => {
  // Empty initial workflow - no nodes or edges
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowData, setWorkflowData] = useState<any>({ nodes, edges });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100
      },
      data: { label: `Step ${nodes.length + 1}` },
      style: { background: '#f3f4f6', borderColor: '#6b7280' },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const onSaveWorkflow = useCallback(() => {
    const workflowState = { nodes, edges };
    setWorkflowData(workflowState);
    console.log('Workflow saved:', workflowState);
  }, [nodes, edges]);

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      workflowData: { nodes, edges },
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Scheduling Workflows Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Scheduling Workflows</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Design automated workflows for scheduling processes</p>

          {/* React Flow Canvas */}
          <div className="h-96 mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="top-right"
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
              <Panel position="top-left">
                <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                  Click "Add Node" to start building your workflow
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10" onClick={onAddNode}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button variant="default" className="h-10" onClick={onSaveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default WorkflowsTab;
