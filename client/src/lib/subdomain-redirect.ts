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
 * @param token - Optional JWT token to append to the URL
 */
export function redirectToOrgSubdomain(orgName: string, token?: string): void {
  const subdomain = orgNameToSubdomain(orgName);
  let targetUrl = `https://${subdomain}.myflowai.com`;

  // Append token if provided
  if (token) {
    targetUrl += `?token=${encodeURIComponent(token)}`;
  }

  console.log(`Redirecting to organization subdomain: ${targetUrl}`);
  window.location.href = targetUrl;
}

/**
 * Checks if a redirect to org subdomain is needed
 * ONLY redirects for "Precision Imaging" organization
 * @param orgName - The organization name from the auth response
 * @returns true if redirect is needed, false otherwise
 */
export function shouldRedirectToOrgSubdomain(orgName: string): boolean {
  // Only redirect for Precision Imaging
  if (orgName !== "Precision Imaging") {
    return false;
  }

  const subdomain = orgNameToSubdomain(orgName);
  const currentHost = window.location.hostname;
  const expectedHost = `${subdomain}.myflowai.com`;

  // Don't redirect if we're already on the correct subdomain
  // or if we're in development (localhost)
  return currentHost !== expectedHost && !currentHost.includes('localhost');
}
