import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle, Copy, Clock, Search, Trash2, GitBranch } from "lucide-react";

interface CanvasNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay";
  name: string;
  description: string;
  position: { x: number; y: number };
  connections: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  configuration: { nodes: CanvasNode[]; edges: Connection[] };
  status: string;
  version: string;
  edgeType: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  configuration: { nodes: CanvasNode[]; edges: Connection[] };
  status: string;
  version: string;
  edgeType: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

// API functions
const fetchWorkflows = async (): Promise<Workflow[]> => {
  const res = await fetch('/api/v1/business-workflows');
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
};

const fetchTemplates = async (): Promise<WorkflowTemplate[]> => {
  const res = await fetch('/api/v1/business-workflows');
  if (!res.ok) throw new Error('Failed to fetch templates');
  const workflows = await res.json();
  return workflows.filter((w: Workflow) => w.isTemplate);
};

const createWorkflow = async (workflowData: Partial<Workflow>): Promise<Workflow> => {
  const res = await fetch('/api/v1/business-workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowData),
  });
  if (!res.ok) throw new Error('Failed to create workflow');
  return res.json();
};

const updateWorkflow = async (id: number, updates: Partial<Workflow>): Promise<Workflow> => {
  const res = await fetch(`/api/v1/business-workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update workflow');
  return res.json();
};

const deleteWorkflow = async (id: number): Promise<void> => {
  const res = await fetch(`/api/v1/business-workflows/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete workflow');
};

export default function BusinessWorkflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and modals
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State for loading actions
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDuplicateId, setConfirmDuplicateId] = useState<number | null>(null);

  // Load workflows and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [workflowsData, templatesData] = await Promise.all([
          fetchWorkflows(),
          fetchTemplates()
        ]);
        setWorkflows(workflowsData);
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter workflows based on search
  const filteredWorkflows = workflows
    .filter(workflow => !workflow.isTemplate)
    .filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "active": "bg-primary text-white",
      "inactive": "bg-gray-100 text-gray-800",
      "draft": "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const toggleWorkflowStatus = async (workflowId: number) => {
    try {
      setActionLoading(true);
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;
      const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
      const updatedWorkflow = await updateWorkflow(workflowId, { status: newStatus });
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
    } catch (err) {
      console.error('Failed to toggle workflow status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    setConfirmDeleteId(workflowId);
  };

  const confirmDeleteWorkflow = async () => {
    if (confirmDeleteId === null) return;
    try {
      setActionLoading(true);
      await deleteWorkflow(confirmDeleteId);
      setWorkflows(prev => prev.filter(w => w.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    setConfirmDuplicateId(workflow.id);
  };

  const confirmDuplicateWorkflow = async () => {
    const workflow = workflows.find(w => w.id === confirmDuplicateId);
    if (!workflow) return;
    try {
      setActionLoading(true);
      const newWorkflow = await createWorkflow({
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        configuration: workflow.configuration,
        status: 'draft',
        edgeType: workflow.edgeType,
        isTemplate: false,
        version: workflow.version,
      });
      setWorkflows(prev => [...prev, newWorkflow]);
      setConfirmDuplicateId(null);
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const createWorkflowFromTemplate = async (template: WorkflowTemplate) => {
    try {
      setActionLoading(true);
      const newWorkflow = await createWorkflow({
        name: `${template.name} (Copy)`,
        description: template.description,
        configuration: template.configuration,
        status: 'draft',
        edgeType: template.edgeType,
        isTemplate: false,
        version: template.version,
      });
      setWorkflows(prev => [...prev, newWorkflow]);
      setShowCreateModal(false);
      navigate(`/business-workflows/editor/${newWorkflow.id}`);
    } catch (err) {
      console.error('Failed to create workflow from template:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const createBlankWorkflow = async () => {
    try {
      setActionLoading(true);
      const newWorkflow = await createWorkflow({
        name: "New Workflow",
        description: "Blank workflow template",
        configuration: { nodes: [], edges: [] },
        status: 'draft',
        edgeType: "default",
        isTemplate: false,
        version: "1.0",
      });
      setWorkflows(prev => [...prev, newWorkflow]);
      setShowCreateModal(false);
      navigate(`/business-workflows/editor/${newWorkflow.id}`);
    } catch (err) {
      console.error('Failed to create blank workflow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Workflows</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Business Workflows</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Configure and manage automated healthcare workflows</p>
        </div>
      </div>

      {/* Search and Create Workflow Button */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-10"
          />
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>Choose a template or start from scratch</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Blank Template */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start from Scratch</h3>
                    <p className="text-gray-600 mb-4">Create a completely custom workflow from the ground up</p>
                    <Button onClick={createBlankWorkflow} variant="outline" disabled={actionLoading}>
                      {actionLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                          Creating...
                        </span>
                      ) : (
                        "Create Blank Workflow"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Or choose a template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`hover:shadow-md transition-shadow cursor-pointer relative ${actionLoading ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => !actionLoading && createWorkflowFromTemplate(template)}
                    >
                      {actionLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                          <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <Badge className="bg-purple-100 text-purple-800">
                            Template
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Version {template.version}
                          </span>
                          <span className="flex items-center text-gray-500">
                            <GitBranch className="h-3 w-3 mr-1" />
                            {template.configuration.nodes.length} nodes
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows List */}
      <div className="w-full">
        <div className="space-y-3">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} onClick={() => navigate(`/business-workflows/editor/${workflow.id}`)} className="group border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white w-full">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header with name, status, and category */}
                  <div className="flex flex-wrap items-start gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
                      {workflow.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(workflow.status)} text-xs font-medium`}>
                        {workflow.status}
                      </Badge>
                      {workflow.isTemplate && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs font-medium">
                          Template
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description with Updated Date */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {workflow.description}
                      <span className="text-gray-400"> | Updated {new Date(workflow.updatedAt).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Version and Node Count */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Version {workflow.version}
                    </span>
                    <span className="flex items-center">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {workflow.configuration.nodes.length} nodes
                    </span>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-medium text-red-700">Inactive</span>
                    <IOSSwitch
                      checked={workflow.status === 'active'}
                      onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                      disabled={actionLoading}
                    />  
                    <span className="text-xs font-medium text-blue-700">Active</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateWorkflow(workflow);
                      }}
                      title="Duplicate Workflow"
                      disabled={actionLoading}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(workflow.id);
                      }}
                      title="Delete Workflow"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No workflows match your search criteria." : "Get started by creating your first workflow."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Workflow
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="text-md text-gray-500">
            {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>Are you sure you want to delete this workflow? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteWorkflow} disabled={actionLoading}>
              {actionLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Duplicate Dialog */}
      <Dialog open={confirmDuplicateId !== null} onOpenChange={(open) => !open && setConfirmDuplicateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Workflow</DialogTitle>
            <DialogDescription>Are you sure you want to duplicate this workflow?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDuplicateId(null)} disabled={actionLoading}>Cancel</Button>
            <Button onClick={confirmDuplicateWorkflow} disabled={actionLoading}>
              {actionLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span> : null}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}