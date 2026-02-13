# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Dalingcebo Art Shop, please report it by emailing **info@dalingcebo.art**. Do not create a public GitHub issue.

We take all security reports seriously and will respond within 48 hours.

## Security Measures

### Application Security

#### Authentication & Authorization
- User authentication handled by Supabase Auth
- Row Level Security (RLS) policies enforced in database
- Admin routes protected with access key
- Session management with secure cookies
- Password requirements enforced by Supabase

#### Payment Security
- PCI DSS compliant payment processing via Stripe
- Payment data never stored on our servers
- Webhook signature verification for all payment events
- Test mode and production keys separated
- Rate limiting on payment endpoints (10 requests/minute per IP)

#### API Security
- Rate limiting implemented on sensitive endpoints
- CORS configured appropriately
- Request validation on all API routes
- No sensitive data exposed in client-side code
- Environment variables properly secured

### Infrastructure Security

#### Network Security
- HTTPS enforced in production (configured via hosting)
- Security headers configured in `next.config.ts`:
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options (SAMEORIGIN)
  - X-Content-Type-Options (nosniff)
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

#### Data Security
- Database encryption at rest (Supabase)
- SSL/TLS encryption in transit
- Sensitive environment variables never committed
- API keys rotated regularly
- Database backups configured

### Development Security

#### Code Security
- Dependencies regularly updated
- Security audits run via `npm audit`
- No hardcoded secrets in source code
- Input validation on all forms
- SQL injection prevention (parameterized queries)
- XSS protection (React's built-in escaping)

#### Access Control
- Least privilege principle applied
- Service role keys used only server-side
- Public keys used only for client-side operations
- Admin access logged and monitored

## Security Best Practices

### For Administrators

1. **Environment Variables**
   - Never share `.env` files
   - Rotate API keys every 90 days
   - Use strong, unique admin passwords
   - Keep `ADMIN_KEY` secret (server-only, never exposed to client)

2. **Database**
   - Review RLS policies regularly
   - Monitor database queries for anomalies
   - Keep Supabase dashboard access secure
   - Enable 2FA on Supabase account

3. **Payments**
   - Monitor Stripe dashboard for unusual activity
   - Review failed payments regularly
   - Keep webhook secrets secure
   - Test refund processes periodically

4. **Monitoring**
   - Review error logs weekly
   - Monitor failed login attempts
   - Check for unusual API usage
   - Review webhook delivery logs

### For Developers

1. **Before Committing**
   - Check for exposed secrets: `git diff`
   - Never commit `.env` files
   - Review all code changes
   - Run security audit: `npm audit`

2. **Dependencies**
   - Update dependencies monthly
   - Review dependency advisories
   - Use exact versions in production
   - Audit new dependencies before adding

3. **Testing**
   - Test authentication flows
   - Verify authorization checks
   - Test rate limiting
   - Check for XSS vulnerabilities

## Known Security Considerations

### Rate Limiting
- Current implementation uses in-memory storage
- Consider Redis for distributed systems
- Rate limits: 10 requests/minute for payments

### Session Management
- Sessions handled by Supabase Auth
- Session timeout: 1 hour (default)
- Refresh tokens: 7 days (default)

### File Uploads
- File uploads handled by Supabase Storage
- Size limits enforced
- File type validation implemented
- Malicious file scanning recommended for production

## Security Checklist

Before deploying to production:

- [ ] All environment variables properly set
- [ ] Stripe webhook signatures verified
- [ ] Admin access key changed from default
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Dependencies up to date
- [ ] `npm audit` shows no vulnerabilities
- [ ] RLS policies tested
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Error logging configured
- [ ] 2FA enabled on critical accounts

## Incident Response

If a security incident occurs:

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve logs and evidence
   - Notify technical lead
   - Document the incident

2. **Investigation**
   - Determine scope of breach
   - Identify vulnerability
   - Assess data exposure
   - Review logs

3. **Remediation**
   - Patch vulnerability
   - Rotate compromised credentials
   - Update security measures
   - Test fixes

4. **Communication**
   - Notify affected users if required
   - Update security documentation
   - Conduct post-mortem
   - Implement preventive measures

## Security Updates

This security policy is reviewed quarterly and updated as needed.

**Last Updated:** February 2025  
**Version:** 1.0

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying#security-headers)
- [Stripe Security](https://stripe.com/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

## Contact

For security concerns or questions, contact:  
**Email:** info@dalingcebo.art

---

*We appreciate responsible disclosure of security vulnerabilities.*
