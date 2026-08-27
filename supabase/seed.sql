-- Seed file: creates a demo workspace and sample data.
-- Runs after migrations during `supabase db reset`.
-- Uses a placeholder user ID that will be replaced at runtime via auth.uid().

-- ---------------------------------------------------------------------------
-- 1. Demo workspace
-- ---------------------------------------------------------------------------

insert into public.workspaces (id, name, slug, retention_policy_days, data_region)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Acme Pentest Co',
  'acme-pentest',
  365,
  'us-east-1'
) on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Demo clients (for the demo workspace)
-- ---------------------------------------------------------------------------

insert into public.clients (id, workspace_id, name, code, confidentiality_default)
values
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Acme Corp',
    'ACME',
    'confidential'
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Globex Industries',
    'GLBX',
    'restricted'
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Initech Systems',
    'INIT',
    'internal'
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 3. Demo engagements
-- ---------------------------------------------------------------------------

insert into public.engagements (
  id, workspace_id, client_id, name, short_code, type,
  methodology, scope_text, start_date, status, classification
)
values
  (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Acme Web App Pentest',
    'ACME-WEB',
    'webapp',
    'owasp_wstg',
    'https://app.acme.example.com
*.staging.acme.example.com
API: https://api.acme.example.com/v1/*',
    '2026-08-01',
    'testing',
    'confidential'
  ),
  (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Globex API Security Review',
    'GLBX-API',
    'api',
    'owasp_wstg',
    'REST API endpoints at api.globex.internal:8443',
    '2026-08-10',
    'scoping',
    'restricted'
  ),
  (
    'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Initech Network Penetration Test',
    'INIT-NET',
    'network',
    'ptes',
    '10.0.0.0/8 — internal corporate network',
    '2026-07-15',
    'reporting',
    'internal'
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 4. Demo findings (for Acme Web App engagement)
-- ---------------------------------------------------------------------------

insert into public.findings (
  id, display_id, engagement_id, title,
  cvss_version, cvss_vector, cvss_base_score, severity,
  cwe_ids, owasp_categories,
  description, impact, remediation,
  status, author_id
)
values
  (
    'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'FIND-001',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'SQL Injection in Login Form',
    '3.1',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    9.8,
    'critical',
    ARRAY['CWE-89'],
    ARRAY['A03:2021-Injection'],
    'The login form at /api/auth/login does not properly sanitize user input, allowing an attacker to inject arbitrary SQL queries via the username parameter. This enables full database read/write access.',
    'Complete compromise of the authentication database, including hashed passwords, session tokens, and PII for all registered users.',
    'Use parameterized queries or an ORM for all database interactions. Implement input validation and WAF rules as defense-in-depth.',
    'in_review',
    null
  ),
  (
    'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    'FIND-002',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Reflected XSS in Search Results',
    '3.1',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
    6.1,
    'medium',
    ARRAY['CWE-79'],
    ARRAY['A07:2021-Identification and Authentication Failures'],
    'The search results page reflects user-supplied query terms without proper encoding, enabling execution of arbitrary JavaScript in the victim''s browser context.',
    'An attacker can craft a malicious link that, when clicked by an authenticated user, steals their session token or performs actions on their behalf.',
    'Implement context-aware output encoding on all user-supplied data rendered in HTML. Use Content-Security-Policy headers as defense-in-depth.',
    'draft',
    null
  ),
  (
    'd9eebc99-9c0b-4ef8-bb6d-6bb9bd380ab0',
    'FIND-003',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Missing Rate Limiting on Password Reset',
    '3.1',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
    5.3,
    'low',
    ARRAY['CWE-307'],
    ARRAY['A07:2021-Identification and Authentication Failures'],
    'The password reset endpoint /api/auth/reset-password accepts unlimited requests without any rate limiting or CAPTCHA, allowing brute-force enumeration of email addresses and email flooding.',
    'Attackers can enumerate valid email addresses and flood users with password reset emails, causing denial of service and user harassment.',
    'Implement rate limiting (e.g., 5 requests per hour per IP/email). Add CAPTCHA verification. Return generic responses to prevent email enumeration.',
    'draft',
    null
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 5. Demo affected assets
-- ---------------------------------------------------------------------------

insert into public.affected_assets (finding_id, asset_type, identifier, environment, notes)
values
  ('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'endpoint', '/api/auth/login', 'prod', 'POST endpoint accepting username and password fields'),
  ('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'url', 'https://app.acme.example.com/search?q=test', 'prod', 'Search query parameter reflected without encoding'),
  ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380ab0', 'endpoint', '/api/auth/reset-password', 'prod', 'Password reset request endpoint')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 6. Demo finding templates
-- ---------------------------------------------------------------------------

insert into public.finding_templates (
  workspace_id, title, default_cvss_vector,
  description, impact, remediation,
  cwe_ids, owasp_categories, tags
)
values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SQL Injection',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    'The application is vulnerable to SQL injection through unsanitized user input passed to database queries.',
    'Full database compromise including read/write access to all tables, potential for data exfiltration and authentication bypass.',
    'Use parameterized queries or prepared statements. Validate and sanitize all user inputs. Apply principle of least privilege to database accounts.',
    ARRAY['CWE-89'],
    ARRAY['A03:2021-Injection'],
    ARRAY['sqli', 'owasp-top10', 'critical']
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Cross-Site Scripting (XSS)',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
    'The application reflects or stores user-supplied content without proper encoding, enabling script injection.',
    'Session hijacking, credential theft, defacement, or phishing attacks against users.',
    'Implement context-aware output encoding. Use Content-Security-Policy headers. Validate and sanitize all user inputs.',
    ARRAY['CWE-79'],
    ARRAY['A07:2021-Identification and Authentication Failures'],
    ARRAY['xss', 'owasp-top10']
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Broken Access Control',
    'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
    'The application fails to properly enforce authorization checks, allowing users to access resources beyond their intended permissions.',
    'Unauthorized access to sensitive data, privilege escalation, and potential full account takeover.',
    'Implement server-side authorization checks for every request. Deny by default. Use RBAC or ABAC. Audit access control regularly.',
    ARRAY['CWE-284'],
    ARRAY['A01:2021-Broken Access Control'],
    ARRAY['idor', 'privilege-escalation', 'owasp-top10']
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 7. Demo report document
-- ---------------------------------------------------------------------------

insert into public.report_documents (
  id, engagement_id, report_template_id, title, classification, status
)
values
  (
    'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'standard-pentest',
    'Acme Corp — Web Application Penetration Test Report',
    'confidential',
    'draft'
  )
on conflict do nothing;

insert into public.document_versions (
  document_id, version_label, content_json, created_by, is_immutable
)
values
  (
    'e7eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    '1.0',
    '{"sections": ["executive_summary", "methodology", "findings", "recommendations", "appendix"]}',
    null,
    false
  )
on conflict do nothing;
