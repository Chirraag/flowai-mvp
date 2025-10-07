import { useEffect, useState, createContext, useContext } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { fetchIntakeData, type IntakeData } from '@/lib/intake.api';
import VerificationPage from './verification';
import IntakeFormPage from './form';

interface IntakeContextType {
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  patientData: {
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  setPatientData: (data: IntakeContextType['patientData']) => void;
}

const IntakeContext = createContext<IntakeContextType | null>(null);

export const useIntakeContext = () => {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error('useIntakeContext must be used within IntakePage');
  }
  return context;
};

export default function IntakePage() {
  const { hash } = useParams<{ hash: string }>();
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [patientData, setPatientData] = useState<{
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);

  useEffect(() => {
    if (!hash) return;

    const loadIntakeData = async () => {
      try {
        const response = await fetchIntakeData(hash);

        if (response.data.status === 'completed') {
          setError('This intake request has already been completed.');
        } else if (response.data.status === 'expired') {
          setError('This intake link has expired.');
        } else {
          setIntakeData(response.data);
        }
      } catch (err) {
        setError('Failed to load intake information. Please check the link and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadIntakeData();
  }, [hash]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !intakeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Access Form</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <IntakeContext.Provider value={{ isVerified, setIsVerified, patientData, setPatientData }}>
      <Routes>
        <Route path="/" element={<VerificationPage organization={intakeData.organization} />} />
        <Route
          path="/form"
          element={
            isVerified ? (
              <IntakeFormPage
                organization={intakeData.organization}
                intakeForm={intakeData.intakeForm}
              />
            ) : (
              <Navigate to={`/intake/${hash}`} replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={`/intake/${hash}`} replace />} />
      </Routes>
    </IntakeContext.Provider>
  );
}