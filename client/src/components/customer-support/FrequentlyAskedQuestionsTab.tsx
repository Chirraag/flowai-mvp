import React, { useImperativeHandle, forwardRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCustomerSupportAgent, useUpdateFAQs, useUploadDocument, useDeleteDocument } from "@/lib/customer-support.queries";
import { useToast } from "@/hooks/use-toast";
import type { FAQ, UploadedDocument } from "@/lib/customer-support.types";
import DocumentUpload from "@/components/launchpad/shared/DocumentUpload";

/**
 * FrequentlyAskedQuestionsTab
 * - FAQ management interface for customer support agent
 * - Provides CRUD operations for frequently asked questions
 */
export type FrequentlyAskedQuestionsTabHandle = {
  getValues: () => { faqs: FAQ[] };
  validate: () => { valid: boolean; errors: string[] };
};

interface FrequentlyAskedQuestionsTabProps {
  readOnly?: boolean;
}

const FrequentlyAskedQuestionsTab = forwardRef<FrequentlyAskedQuestionsTabHandle, FrequentlyAskedQuestionsTabProps>(({ readOnly = false }, ref) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Extract orgId from user data
  const orgId = user?.org_id ?? user?.workspaceId;

  // API hooks - only call when orgId is available
  const { data: agentData, isLoading, error } = useCustomerSupportAgent(orgId);
  const updateFAQsMutation = useUpdateFAQs(orgId);
  const uploadDocumentMutation = useUploadDocument(orgId);
  const deleteDocumentMutation = useDeleteDocument(orgId);

  // Local state for FAQs (synced with API)
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [dialogQuestion, setDialogQuestion] = useState('');
  const [dialogAnswer, setDialogAnswer] = useState('');

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFAQIndex, setDeletingFAQIndex] = useState<number | null>(null);

  // Sync local state with API data
  React.useEffect(() => {
    if (agentData?.faqs) {
      setFaqs(agentData.faqs);
    }
  }, [agentData]);

  // Handle adding new FAQ
  const handleAddNewFAQ = () => {
    setEditingFAQ(null);
    setDialogQuestion('');
    setDialogAnswer('');
    setIsDialogOpen(true);
  };

  // Handle editing FAQ
  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setDialogQuestion(faq.question);
    setDialogAnswer(faq.answer);
    setIsDialogOpen(true);
  };

  // Handle showing delete confirmation dialog
  const handleShowDeleteConfirmation = (index: number) => {
    setDeletingFAQIndex(index);
    setIsDeleteDialogOpen(true);
  };

  // Handle deleting FAQ (called after confirmation)
  const handleDeleteFAQ = () => {
    if (deletingFAQIndex === null) return;

    const index = deletingFAQIndex;
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(updatedFaqs);
    updateFAQsMutation.mutate(updatedFaqs, {
      onSuccess: () => {
        toast({
          title: "FAQ deleted",
          description: "The FAQ has been removed successfully.",
        });
        setIsDeleteDialogOpen(false);
        setDeletingFAQIndex(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete FAQ. Please try again.",
          variant: "destructive",
        });
        // Revert local state on error
        setFaqs(agentData?.faqs || []);
        setIsDeleteDialogOpen(false);
        setDeletingFAQIndex(null);
      },
    });
  };

  // Handle saving FAQ (add or edit)
  const handleSaveFAQ = () => {
    if (!dialogQuestion.trim() || !dialogAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Both question and answer are required.",
        variant: "destructive",
      });
      return;
    }

    let updatedFaqs: FAQ[];

    if (editingFAQ) {
      // Edit existing FAQ
      updatedFaqs = faqs.map(faq =>
        faq === editingFAQ
          ? { ...faq, question: dialogQuestion.trim(), answer: dialogAnswer.trim() }
          : faq
      );
    } else {
      // Add new FAQ
      const newFAQ: FAQ = {
        question: dialogQuestion.trim(),
        answer: dialogAnswer.trim(),
      };
      updatedFaqs = [...faqs, newFAQ];
    }

    setFaqs(updatedFaqs);
    updateFAQsMutation.mutate(updatedFaqs, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast({
          title: editingFAQ ? "FAQ updated" : "FAQ added",
          description: editingFAQ
            ? "The FAQ has been updated successfully."
            : "The new FAQ has been added successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to ${editingFAQ ? 'update' : 'add'} FAQ. Please try again.`,
          variant: "destructive",
        });
        // Revert local state on error
        setFaqs(agentData?.faqs || []);
      },
    });
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getValues: () => ({ faqs }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">FAQ Management</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Loading frequently asked questions...</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#f48024]" />
              <span className="ml-2 text-gray-600">Loading FAQs...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">FAQ Management</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Manage frequently asked questions for customer support</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load FAQs. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced FAQ Management Section */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">FAQ Management</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Manage frequently asked questions for the customer support agent</p>
              </div>
            </div>
            {/* Add New FAQ Button - Hidden for read-only users */}
            {!readOnly && (
              <Button
                onClick={handleAddNewFAQ}
                disabled={updateFAQsMutation.isPending}
                className="flex items-center gap-2 bg-[#f48024] hover:bg-[#e66f20] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add New FAQ
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* FAQ Cards */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Question Section */}
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-[#f48024]/10 text-[#f48024] text-xs font-semibold rounded-full uppercase tracking-wide">
                        Question
                      </span>
                      <p className="text-base font-semibold text-gray-900 leading-snug">
                        {faq.question}
                      </p>
                    </div>

                    {/* Answer Section */}
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-[#1c275e]/10 text-[#1c275e] text-xs font-semibold rounded-full uppercase tracking-wide">
                        Answer
                      </span>
                      <p className="text-sm text-gray-700 leading-snug">
                        {faq.answer}
                      </p>
                    </div>

                    {/* Action Buttons - Hidden for read-only users */}
                    {!readOnly && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFAQ(faq)}
                          disabled={updateFAQsMutation.isPending}
                          className="flex items-center gap-1 h-8 px-3 text-xs hover:bg-[#f48024]/5 hover:border-[#f48024]"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDeleteConfirmation(index)}
                          disabled={updateFAQsMutation.isPending}
                          className="flex items-center gap-1 h-8 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                        >
                          {updateFAQsMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty state */}
            {faqs.length === 0 && (
              <Card className="border border-dashed border-gray-300">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
                  <p className="text-gray-600 mb-4">Add your first frequently asked question to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Document Upload Section */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Knowledge Documents</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Upload and manage training documents for the customer support agent</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DocumentUpload
            title=""
            documents={agentData?.documents || []}
            onUpload={uploadDocumentMutation.mutateAsync}
            onDelete={deleteDocumentMutation.mutateAsync}
            isUploading={uploadDocumentMutation.isPending}
            isDeleting={deleteDocumentMutation.isPending}
            maxFileSize={10}
            allowedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'text/plain',
              'image/jpeg',
              'image/png',
              'image/gif'
            ]}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Enhanced Add/Edit FAQ Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#1c275e]">
              {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-semibold text-[#1c275e]">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the frequently asked question..."
                value={dialogQuestion}
                onChange={(e) => setDialogQuestion(e.target.value)}
                className="min-h-[80px] border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer" className="text-sm font-semibold text-[#1c275e]">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the detailed answer..."
                value={dialogAnswer}
                onChange={(e) => setDialogAnswer(e.target.value)}
                className="min-h-[120px] border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={updateFAQsMutation.isPending}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFAQ}
              disabled={updateFAQsMutation.isPending || !dialogQuestion.trim() || !dialogAnswer.trim()}
              className="bg-[#f48024] hover:bg-[#e66f20]"
            >
              {updateFAQsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                editingFAQ ? 'Update FAQ' : 'Add FAQ'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#1c275e] flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete FAQ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </p>
            {deletingFAQIndex !== null && faqs[deletingFAQIndex] && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900 text-sm mb-1">Question:</p>
                <p className="text-sm text-gray-700 italic">"{faqs[deletingFAQIndex].question}"</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingFAQIndex(null);
              }}
              disabled={updateFAQsMutation.isPending}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFAQ}
              disabled={updateFAQsMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updateFAQsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete FAQ
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default FrequentlyAskedQuestionsTab;
