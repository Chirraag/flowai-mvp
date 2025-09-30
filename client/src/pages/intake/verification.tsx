import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifyPatient, type IntakeOrganization } from '@/lib/intake.api';
import { User, Calendar } from 'lucide-react';
import { useIntakeContext } from './index';

interface VerificationPageProps {
  organization: IntakeOrganization;
}

export default function VerificationPage({ organization }: VerificationPageProps) {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsVerified } = useIntakeContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputType = e.target.type;

    if (inputType === 'date') {
      const dateValue = e.target.value;
      if (dateValue) {
        const [year, month, day] = dateValue.split('-');
        setDateOfBirth(`${month}/${day}/${year}`);
      }
    } else {
      let value = e.target.value.replace(/\D/g, '');

      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      if (value.length >= 5) {
        value = value.slice(0, 5) + '/' + value.slice(5);
      }

      value = value.slice(0, 10);
      setDateOfBirth(value);
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.type = 'date';
      dateInputRef.current.showPicker();
      dateInputRef.current.addEventListener('blur', () => {
        if (dateInputRef.current) {
          dateInputRef.current.type = 'text';
        }
      }, { once: true });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hash) return;

    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!datePattern.test(dateOfBirth)) {
      toast({
        title: 'Invalid Date',
        description: 'Please enter a valid date in MM/DD/YYYY format.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyPatient(hash, {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
      });

      if (response.verified) {
        setIsVerified(true);
        navigate(`/intake/${hash}/form`);
      } else {
        toast({
          title: 'Verification Failed',
          description: 'The details you provided do not match our records. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={organization.logoUrl}
            alt={organization.orgName}
            className="h-32 w-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">{organization.orgName}</h1>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Verification</h2>
            <p className="text-sm text-gray-600">
              Please verify your identity to access your healthcare information
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors z-10"
                  onClick={handleCalendarClick}
                />
                <Input
                  ref={dateInputRef}
                  id="dateOfBirth"
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={dateOfBirth}
                  onChange={handleDateChange}
                  required
                  className="pl-10"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Identity'}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            Your information is protected and encrypted for your security
          </p>
        </Card>
      </div>
    </div>
  );
}