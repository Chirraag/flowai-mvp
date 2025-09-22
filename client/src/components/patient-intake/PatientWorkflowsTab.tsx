import React, { useImperativeHandle, forwardRef, useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow } from "lucide-react";
import EmbeddedWorkflowEditor from "@/components/business-workflows/EmbeddedWorkflowEditor";

/**
 * PatientWorkflowsTab
 * - Patient intake workflows and automation design
 * - Uses EmbeddedWorkflowEditor for full workflow editing capabilities
 */
export type PatientWorkflowsTabHandle = {
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

const PatientWorkflowsTab = forwardRef<PatientWorkflowsTabHandle>((_props, ref) => {
  // Workflow loader function for patient intake agent
  // Reuse the same fetching pattern used by index/editor:
  // 1) GET list /api/v1/business-workflows
  // 2) Select a matching workflow by name heuristics (exact/contains)
  // 3) If not found, POST create a new workflow
  // 4) GET /api/v1/business-workflows/:id to return canonical shape
  const loadPatientIntakeWorkflow = useCallback(async () => {
    const pickByName = (workflows: any[]) => {
      const exact = workflows.find((w) => !w.isTemplate && (w.name === 'Patient Intake Workflow' || w.name === 'Patient Intake Agent'));
      if (exact) return exact;
      const byContains = workflows.find((w) => !w.isTemplate && typeof w.name === 'string' && w.name.toLowerCase().includes('intake'));
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
        name: 'Patient Intake Workflow',
        description: 'Workflow for Patient Intake Agent',
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
      if (!createRes.ok) throw new Error('Failed to create patient intake workflow');
      selected = await createRes.json();
    }

    // 3) Return canonical record via GET by id
    const detailRes = await fetch(`/api/v1/business-workflows/${selected.id}`);
    if (!detailRes.ok) throw new Error('Failed to load patient intake workflow');
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
  const [nodesCount, setNodesCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Patient Intake Workflows Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span>Nodes: <span className="font-medium">{nodesCount}</span></span>
              <span>Last Saved: <span className="font-medium">{updatedAt ? new Date(updatedAt).toLocaleString() : '—'}</span></span>
              <button
                className="px-3 py-1 border rounded bg-[#F48024] hover:bg-[#F48024]/90 text-white"
                onClick={() => exportRef.current && exportRef.current()}
              >Export</button>
            </div>
          </div>

          {/* Embedded Workflow Editor */}
          <EmbeddedWorkflowEditor
            agentType="Patient Intake Agent"
            workflowLoader={loadPatientIntakeWorkflow}
            height="h-96"
            onMetaChange={({ nodesCount, updatedAt }) => {
              setNodesCount(nodesCount);
              setUpdatedAt(updatedAt);
            }}
            exportRef={exportRef}
          />
        </CardContent>
      </Card>
    </div>
  );
});

export default PatientWorkflowsTab;
