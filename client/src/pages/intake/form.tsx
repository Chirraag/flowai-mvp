import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type IntakeOrganization, type IntakeForm, type FormField } from '@/lib/intake.api';
import { FileText, Send } from 'lucide-react';

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

  const renderField = (field: FormField, index: number, fields: FormField[]) => {
    const value = formData[field.id] || '';
    const nextField = fields[index + 1];
    const shouldBeInline =
      field.type === 'text' &&
      nextField?.type === 'checkbox' &&
      (nextField.label.toLowerCase().includes('can we') ||
       nextField.label.toLowerCase().includes('consent'));

    if (shouldBeInline) {
      return (
        <div key={field.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">
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
              className="h-10"
            />
          </div>
          <div className="flex items-center space-x-2 lg:mt-8">
            <Checkbox
              id={nextField.id}
              checked={formData[nextField.id] || false}
              onCheckedChange={(checked) => handleFieldChange(nextField.id, checked)}
            />
            <Label htmlFor={nextField.id} className="cursor-pointer font-normal text-sm text-gray-700">
              {nextField.label}
            </Label>
          </div>
        </div>
      );
    }

    if (field.type === 'checkbox' && index > 0) {
      const prevField = fields[index - 1];
      if (prevField?.type === 'text' && (field.label.toLowerCase().includes('can we') || field.label.toLowerCase().includes('consent'))) {
        return null;
      }
    }

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">
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
              className="h-10"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">
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
              className="resize-none"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-2 py-1">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal text-sm text-gray-700 leading-5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'checkbox_group':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    className="cursor-pointer font-normal text-sm text-gray-700 leading-5"
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
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              required={field.required}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.filter(opt => opt.value).map((option) => (
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

  const renderFieldsWithLayout = (fields: FormField[]) => {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const nextField = fields[i + 1];

      if (field.type === 'select' && nextField?.type === 'select') {
        elements.push(
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField(field, i, fields)}
            {renderField(nextField, i + 1, fields)}
          </div>
        );
        i++;
      } else if (field.type === 'text' && nextField?.type === 'text' && !field.label.toLowerCase().includes('address')) {
        elements.push(
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField(field, i, fields)}
            {renderField(nextField, i + 1, fields)}
          </div>
        );
        i++;
      } else {
        const element = renderField(field, i, fields);
        if (element) {
          elements.push(element);
        }
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <img
              src={organization.logoUrl}
              alt={organization.orgName}
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-center text-xl font-bold text-gray-900 mt-2">{organization.orgName}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{intakeForm.formTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">Please complete all sections of this intake form</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {intakeForm.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                )}
              </div>
              <div className="space-y-6">
                {renderFieldsWithLayout(section.fields)}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Healthcare Form'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}