# Security Policy

## Codex Agentic - Security Guidelines

**Project**: Codex Agentic (OpenAI Codex CLI + Miyabi Framework Integration)
**Version**: 0.1.0
**Last Updated**: 2025-10-10

---

## 🔐 Security Overview

Codex Agentic takes security seriously. This document outlines our security practices, vulnerability reporting procedures, and compliance guidelines.

### Security Principles

1. **Sandboxed Execution**: All code execution runs in isolated environments
2. **Least Privilege**: Agents operate with minimum required permissions
3. **Budget Controls**: Economic circuit breakers prevent runaway costs
4. **Audit Logging**: Comprehensive activity tracking
5. **Secrets Management**: Secure handling of API keys and tokens

---

## 🚨 Reporting Security Vulnerabilities

### Reporting Process

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** create a public GitHub issue
2. **DO** report privately via one of these methods:
   - Email: [security@example.com](mailto:security@example.com)
   - GitHub Security Advisories: https://github.com/ShunsukeHayashi/codex/security/advisories
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 7 days
- **Fix Implementation**: Varies by severity (see below)
- **Public Disclosure**: After fix is deployed

### Severity Levels

| Severity | Response Time | Example |
|----------|---------------|---------|
| **Critical** | 24 hours | Remote code execution, data breach |
| **High** | 7 days | Authentication bypass, privilege escalation |
| **Medium** | 30 days | Information disclosure, DoS |
| **Low** | 90 days | Minor information leaks |

---

## 🛡️ Security Features

### 1. Sandboxed Code Execution

**Rust-based Sandbox**:
- **macOS**: Seatbelt (Apple Sandbox)
- **Linux**: Landlock LSM
- **Restrictions**:
  - File system access (read-only by default)
  - Network access (controlled)
  - Process spawning (limited)

**Configuration**:
```toml
# ~/.codex/config.toml
[sandbox]
mode = "strict"  # Options: strict, permissive, disabled
read_only_paths = ["/src", "/tests"]
writable_paths = ["/tmp"]
```

### 2. Secrets Management

**Best Practices**:
- ✅ Use environment variables for API keys
- ✅ Never commit secrets to version control
- ✅ Rotate tokens regularly (90 days)
- ✅ Use GitHub Secrets for CI/CD
- ❌ Never hardcode credentials

**Environment Variables**:
```bash
export GITHUB_TOKEN="ghp_xxx"
export ANTHROPIC_API_KEY="sk-ant-xxx"
```

**Gitleaks Integration**:
```bash
# Run secret scanning
gitleaks detect --source . --verbose
```

### 3. Budget Circuit Breaker

**Economic Security**:
```toml
[miyabi]
monthly_budget_usd = 500

[miyabi.thresholds]
warning = 0.8      # 80% warning
emergency = 1.5    # 150% emergency stop

[[miyabi.emergency_actions]]
disable_workflows = [
  "agent-runner.yml",
  "continuous-improvement.yml"
]
```

**Circuit Breaker Behavior**:
- **80% threshold**: Warning logged, notifications sent
- **100% threshold**: Non-critical operations paused
- **150% threshold**: ALL automated operations stopped

### 4. Access Control

**Agent Permissions** (識学理論 - Shikigaku Theory):
- **Coordinator**: Decision authority only
- **Specialists**: Execution within scope
- **Support**: Read-only by default

**GitHub Token Scopes** (Minimum Required):
```
repo              # Repository access
workflow          # GitHub Actions
read:org          # Organization membership
read:project      # Projects V2
```

### 5. Audit Logging

**Logged Activities**:
- Agent invocations
- GitHub API calls
- Budget spending
- Security scans
- Access denials

**Log Location**: `~/.codex/logs/audit.log`

---

## 🔍 Security Scanning

### Automated Scans

#### 1. Dependency Scanning

**npm audit** (TypeScript):
```bash
cd sdk/typescript
pnpm audit --audit-level=high

# Current Status: ✅ No known vulnerabilities
```

**cargo audit** (Rust):
```bash
cd codex-rs
cargo audit

# Scheduled: Weekly via GitHub Actions
```

#### 2. Secret Scanning

**Gitleaks**:
```bash
gitleaks detect --source . --verbose --redact
```

**GitHub Secret Scanning**:
- Enabled for all repositories
- Automatic token revocation alerts
- Partner pattern matching

#### 3. Code Quality

**Static Analysis**:
- **Rust**: Clippy with security lints
- **TypeScript**: ESLint with security plugins

**Configuration**:
```bash
# Rust security lints
cargo clippy -- -D warnings -W clippy::unwrap_used

# TypeScript security
eslint --plugin security src/**/*.ts
```

### 4. SBOM Generation

**Software Bill of Materials**:
```bash
# Generate SBOM (CycloneDX format)
cyclonedx-bom --input package.json --output sbom.json

# Verify dependencies
cyclonedx-cli validate --input-file sbom.json
```

---

## ✅ Security Checklist

### Pre-Deployment

- [ ] All tests passing (unit + integration)
- [ ] No high/critical vulnerabilities (`pnpm audit`)
- [ ] No secrets committed (`gitleaks detect`)
- [ ] SBOM generated and verified
- [ ] Security documentation updated
- [ ] License compliance verified

### Release Process

- [ ] Security review by Security Lead
- [ ] Guardian approval (M6 milestone)
- [ ] Changelog includes security fixes
- [ ] CVE assignments (if applicable)
- [ ] Public disclosure coordinated

### Continuous Monitoring

- [ ] Weekly dependency scans
- [ ] Daily secret scans (GitHub Actions)
- [ ] Monthly security audits
- [ ] Quarterly penetration testing

---

## 🔒 Compliance

### License Compliance

**Project Licenses**:
- **Codex CLI** (Original): Apache-2.0
- **Miyabi Integration** (Derivative): Apache-2.0
- **Dependencies**: Various (see `LICENSE` files)

**Third-Party Notices**:
```bash
# Generate license report
pnpm licenses list > THIRD_PARTY_LICENSES.txt
```

### Data Privacy

**Data Handling**:
- ✅ No personal data collected by default
- ✅ API keys stored locally (`~/.codex/config.toml`)
- ✅ Logs do not contain sensitive data
- ❌ No telemetry sent without consent

**GDPR Compliance**:
- Right to data deletion: `rm -rf ~/.codex`
- Data portability: All data is local
- Consent: Explicit for any external services

---

## 🚀 Security Updates

### Update Policy

- **Critical Security Fixes**: Released immediately
- **High Priority Fixes**: Within 7 days
- **Regular Updates**: Monthly cadence
- **EOL Policy**: LTS releases supported for 12 months

### Notification Channels

- GitHub Security Advisories
- Release Notes
- CHANGELOG.md
- Email notifications (if subscribed)

---

## 📚 Security Resources

### Documentation

- [Sandbox & Approvals](./docs/sandbox.md)
- [Authentication](./docs/authentication.md)
- [Configuration](./docs/config.md)
- [INTEGRATION_PLAN_MIYABI.md](./INTEGRATION_PLAN_MIYABI.md)

### External References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Rust Security Guidelines](https://anssi-fr.github.io/rust-guide/)

---

## 🤝 Security Team

### Roles

- **Security Lead**: @ShunsukeHayashi
- **Code Reviewers**: All contributors
- **Incident Response**: Core team

### Contact

- **General Security**: security@example.com
- **Emergency**: security-urgent@example.com
- **PGP Key**: [Available on request]

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-10 | Initial security policy for Phase 6 |

---

## ⚖️ Legal

### Responsible Disclosure

We follow coordinated vulnerability disclosure practices:
1. Private report to security team
2. Acknowledge receipt within 48 hours
3. Work together on fix
4. Public disclosure after fix deployment
5. Credit security researcher (if desired)

### Bug Bounty

Currently, we do not operate a formal bug bounty program. However, we deeply appreciate security research and will:
- Publicly acknowledge contributions
- Provide detailed feedback
- Consider compensation for exceptional findings

---

## 🔐 Encryption

### Data at Rest

- **API Keys**: Stored in plain text in `~/.codex/config.toml`
  - **Recommendation**: Use OS keychain integration (future feature)
- **Logs**: Unencrypted (no sensitive data logged)
- **Session Data**: Unencrypted (local only)

### Data in Transit

- **GitHub API**: HTTPS only (TLS 1.2+)
- **Anthropic API**: HTTPS only (TLS 1.2+)
- **MCP Protocol**: Local stdio (no network transmission)

---

## 🎯 Security Roadmap

### Phase 6 (Current) - Security Hardening
- ✅ Dependency scanning integration
- ✅ Security policy documentation
- ⏳ SBOM generation
- ⏳ Automated security workflows

### Future Enhancements
- OS keychain integration for secrets
- Code signing for releases
- Security audit automation
- Formal bug bounty program
- SOC 2 compliance

---

**Last Review**: 2025-10-10
**Next Review**: 2025-11-10 (Monthly)
**Security Lead Approval**: @ShunsukeHayashi ✅
