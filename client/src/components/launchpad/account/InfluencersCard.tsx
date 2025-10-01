import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/form-error";
import { SectionErrorSummary } from "@/components/ui/validation-components";
import { usePermissions } from "@/context/AuthContext";
import type { ValidationError } from "@/lib/launchpad.utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

type Person = {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
};

interface InfluencersCardProps {
  influencers: Person[];
  onAdd?: () => void;
  onUpdate: (id: string, field: keyof Person, value: string) => void;
  onRemove?: (id: string, personName: string) => void;
  errors?: Record<string, string>;
  formErrors?: ValidationError[];
  formWarnings?: ValidationError[];
  onValidateField?: (fieldName: string, value: string, section: string) => void;
  readOnly?: boolean;
}

export default function InfluencersCard({
  influencers,
  onAdd,
  onUpdate,
  onRemove,
  errors = {},
  formErrors = [],
  formWarnings = [],
  onValidateField,
  readOnly: readOnlyProp,
}: InfluencersCardProps) {
  const { canAddTeamMember } = usePermissions();
  const readOnly = readOnlyProp ?? !canAddTeamMember;
  // Phone number formatting for display
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits maximum
    const limitedDigits = digits.slice(0, 10);

    // Apply US phone format: XXX-XXX-XXXX
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    } else {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (id: string, rawValue: string) => {
    // Format for display, but store only digits (no hyphens)
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    onUpdate(id, 'phone', digitsOnly);

    // Trigger real-time validation if available
    onValidateField?.(`inf-${id}-phone`, digitsOnly, 'influencers');
  };

  const handleTextOnlyChange = (id: string, field: 'title' | 'name', rawValue: string) => {
    // Allow only letters, spaces, and basic punctuation
    const textOnly = rawValue.replace(/[^a-zA-Z\s\-']/g, '');
    onUpdate(id, field, textOnly);
  };

  // Helper to split full name into first and last name
  const getNameParts = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  // Helper to combine first and last name
  const combineName = (firstName: string, lastName: string) => {
    const combined = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    return combined || '';
  };

  // Handle first name change
  const handleFirstNameChange = (id: string, firstName: string) => {
    const person = influencers.find(inf => inf.id === id);
    if (person) {
      const { lastName } = getNameParts(person.name);
      const combinedName = combineName(firstName, lastName);
      handleTextOnlyChange(id, 'name', combinedName);
    }
  };

  // Handle last name change
  const handleLastNameChange = (id: string, lastName: string) => {
    const person = influencers.find(inf => inf.id === id);
    if (person) {
      const { firstName } = getNameParts(person.name);
      const combinedName = combineName(firstName, lastName);
      handleTextOnlyChange(id, 'name', combinedName);
    }
  };
  if (influencers.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gradient-to-br from-[#1C275E]/5 to-[#1C275E]/3 rounded-xl border-2 border-dashed border-[#1C275E]/30">
        <div className="w-16 h-16 bg-[#1C275E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#1C275E] mb-2">No influencers added yet</h3>
        <p className="text-[#1C275E]/70 mb-4">Get started by adding your first influencer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionErrorSummary
        errors={formErrors}
        warnings={formWarnings}
        sectionName="influencers"
      />

      {/* Add Person Button */}
      {!readOnly && onAdd && (
        <div className="flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={onAdd}
            className="bg-[#F48024] hover:bg-[#F48024]/90 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Person
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-black font-semibold text-sm">Title</TableHead>
            <TableHead className="text-black font-semibold text-sm">First Name</TableHead>
            <TableHead className="text-black font-semibold text-sm">Last Name</TableHead>
            <TableHead className="text-black font-semibold text-sm">Email</TableHead>
            <TableHead className="text-black font-semibold text-sm">Phone</TableHead>
            <TableHead className="text-black font-semibold text-sm w-16">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((inf) => (
            <TableRow key={inf.id} className="hover:bg-[#1C275E]/5">
              <TableCell className="p-2">
                <Input
                  className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="Enter title"
                  value={inf.title}
                  onChange={readOnly ? undefined : (e) => handleTextOnlyChange(inf.id, 'title', e.target.value)}
                  readOnly={readOnly}
                  aria-label="Title"
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="space-y-1">
                  <Input
                    className={`h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition ${
                      errors[`inf-${inf.id}-firstName`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    placeholder="First name"
                    value={getNameParts(inf.name).firstName}
                    onChange={readOnly ? undefined : (e) => handleFirstNameChange(inf.id, e.target.value)}
                    readOnly={readOnly}
                    aria-label="First Name"
                  />
                  <FieldError error={errors[`inf-${inf.id}-firstName`]} />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <Input
                  className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="Last name"
                  value={getNameParts(inf.name).lastName}
                  onChange={readOnly ? undefined : (e) => handleLastNameChange(inf.id, e.target.value)}
                  readOnly={readOnly}
                  aria-label="Last Name"
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="space-y-1">
                  <Input
                    className={`h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition ${
                      errors[`inf-${inf.id}-email`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    placeholder="email@practice.com"
                    value={inf.email}
                    onChange={readOnly ? undefined : (e) => onUpdate(inf.id, 'email', e.target.value)}
                    readOnly={readOnly}
                    aria-label="Email"
                  />
                  <FieldError error={errors[`inf-${inf.id}-email`]} />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="space-y-1">
                  <Input
                    className={`h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition ${
                      errors[`inf-${inf.id}-phone`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    placeholder="123-456-7890"
                    value={formatPhoneNumber(inf.phone)}
                    onChange={readOnly ? undefined : (e) => handlePhoneChange(inf.id, e.target.value)}
                    readOnly={readOnly}
                    aria-label="Phone"
                  />
                  <FieldError error={errors[`inf-${inf.id}-phone`]} />
                </div>
              </TableCell>
              <TableCell className="p-2">
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove && onRemove(inf.id, inf.name || 'this person')}
                    className="bg-white text-black border border-black hover:bg-gray-50 h-8 w-8 p-0"
                    aria-label="Delete person"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}


