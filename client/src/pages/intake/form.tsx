import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type IntakeOrganization, type IntakeForm, type FormField } from '@/lib/intake.api';

interface IntakeFormPageProps {
  organization: IntakeOrganization;
  intakeForm: IntakeForm;
}

export default function IntakeFormPage({ organization, intakeForm }: IntakeFormPageProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCheckboxGroupChange = (fieldId: string, optionValue: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, optionValue],
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((v: string) => v !== optionValue),
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      toast({
        title: 'Form Submitted',
        description: 'Your intake form has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit the form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              rows={field.rows || 3}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'checkbox_group':
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={formData[field.id]?.includes(option.value) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(field.id, option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${field.id}-${option.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'section':
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img
            src={organization.logoUrl}
            alt={organization.orgName}
            className="h-24 w-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">{organization.orgName}</h1>
          <p className="text-gray-600 mt-2">{intakeForm.formTitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {intakeForm.sections.map((section) => (
              <Card key={section.id} className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>
                <div className="space-y-4">
                  {section.fields.map((field) => renderField(field))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-12 py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Healthcare Form'}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          Your information is protected and encrypted for your security
        </p>
      </div>
    </div>
  );
}