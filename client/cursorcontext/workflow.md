Step 1: Establish Agent-Workflow Relationship
Update server/db/seedData.ts: Add workflowId to agent configurations
Add API endpoint: GET /api/v1/business-workflows/agent/:agentType in businessWorkflows.ts
Create storage method: getAiAgentByType(type: string) in storage.ts

Step 2: Create Embedded Workflow Editor Component
Extract reusable editor logic from editor.tsx into EmbeddedWorkflowEditor.tsx
Remove navigation elements: "Back to Workflows" link, full-screen layout
Keep core functionality: All editing features, save operations, node management
Add agent-specific props: agentType, workflowLoader function

Step 3: Replace Agent Workflow Tabs
Update WorkflowsTab.tsx: Replace basic React Flow with EmbeddedWorkflowEditor
Update PatientWorkflowsTab.tsx: Same replacement for patient intake agent
Add workflow loading logic: Fetch agent-specific workflow data on mount
Maintain tab structure: Keep within existing tabbed interface

Step 4: Integrate and Test
Update agent configurations: Add workflow IDs to existing seed data
Test save operations: Ensure changes persist to correct workflow
Verify agent context: Confirm each agent loads its specific workflow
Handle edge cases: Loading states, error handling, validation