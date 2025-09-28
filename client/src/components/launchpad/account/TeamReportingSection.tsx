import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

type Person = {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
};

interface TeamReportingSectionProps {
  title: string;
  team: Person[]; // Array of team members
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Person, value: string) => void;
  onRemove: (id: string, personName: string) => void;
  readOnly?: boolean;
}

export default function TeamReportingSection({
  title,
  team,
  onAdd,
  onUpdate,
  onRemove,
  readOnly = false,
}: TeamReportingSectionProps) {
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
    const person = team.find(member => member.id === id);
    if (person) {
      const { lastName } = getNameParts(person.name);
      const combinedName = combineName(firstName, lastName);
      handleTextOnlyChange(id, 'name', combinedName);
    }
  };

  // Handle last name change
  const handleLastNameChange = (id: string, lastName: string) => {
    const person = team.find(member => member.id === id);
    if (person) {
      const { firstName } = getNameParts(person.name);
      const combinedName = combineName(firstName, lastName);
      handleTextOnlyChange(id, 'name', combinedName);
    }
  };
  return (
    <div className="space-y-4">
      {/* Team Section Header */}
      <div className="border-b border-[#1C275E]/20 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1C275E]/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#1C275E]">{title}</h3>
            {team.length > 0 && (
              <span className="bg-[#1C275E]/10 text-[#1C275E] px-2 py-1 rounded-full text-xs font-medium">
                {team.length} member{team.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {!readOnly && (
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
          )}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="space-y-2">
        {team.length > 0 ? (
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
                {team.map((member) => (
                  <TableRow key={member.id} className="hover:bg-[#1C275E]/5">
                    <TableCell className="p-2">
                      <Input
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                        placeholder="Enter title"
                        value={member.title}
                        onChange={readOnly ? undefined : (e) => handleTextOnlyChange(member.id, 'title', e.target.value)}
                        readOnly={readOnly}
                        aria-label="Title"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                        placeholder="First name"
                        value={getNameParts(member.name).firstName}
                        onChange={readOnly ? undefined : (e) => handleFirstNameChange(member.id, e.target.value)}
                        readOnly={readOnly}
                        aria-label="First Name"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                        placeholder="Last name"
                        value={getNameParts(member.name).lastName}
                        onChange={readOnly ? undefined : (e) => handleLastNameChange(member.id, e.target.value)}
                        readOnly={readOnly}
                        aria-label="Last Name"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                        placeholder="email@practice.com"
                        value={member.email}
                        onChange={readOnly ? undefined : (e) => onUpdate(member.id, 'email', e.target.value)}
                        readOnly={readOnly}
                        aria-label="Email"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                        placeholder="123-456-7890"
                        value={formatPhoneNumber(member.phone)}
                        onChange={readOnly ? undefined : (e) => handlePhoneChange(member.id, e.target.value)}
                        readOnly={readOnly}
                        aria-label="Phone"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(member.id, member.name || 'this person')}
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
        ) : (
          <div className="text-center py-16 px-8 bg-gradient-to-br from-[#1C275E]/3 to-[#1C275E]/1 rounded-xl border-2 border-dashed border-[#1C275E]/20">
            <div className="w-20 h-20 bg-[#1C275E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-[#1C275E] mb-3">No team members yet</h4>
            <p className="text-[#1C275E]/70 mb-6 max-w-sm mx-auto">
              Add the first team member for {title.toLowerCase()} to get started with reporting structure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


