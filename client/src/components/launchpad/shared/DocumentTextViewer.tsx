import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface DocumentTextViewerProps {
  url: string;
  filename?: string;
}

export default function DocumentTextViewer({ url, filename }: DocumentTextViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching text document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchTextContent();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.open(url, '_blank')}>
          Open in New Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filename and actions */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm text-muted-foreground">
          {filename || 'Text Document'} ({content.length.toLocaleString()} characters)
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(url, '_blank')}
        >
          Open in New Tab
        </Button>
      </div>
      
      {/* Text content */}
      <div className="max-h-[50vh] overflow-auto border rounded-md p-4 bg-muted/20">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
