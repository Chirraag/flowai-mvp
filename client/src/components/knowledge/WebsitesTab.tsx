import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Plus } from "lucide-react";

/**
 * WebsitesTab
 * - Website crawling and indexing configuration
 * - Mirrors the launchpad tab styling with minimal content
 */
export type WebsitesTabHandle = {
  getValues: () => { websiteUrl: string; autoCrawl: boolean };
  validate: () => { valid: boolean; errors: string[] };
};

const WebsitesTab = forwardRef<WebsitesTabHandle>((_props, ref) => {
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [autoCrawl, setAutoCrawl] = React.useState(false);

  useImperativeHandle(ref, () => ({
    getValues: () => ({ websiteUrl, autoCrawl }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Websites</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-crawl"
                checked={autoCrawl}
                onCheckedChange={(checked) => setAutoCrawl(checked === true)}
              />
              <Label htmlFor="auto-crawl" className="text-sm text-gray-700">
                Auto-crawl and index content
              </Label>
            </div>

            <Button variant="outline" className="w-full h-12">
              <Plus className="h-4 w-4 mr-2" />
              Add Website Source
            </Button>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Website indexing options coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default WebsitesTab;
