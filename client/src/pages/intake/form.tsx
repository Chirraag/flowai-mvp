import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type IntakeOrganization, type IntakeForm, type FormField } from '@/lib/intake.api';
import { FileText, Send } from 'lucide-react';
import { useIntakeContext } from './index';

interface IntakeFormPageProps {
  organization: IntakeOrganization;
  intakeForm: IntakeForm;
}

export default function IntakeFormPage({ organization, intakeForm }: IntakeFormPageProps) {
  const navigate = useNavigate();
  const { hash } = useParams<{ hash: string }>();
  const { toast } = useToast();
  const { isVerified, patientData } = useIntakeContext();
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (patientData) {
      const initialData: Record<string, any> = {};
      if (patientData.phone) initialData['phone'] = patientData.phone;
      if (patientData.email) initialData['email'] = patientData.email;
      setFormData(initialData);
    }
  }, [patientData]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isVerified) {
      navigate(`/intake/${hash}`);
    }
  }, [isVerified, navigate, hash]);

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
          <div key={field.id}>
            <label className="block text-base font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              disabled={(field as any).disabled}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id}>
            <label className="block text-base font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              rows={field.rows || 3}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={value}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              required={field.required}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.id} className="ml-2 text-base text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      case 'checkbox_group':
        return (
          <div key={field.id}>
            <label className="block text-base font-medium text-gray-700 mb-3">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.id}-${option.value}`}
                    checked={formData[field.id]?.includes(option.value) || false}
                    onChange={(e) =>
                      handleCheckboxGroupChange(field.id, option.value, e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`${field.id}-${option.value}`}
                    className="ml-2 text-base text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id}>
            <label className="block text-base font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.filter(opt => opt.value).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'section':
        return null;

      default:
        return null;
    }
  };

  const processFormSections = (sections: FormSection[]) => {
    return sections
      .filter(section => {
        const lowerTitle = section.title.toLowerCase();
        return !lowerTitle.includes('prep checklist') &&
               !lowerTitle.includes('authorized contact for care communication');
      })
      .map(section => ({
        ...section,
        fields: section.fields.map(field => {
          if (field.id === 'emergency_contact' && field.type === 'text') {
            return [
              {
                id: 'emergency_contact_name',
                type: 'text' as const,
                label: 'Emergency Contact Name',
                required: field.required,
                placeholder: 'Enter emergency contact name'
              },
              {
                id: 'emergency_contact_phone',
                type: 'text' as const,
                label: 'Emergency Contact Phone',
                required: field.required,
                placeholder: 'Enter emergency contact phone'
              }
            ];
          }
          if ((field.id === 'phone' || field.id === 'email') && patientData) {
            return { ...field, disabled: true };
          }
          return field;
        }).flat()
      }));
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
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
                disabled={(field as any).disabled}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id={nextField.id}
                checked={formData[nextField.id] || false}
                onChange={(e) => handleFieldChange(nextField.id, e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={nextField.id} className="ml-2 text-base text-gray-700">
                {nextField.label}
              </label>
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
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(field)}
            {renderField(nextField)}
          </div>
        );
        i += 2;
      } else if (field.type === 'select' && nextField?.type === 'select') {
        result.push(
          <div key={`${field.id}-${nextField.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <img
              src={organization.logoUrl}
              alt={organization.orgName}
              className="h-12 w-auto mx-auto mb-2"
            />
            <h1 className="text-lg font-medium text-gray-900">{organization.orgName}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{intakeForm.formTitle}</h1>
                <p className="text-base text-gray-600 mt-1">
                  Please complete all sections of this intake form
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {processFormSections(intakeForm.sections).map((section) => (
                <section key={section.id}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h2>
                  {section.description && (
                    <p className="text-base text-gray-600 mb-4">{section.description}</p>
                  )}
                  <div className="space-y-4">
                    {renderFieldsInGrid(section.fields)}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Intake Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}