import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Pencil, Trash2, Plus } from "lucide-react";

/**
 * FrequentlyAskedQuestionsTab
 * - FAQ management interface for customer support agent
 * - Provides CRUD operations for frequently asked questions
 */
export type FrequentlyAskedQuestionsTabHandle = {
  getValues: () => { faqs: FAQ[] };
  validate: () => { valid: boolean; errors: string[] };
};

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FrequentlyAskedQuestionsTab = forwardRef<FrequentlyAskedQuestionsTabHandle>((_props, ref) => {
  // Sample FAQ data - in a real app this would come from an API
  const [faqs, setFaqs] = React.useState<FAQ[]>([
    {
      id: "1",
      question: "How do I schedule an appointment?",
      answer: "You can schedule an appointment by calling our office at (555) 123-4567 or by using our online booking system at www.example.com/book. We have appointments available Monday through Friday from 9 AM to 5 PM."
    },
    {
      id: "2",
      question: "What insurance plans do you accept?",
      answer: "We accept most major insurance plans including Blue Cross Blue Shield, United Healthcare, Aetna, and Cigna. Please contact our billing department at billing@example.com to verify coverage for your specific plan."
    },
    {
      id: "3",
      question: "How do I update my personal information?",
      answer: "You can update your personal information by logging into your patient portal at www.example.com/patient-portal or by calling our office. We can help you update contact information, insurance details, and emergency contacts."
    }
  ]);

  const handleEditFAQ = (id: string) => {
    // TODO: Implement edit functionality
    console.log("Edit FAQ:", id);
  };

  const handleDeleteFAQ = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const handleAddNewFAQ = () => {
    // TODO: Implement add new FAQ functionality
    console.log("Add new FAQ");
  };

  useImperativeHandle(ref, () => ({
    getValues: () => ({ faqs }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      {/* FAQ Management Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">FAQ Management</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Manage frequently asked questions for the customer support agent
      </p>

      {/* FAQ Cards */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Question Section */}
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                    Question
                  </span>
                  <p className="text-base font-semibold text-gray-900 leading-snug">
                    {faq.question}
                  </p>
                </div>

                {/* Answer Section */}
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                    Answer
                  </span>
                  <p className="text-sm text-gray-700 leading-snug">
                    {faq.answer}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFAQ(faq.id)}
                    className="flex items-center gap-1 h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFAQ(faq.id)}
                    className="flex items-center gap-1 h-8 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New FAQ Button */}
      <div className="pt-3">
        <Button
          onClick={handleAddNewFAQ}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add New FAQ
        </Button>
      </div>
    </div>
  );
});

export default FrequentlyAskedQuestionsTab;
