/**
 * University Domain Validation
 * 
 * Uses Hipo University Domains API as primary source
 * Falls back to local patterns for offline/demo mode
 * 
 * @see https://github.com/Hipo/university-domains-list
 */

import domainsConfig from './domains.json';

interface University {
  name: string;
  domain: string;
  country: string;
  alpha_two_code: string;
}

interface ValidationResult {
  valid: boolean;
  university?: University;
  error?: string;
}

/**
 * Validate an email domain against known university domains
 */
export async function validateEmailDomain(email: string): Promise<ValidationResult> {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valid: false, error: 'Invalid email format' };
  }

  // First check local whitelist (for demo/offline)
  const localMatch = domainsConfig.universities.find(
    uni => domain.endsWith(uni.domain)
  );
  
  if (localMatch) {
    return { valid: true, university: localMatch };
  }

  // Check common patterns
  const matchesPattern = domainsConfig.patterns.some(
    pattern => domain.endsWith(pattern)
  );

  if (!matchesPattern) {
    return { 
      valid: false, 
      error: 'Domain not recognized. Only university emails accepted.' 
    };
  }

  // Try Hipo API for specific university info
  try {
    const response = await fetch(
      `${domainsConfig.api.endpoint}?domain=${domain}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      // API failed but pattern matched, allow it
      return { valid: true };
    }

    const universities = await response.json();
    
    if (universities.length > 0) {
      return {
        valid: true,
        university: {
          name: universities[0].name,
          domain: universities[0].domains[0],
          country: universities[0].country,
          alpha_two_code: universities[0].alpha_two_code,
        }
      };
    }

    // Pattern matched but not in API - still allow (new universities)
    return { valid: true };
    
  } catch (error) {
    // API error but pattern matched - allow with warning
    console.warn('University API unavailable, using pattern match');
    return { valid: true };
  }
}

/**
 * Get university name from email (for display purposes)
 */
export async function getUniversityName(email: string): Promise<string | null> {
  const result = await validateEmailDomain(email);
  return result.university?.name ?? null;
}

/**
 * Quick sync check for common patterns (no API call)
 */
export function isLikelyStudentEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return domainsConfig.patterns.some(pattern => domain.endsWith(pattern));
}
