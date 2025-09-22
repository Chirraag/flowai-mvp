import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, addEdge, useNodesState, useEdgesState, Connection, Edge, Node, Position, useReactFlow } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import dagre from 'dagre';
import CustomEdge from '@/components/business-workflows/editor/CustomEdge';
import TriggerNode from '@/components/business-workflows/editor/custom-nodes/TriggerNode';
import DelayNode from '@/components/business-workflows/editor/custom-nodes/DelayNode';
import DecisionNode from '@/components/business-workflows/editor/custom-nodes/DecisionNode';
import BusinessNode from '@/components/business-workflows/editor/custom-nodes/BusinessNode';
import NodePickerSheet from '@/components/business-workflows/editor/NodePickerSheet';
import NodeSheet from '@/components/business-workflows/editor/NodeSheet';
import { useToast } from "@/hooks/use-toast";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 40;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'LR') {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface Viewport { x: number; y: number; zoom: number; }

interface EmbeddedWorkflowEditorProps {
  agentType: string;
  workflowLoader: () => Promise<any>;
  height?: string;
  onMetaChange?: (meta: { id: number | null; name: string; nodesCount: number; edgesCount: number; updatedAt: string }) => void;
  exportRef?: React.MutableRefObject<(() => void) | null>;
}

const EmbeddedWorkflowEditor: React.FC<EmbeddedWorkflowEditorProps> = ({
  agentType,
  workflowLoader,
  height = "h-96",
  onMetaChange,
  exportRef
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowUpdatedAt, setWorkflowUpdatedAt] = useState<string>('');
  const [edgeType, setEdgeType] = useState<string>('default');
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const exportViewportRef = useRef<(() => Viewport) | null>(null);
  const importViewportRef = useRef<((viewport: Viewport) => void) | null>(null);
  const [pendingViewport, setPendingViewport] = useState<Viewport | null>(null);
  const reactFlowRef = useRef<any>(null);
  const [viewportCenter, setViewportCenter] = useState({ x: 400, y: 200 });
  const { toast } = useToast();

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    delay: DelayNode,
    decision: DecisionNode,
    business: BusinessNode
  }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  // Emit metadata to parent (nodes/edges count, last updated)
  const emitMeta = useCallback(() => {
    if (!onMetaChange) return;
    onMetaChange({
      id: workflowId,
      name: workflowName,
      nodesCount: nodes.length,
      edgesCount: edges.length,
      updatedAt: workflowUpdatedAt,
    });
  }, [onMetaChange, workflowId, workflowName, workflowUpdatedAt, nodes.length, edges.length]);

  // Export current workflow JSON (similar to editor page)
  const downloadJSON = (obj: any, filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", filename);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  const exportWorkflow = useCallback(() => {
    const viewport = exportViewportRef.current ? exportViewportRef.current() : { x: 0, y: 0, zoom: 1 };
    downloadJSON({
      name: workflowName,
      description: workflowDescription,
      configuration: { nodes, edges },
      status: workflowActive ? 'active' : 'inactive',
      version: '1.0',
      edgeType: edgeType,
      isTemplate: false,
      viewport
    }, `${workflowName || 'workflow'}.json`);
  }, [workflowName, workflowDescription, nodes, edges, workflowActive, edgeType]);

  // Register export function to parent if provided
  useEffect(() => {
    if (exportRef) {
      exportRef.current = exportWorkflow;
    }
  }, [exportRef, exportWorkflow]);

  // Load workflow data when component mounts or agentType changes
  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true);
      try {
        const data = await workflowLoader();
        if (data && data.configuration && data.configuration.nodes && data.configuration.edges) {
          setNodes(data.configuration.nodes);
          setEdges(data.configuration.edges);
          setWorkflowName(data.name || '');
          setWorkflowDescription(data.description || '');
          setWorkflowActive(data.status === 'active');
          setWorkflowUpdatedAt(data.updatedAt || '');
          setEdgeType(data.edgeType || 'default');
          setWorkflowId(data.id);
          if (data.viewport) {
            setPendingViewport(data.viewport);
          }
          toast({ title: "Workflow Loaded", description: `${agentType} workflow loaded successfully.` });
          emitMeta();
        } else {
          setNodes([]);
          setEdges([]);
          setWorkflowName('');
          setWorkflowDescription('');
          setWorkflowActive(false);
          setWorkflowUpdatedAt('');
          setEdgeType('default');
          setWorkflowId(null);
          toast({ title: "Load Error", description: "Workflow data is missing or invalid." });
          emitMeta();
        }
      } catch (error) {
        setNodes([]);
        setEdges([]);
        setWorkflowName('');
        setWorkflowDescription('');
        setWorkflowActive(false);
        setWorkflowUpdatedAt('');
        setEdgeType('default');
        setWorkflowId(null);
        toast({ title: "Load Error", description: "Failed to load workflow." });
        emitMeta();
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [agentType, workflowLoader, setNodes, setEdges, toast]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: 'custom', animated: true, data: { onDelete: handleDeleteEdge, edgeType } },
          eds
        )
      ),
    [setEdges, edgeType]
  );

  const onMove = useCallback((event: any, viewport: any) => {
    const reactFlowElement = reactFlowRef.current;
    if (!reactFlowElement) return;
    const { width, height } = reactFlowElement.getBoundingClientRect();
    const centerX = -viewport.x / viewport.zoom + width / (2 * viewport.zoom);
    const centerY = -viewport.y / viewport.zoom + height / (2 * viewport.zoom);
    setViewportCenter({ x: centerX, y: centerY });
  }, []);

  const handleOpenSheet = useCallback(() => setSheetOpen(true), []);
  const handleCloseSheet = useCallback(() => setSheetOpen(false), []);

  const handleNodeSelect = useCallback((node: any) => {
    setNodes((nds) => {
      // Determine the node type based on the nodeType field
      let nodeType = 'trigger'; // Default to trigger
      if (node.nodeType === 'Trigger Node') nodeType = 'trigger';
      else if (node.nodeType === 'Delay Node') nodeType = 'delay';
      else if (node.nodeType === 'Decision Node') nodeType = 'decision';
      else if (node.nodeType === 'Business Node') nodeType = 'business';

      const newNode = {
        id: `${Date.now()}`,
        type: nodeType,
        data: { ...node },
        position: viewportCenter,
      };
      return [...nds, newNode];
    });
    setSheetOpen(false);
  }, [setNodes, viewportCenter]);

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    toast({ title: "Edge Deleted", description: "Edge has been removed from the workflow." });
  }, [setEdges, toast]);

  const handleNodeClick = useCallback((event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    setSelectedNode(node);
    setNodeSheetOpen(true);
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    toast({ title: "Node Deleted", description: "Node has been removed from the workflow." });
  }, [setNodes, setEdges, toast]);

  const handleUpdateNode = useCallback((nodeId: string, updates: any) => {
    setNodes((nds) => nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  }, [setNodes]);

  // Function to get the correct node type based on nodeType field
  const getNodeTypeFromData = (nodeData: any) => {
    if (nodeData.nodeType === 'Trigger Node') return 'trigger';
    if (nodeData.nodeType === 'Delay Node') return 'delay';
    if (nodeData.nodeType === 'Decision Node') return 'decision';
    if (nodeData.nodeType === 'Business Node') return 'business';
    return 'trigger'; // Default to trigger if unknown
  };

  const nodesWithClick = useMemo(() => nodes.map(n => ({
    ...n,
    // Update node type based on nodeType field if it's still 'custom' or unknown
    type: (n.type === 'custom' || !['trigger', 'delay', 'decision', 'business'].includes(n.type || ''))
      ? getNodeTypeFromData(n.data)
      : (n.type || 'trigger'),
    data: {
      ...n.data,
      onClick: (event: React.MouseEvent<Element, MouseEvent>) => handleNodeClick(event, n),
      onDelete: () => handleDeleteNode(n.id),
    },
  })), [nodes, handleNodeClick, handleDeleteNode]);

  const handleSave = useCallback(async () => {
    if (!workflowId) {
      toast({ title: "Save Error", description: "No workflow ID available" });
      return;
    }

    setSaving(true);
    const payload = {
      name: workflowName,
      description: workflowDescription,
      configuration: { nodes, edges },
      status: workflowActive ? 'active' : 'inactive',
      version: '1.0',
      edgeType: edgeType,
      isTemplate: false
    };

    try {
      const res = await fetch(`/api/v1/business-workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save workflow');
      setWorkflowUpdatedAt(new Date().toISOString());
      toast({ title: "Workflow Saved", description: `${agentType} workflow saved successfully!` });
      emitMeta();
    } catch (err) {
      toast({ title: "Save Error", description: `Error saving workflow: ${err instanceof Error ? err.message : err}` });
    } finally {
      setSaving(false);
    }
  }, [workflowId, workflowName, workflowDescription, nodes, edges, workflowActive, edgeType, agentType, toast, emitMeta]);

  // Keep meta in sync when nodes/edges or updatedAt change
  useEffect(() => {
    emitMeta();
  }, [emitMeta]);

  useEffect(() => {
    if (pendingViewport && importViewportRef.current) {
      importViewportRef.current(pendingViewport);
      setPendingViewport(null);
    }
  }, [nodes, edges, pendingViewport]);

  return (
    <div className="space-y-4">
      {/* Workflow Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{agentType} Workflow</h3>
          <p className="text-sm text-gray-600">{workflowName || 'No workflow loaded'}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !workflowId}
          size="sm"
          className="bg-[#1C275E] hover:bg-[#1C275E]/90 text-white"
        >
          {saving ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>

      {/* React Flow Canvas */}
      <div className={`${height} border border-gray-300 rounded-lg overflow-hidden relative`}>
        <Button
          variant="outline"
          className="absolute border-[#F48024] top-4 right-4 z-10 border-2 w-10 h-10 bg-[#F48024] hover:bg-[#F48024]/90 text-white"
          title="Pick Node"
          onClick={handleOpenSheet}
        >
          <PlusIcon className="w-5 h-5" />
        </Button>

        <NodePickerSheet
          open={sheetOpen}
          onClose={handleCloseSheet}
          onNodeSelect={handleNodeSelect}
        />

        {selectedNode && (
          <NodeSheet
            open={nodeSheetOpen}
            onClose={() => setNodeSheetOpen(false)}
            node={selectedNode}
            onUpdateNode={handleUpdateNode}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div className="text-sm text-muted-foreground">Loading workflow...</div>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodesWithClick}
            edges={edges.map(e => ({ ...e, data: { ...e.data, onDelete: handleDeleteEdge, edgeType } }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onMove={onMove}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={true}
            ref={reactFlowRef}
            maxZoom={1}
          >
            <FlowViewportManager onExportRef={exportViewportRef} onImportViewport={importViewportRef} />
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

interface FlowViewportManagerProps {
  onExportRef: React.MutableRefObject<(() => Viewport) | null>;
  onImportViewport: React.MutableRefObject<((viewport: Viewport) => void) | null>;
}

function FlowViewportManager({ onExportRef, onImportViewport }: FlowViewportManagerProps) {
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    if (onExportRef) {
      onExportRef.current = () => reactFlowInstance.getViewport();
    }
  }, [onExportRef, reactFlowInstance]);
  useEffect(() => {
    if (onImportViewport) {
      onImportViewport.current = (viewport: Viewport) => {
        reactFlowInstance.setViewport(viewport, { duration: 0 });
      };
    }
  }, [onImportViewport, reactFlowInstance]);
  return null;
}

export default EmbeddedWorkflowEditor;
