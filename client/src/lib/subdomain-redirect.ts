/**
 * Converts an organization name to a subdomain-safe format
 * Examples:
 * "Precision Imaging" -> "precision-imaging"
 * "ABC Medical Center" -> "abc-medical-center"
 */
export function orgNameToSubdomain(orgName: string): string {
  return orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Redirects to the organization-specific subdomain
 * @param orgName - The organization name from the auth response
 */
export function redirectToOrgSubdomain(orgName: string): void {
  const subdomain = orgNameToSubdomain(orgName);
  const targetUrl = `https://${subdomain}.myflowai.com`;

  console.log(`Redirecting to organization subdomain: ${targetUrl}`);
  window.location.href = targetUrl;
}

/**
 * Checks if a redirect to org subdomain is needed
 * @param orgName - The organization name from the auth response
 * @returns true if redirect is needed, false otherwise
 */
export function shouldRedirectToOrgSubdomain(orgName: string): boolean {
  const subdomain = orgNameToSubdomain(orgName);
  const currentHost = window.location.hostname;
  const expectedHost = `${subdomain}.myflowai.com`;

  // Don't redirect if we're already on the correct subdomain
  // or if we're in development (localhost)
  return currentHost !== expectedHost && !currentHost.includes('localhost');
}
