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

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-normal text-gray-900">
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
              className="h-11 border-gray-300"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-normal text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              rows={field.rows || 4}
              className="resize-none border-gray-300"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-3 py-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={field.required}
              className="mt-0.5"
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal text-sm text-gray-700 leading-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'checkbox_group':
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-sm font-normal text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={formData[field.id]?.includes(option.value) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(field.id, option.value, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`${field.id}-${option.value}`}
                    className="cursor-pointer font-normal text-sm text-gray-700 leading-normal"
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
            <Label htmlFor={field.id} className="text-sm font-normal text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              required={field.required}
            >
              <SelectTrigger className="h-11 border-gray-300">
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
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

  const renderFieldsInGrid = (fields: FormField[]) => {
    const result: JSX.Element[] = [];
    let i = 0;

    while (i < fields.length) {
      const field = fields[i];
      const nextField = fields[i + 1];

      if (
        field.type === 'text' &&
        nextField?.type === 'checkbox' &&
        (nextField.label.toLowerCase().includes('can we') ||
         nextField.label.toLowerCase().includes('regarding'))
      ) {
        result.push(
          <div key={field.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 items-start">
            <div className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-normal text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
                className="h-11 border-gray-300"
              />
            </div>
            <div className="flex items-start space-x-3 lg:mt-9">
              <Checkbox
                id={nextField.id}
                checked={formData[nextField.id] || false}
                onCheckedChange={(checked) => handleFieldChange(nextField.id, checked)}
                className="mt-0.5"
              />
              <Label htmlFor={nextField.id} className="cursor-pointer font-normal text-sm text-gray-700 leading-normal">
                {nextField.label}
              </Label>
            </div>
          </div>
        );
        i += 2;
      } else if (
        (field.type === 'text' || field.type === 'email') &&
        (nextField?.type === 'text' || nextField?.type === 'email') &&
        !field.label.toLowerCase().includes('address')
      ) {
        result.push(
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField(field)}
            {renderField(nextField)}
          </div>
        );
        i += 2;
      } else if (field.type === 'select' && nextField?.type === 'select') {
        result.push(
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderField(field)}
            {renderField(nextField)}
          </div>
        );
        i += 2;
      } else {
        result.push(renderField(field));
        i++;
      }
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <img
              src={organization.logoUrl}
              alt={organization.orgName}
              className="h-12 object-contain"
            />
          </div>
          <h1 className="text-center text-xl font-bold text-gray-900 mt-2">{organization.orgName}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 flex items-start space-x-3">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{intakeForm.formTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">Please complete all sections of this intake form</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {intakeForm.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                )}
              </div>
              <div className="px-8 py-6 space-y-6">
                {renderFieldsInGrid(section.fields)}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              <Send className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Healthcare Form'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}