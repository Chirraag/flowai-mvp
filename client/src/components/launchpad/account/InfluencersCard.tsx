import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/form-error";
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
}

export default function InfluencersCard({
  influencers,
  onUpdate,
  onRemove,
  errors = {},
}: InfluencersCardProps) {
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
    <div className="overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#1C275E] font-semibold">Title</TableHead>
            <TableHead className="text-[#1C275E] font-semibold">Name</TableHead>
            <TableHead className="text-[#1C275E] font-semibold">Email</TableHead>
            <TableHead className="text-[#1C275E] font-semibold">Phone</TableHead>
            <TableHead className="text-[#1C275E] font-semibold w-16">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((inf) => (
            <TableRow key={inf.id} className="hover:bg-[#1C275E]/5">
              <TableCell className="p-2">
                <Input
                  className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
                  placeholder="Enter title"
                  value={inf.title}
                  onChange={(e) => onUpdate(inf.id, 'title', e.target.value)}
                  aria-label="Title"
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="space-y-1">
                  <Input
                    className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
                    placeholder="Full name"
                    value={inf.name}
                    onChange={(e) => onUpdate(inf.id, 'name', e.target.value)}
                    aria-label="Name"
                  />
                  <FieldError error={errors[`inf-${inf.id}-name`]} />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="space-y-1">
                  <Input
                    className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
                    placeholder="email@practice.com"
                    value={inf.email}
                    onChange={(e) => onUpdate(inf.id, 'email', e.target.value)}
                    aria-label="Email"
                  />
                  <FieldError error={errors[`inf-${inf.id}-email`]} />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <Input
                  className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
                  placeholder="(555) 123-4567"
                  value={inf.phone}
                  onChange={(e) => onUpdate(inf.id, 'phone', e.target.value)}
                  aria-label="Phone"
                />
              </TableCell>
              <TableCell className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove && onRemove(inf.id, inf.name || 'this person')}
                  className="bg-white text-black border border-black hover:bg-gray-50 h-8 w-8 p-0"
                  aria-label="Delete person"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


