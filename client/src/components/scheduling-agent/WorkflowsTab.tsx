import React, { useImperativeHandle, forwardRef, useCallback, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, Save } from "lucide-react";
import EmbeddedWorkflowEditor from "@/components/business-workflows/EmbeddedWorkflowEditor";

/**
 * WorkflowsTab
 * - Scheduling workflows and automation design
 * - Uses EmbeddedWorkflowEditor for full workflow editing capabilities
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
  // Workflow loader function for scheduling agent
  // Reuse the same fetching pattern used by index/editor:
  // 1) GET list /api/v1/business-workflows
  // 2) Select a matching workflow by name heuristics (exact/contains)
  // 3) If not found, POST create a new workflow
  // 4) GET /api/v1/business-workflows/:id to return canonical shape
  const loadSchedulingWorkflow = useCallback(async () => {
    const pickByName = (workflows: any[]) => {
      const exact = workflows.find((w) => !w.isTemplate && (w.name === 'Scheduling Workflow' || w.name === 'Scheduling Agent'));
      if (exact) return exact;
      const byContains = workflows.find((w) => !w.isTemplate && typeof w.name === 'string' && w.name.toLowerCase().includes('scheduling'));
      if (byContains) return byContains;
      return null;
    };

    // 1) Fetch all workflows
    const listRes = await fetch('/api/v1/business-workflows');
    if (!listRes.ok) throw new Error('Failed to fetch workflows list');
    const all = await listRes.json();

    let selected = pickByName(all);

    // 2) Create if missing
    if (!selected) {
      const createPayload = {
        name: 'Scheduling Workflow',
        description: 'Workflow for Scheduling Agent',
        configuration: { nodes: [], edges: [] },
        status: 'draft',
        edgeType: 'default',
        isTemplate: false,
        version: '1.0',
      };
      const createRes = await fetch('/api/v1/business-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
      if (!createRes.ok) throw new Error('Failed to create scheduling workflow');
      selected = await createRes.json();
    }

    // 3) Return canonical record via GET by id
    const detailRes = await fetch(`/api/v1/business-workflows/${selected.id}`);
    if (!detailRes.ok) throw new Error('Failed to load scheduling workflow');
    return detailRes.json();
  }, []);

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      workflowData: {}, // Will be managed by EmbeddedWorkflowEditor
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  const exportRef = useRef<(() => void) | null>(null);
  const saveRef = useRef<(() => Promise<void>) | null>(null);
  const [nodesCount, setNodesCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Handle save workflow
  const handleSave = async () => {
    if (saveRef.current) {
      setSaving(true);
      try {
        await saveRef.current();
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Scheduling Workflows Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Workflow className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Workflow Designer</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Design and configure scheduling automation workflows</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#f48024] rounded-full"></div>
                  <span className="font-medium">Nodes: {nodesCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#1c275e] rounded-full"></div>
                  <span className="font-medium">Last Saved: {updatedAt ? new Date(updatedAt).toLocaleString() : '—'}</span>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Workflow"}
              </Button>
              <button
                className="px-4 py-2 rounded-lg bg-[#f48024] hover:bg-[#e66f20] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                onClick={() => exportRef.current && exportRef.current()}
              >
                Export Workflow
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Embedded Workflow Editor */}
          <EmbeddedWorkflowEditor
            agentType="Scheduling Agent"
            workflowLoader={loadSchedulingWorkflow}
            height="h-96"
            onMetaChange={({ nodesCount, updatedAt }) => {
              setNodesCount(nodesCount);
              setUpdatedAt(updatedAt);
            }}
            exportRef={exportRef}
            saveRef={saveRef}
          />
        </CardContent>
      </Card>
    </div>
  );
});

export default WorkflowsTab;
