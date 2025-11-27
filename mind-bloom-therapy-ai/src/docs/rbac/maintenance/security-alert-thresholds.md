
# RBAC Security Alert Thresholds

This document defines security alert thresholds for the RBAC system to detect and respond to potential security issues.

## Access Control Violations

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| Multiple Access Denials | 5+ in 10 minutes for same user | Medium | Detects potential brute force attempts to access unauthorized resources |
| Abnormal Resource Access | Any access to critical resources during non-business hours | High | Detects suspicious access to sensitive resources outside normal hours |
| Unusual Permission Usage | First use of high-privilege permission | Medium | Alerts when rarely-used permissions are exercised |
| Permission Bypassing Attempt | Any direct database access bypassing RBAC checks | Critical | Detects attempts to circumvent permission checks |
| Cross-Role Access Attempt | 3+ accesses to resources from different roles within 5 minutes | High | Detects potential compromised account switching between roles |

## Role Management Alerts

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| Admin Role Assignment | Any new admin role assignment | High | Alerts when a new user is given admin privileges |
| Rapid Role Changes | 3+ role changes for a user within 1 hour | Medium | Detects suspicious role manipulation |
| Role Removal Alert | Any removal of a critical role (admin, therapist) | High | Alerts when important roles are removed |
| Mass Role Changes | 10+ role changes within 10 minutes | Critical | Detects potential mass permission changes that could indicate compromise |
| Self-Promotion Attempt | User attempting to elevate their own roles | Critical | Detects attempts to self-promote to higher privilege roles |

## Authentication-Related Alerts

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| Invalid Token Usage | 3+ invalid token attempts within 5 minutes | Medium | Detects potential stolen/expired token usage |
| Session Anomalies | Authentication from new location for privileged user | Medium | Alerts on geographic anomalies for sensitive roles |
| Concurrent Sessions | 3+ active sessions for a single user | Low | Detects potential credential sharing |
| Off-Hours Authentication | Admin login outside business hours (configurable) | Medium | Alerts on time-based anomalies for administrative access |
| Failed Authentication Spike | 5+ failed logins within 10 minutes | Medium | Detects potential brute force login attempts |

## System Integrity Alerts

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| Role Inconsistency | Any detected role inconsistency | High | Alerts when roles in database don't match metadata or profile |
| RBAC Configuration Change | Any change to role definitions or permissions | Medium | Detects changes to the RBAC system configuration |
| Database Role Manipulation | Direct changes to role tables outside of application | Critical | Detects database-level tampering with role assignments |
| Permission Definition Change | Any change to permission definitions | Medium | Alerts when permission structure is modified |
| RLS Policy Change | Any modification to Row Level Security policies | Critical | Detects changes to database security policies |

## Performance and Availability Alerts

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| RBAC System Latency | Permission checks taking >500ms for 5+ minutes | Medium | Detects RBAC performance issues that could affect security |
| Role Cache Failure | Cache hit rate drops below 80% | Low | Alerts when role caching is not functioning properly |
| API Rate Limiting Triggered | RBAC API rate limit triggered | Medium | Detects potential DoS attempts against RBAC systems |
| Role Sync Failures | 3+ consecutive role sync failures | Medium | Alerts when role synchronization is failing |
| Database Connection Issues | Any RBAC database connection failure | High | Detects connectivity issues that could create security gaps |

## Data Access Alerts

| Alert | Threshold | Severity | Description |
|-------|-----------|----------|-------------|
| Sensitive Data Access Volume | User accessing >100 patient records in 1 hour | Medium | Detects potential data harvesting/exfiltration |
| Unusual Data Export | Any export of role or permission data | Medium | Alerts on attempts to map the security system |
| After-Hours Data Access | Bulk data access outside business hours | Medium | Detects suspicious timing of data access |
| Cross-Patient Access | Therapist accessing patients not assigned to them | High | Detects potential inappropriate data access |
| Unusual Permission Pattern | Accessing resources in an unusual sequence | Low | Detects behavior-based anomalies in resource access |

## Implementation Guidelines

### Alert Configuration

For each alert, implement the following settings:

1. **Threshold**: The specific conditions that trigger the alert
2. **Cooldown Period**: Time before the same alert can be triggered again
3. **Auto-Resolution**: Whether the alert auto-resolves and under what conditions
4. **Notification Channels**: Where alerts should be sent (email, SMS, dashboard, etc.)
5. **Response Instructions**: Link to specific response procedures for each alert type

### Alert Prioritization

Severity levels determine response priority:

- **Critical**: Immediate response required (24/7)
- **High**: Response required within 1 hour
- **Medium**: Response required within 24 hours
- **Low**: Investigation required within 1 week

### Alert Context

Each alert should include:

1. **User Information**: User ID, name, and roles
2. **Resource Details**: What resource was being accessed
3. **Action Information**: What operation was attempted
4. **Metadata**: IP address, device information, timestamp
5. **Historical Context**: Previous similar alerts for this user/resource

## Alert Response Procedures

### Critical Alerts

1. **Immediate Notification**: Security team notified via high-priority channels
2. **Automatic Actions**: 
   - Temporarily restrict further role changes
   - Log all user actions at debug level
   - Activate additional monitoring
3. **Required Response**: 
   - Acknowledge alert within 15 minutes
   - Begin investigation immediately
   - Lock user account if suspicious activity confirmed
   - Document incident and response

### High Alerts

1. **Notification**: Security team notified via standard channels
2. **Automatic Actions**:
   - Flag user account for monitoring
   - Log all related activity
3. **Required Response**:
   - Acknowledge alert within 1 hour
   - Investigate within 4 hours
   - Document findings and actions

### Medium Alerts

1. **Notification**: Daily security digest with all medium alerts
2. **Required Response**:
   - Review within 24 hours
   - Determine if further investigation needed
   - Update alert rules if generating false positives

### Low Alerts

1. **Notification**: Weekly security digest
2. **Required Response**:
   - Review within 1 week
   - Look for patterns across multiple low alerts
   - Adjust thresholds as needed

## Alert Tuning Process

To reduce false positives and ensure alerts remain effective:

1. **Weekly Review**: Analyze all alerts from the past week
2. **False Positive Analysis**: Identify and address sources of false positives
3. **Threshold Adjustment**: Adjust thresholds based on patterns observed
4. **New Alert Development**: Create new alerts for emerging threats
5. **Alert Retirement**: Remove alerts that no longer provide value

## Integration with External Systems

### SIEM Integration

Security Information and Event Management (SIEM) integration:

1. Forward all RBAC security alerts to SIEM
2. Correlate RBAC alerts with other security events
3. Maintain alert history for compliance reporting

### Incident Management Integration

1. Create incidents automatically for critical and high alerts
2. Link alerts to relevant knowledge base articles
3. Track metrics on alert response and resolution

### Reporting Requirements

1. **Daily Security Report**: Summary of all alerts in the past 24 hours
2. **Weekly Trend Analysis**: Patterns and trends in security alerts
3. **Monthly Security Review**: Comprehensive review of alert effectiveness
4. **Quarterly Compliance Report**: Summary of alerts and responses for compliance

By maintaining these security alert thresholds and following proper response procedures, we can ensure timely detection and response to potential security issues in the RBAC system.
