
# Auth System Migration Guide

## Overview
This guide documents the migration from the legacy `useAuth` system to the new `useAuthRBAC` system. The migration is designed to be gradual and safe, with comprehensive monitoring and rollback capabilities.

## Current System Architecture

### Legacy System (`useAuth`)
- **Location**: `src/hooks/useAuth.ts` and `src/contexts/AuthContext.tsx`
- **Components**: 177 components currently using this system
- **Status**: Deprecated but maintained for compatibility

### New System (`useAuthRBAC`)
- **Location**: `src/contexts/AuthRBACContext.tsx`
- **Features**: Enhanced role-based access control, better performance, unified interface
- **Status**: Active and recommended

### Compatibility Layer
- **Purpose**: Allows seamless transition between systems
- **Implementation**: Legacy hooks wrap new system
- **Monitoring**: Comprehensive logging and metrics

## Migration Phases

### Phase 1: Foundation Stabilization ✅
**Status**: Complete
**Duration**: Week 1
**Objectives**:
- Validate compatibility layer
- Implement monitoring systems
- Document current state
- Set up safety measures

**Key Achievements**:
- Migration monitoring system implemented
- Compatibility validator created
- Dashboard for tracking progress
- Documentation established

### Phase 2: High-Impact Component Migration
**Status**: Planned
**Duration**: Week 2
**Target Components**: 
- Navigation (NavbarAuthButtons, MobileUserProfile, NavigationItems)
- Layout (PatientLayout, DashboardLayout)
- Profile (ProfileHeader, PersonalInfoTab, ApprovalStatusBanner)

### Phase 3: Feature-Specific Migration
**Status**: Planned
**Duration**: Week 3
**Target Areas**:
- Authentication & Security components
- Booking & Calendar components
- Profile Management components

### Phase 4: Therapist-Specific Migration
**Status**: Planned
**Duration**: Week 4
**Target Areas**:
- Therapist Dashboard components
- Caseload Management components

### Phase 5: Final Cleanup
**Status**: Planned
**Duration**: Week 5
**Objectives**:
- Migrate remaining components
- Remove compatibility layer
- Performance optimization

## Migration Process

### For Each Component:
1. **Identify**: Select component for migration
2. **Update**: Change import from `useAuth` to `useAuthRBAC`
3. **Test**: Verify functionality in development
4. **Monitor**: Check for any issues using dashboard
5. **Deploy**: Push to staging/production
6. **Validate**: Confirm no regressions

### Code Changes Required:
```typescript
// Before
import { useAuth } from '@/contexts/AuthContext';
const { user, loading, isAdmin } = useAuth();

// After
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
const { user, loading, isAdmin } = useAuthRBAC();
```

## Monitoring and Validation

### Migration Dashboard
- **Location**: Available at `/migration-dashboard` (admin only)
- **Features**: 
  - Real-time progress tracking
  - Error monitoring
  - Performance metrics
  - Event logging

### Compatibility Validator
- **Purpose**: Ensures compatibility layer works correctly
- **Features**:
  - Automated validation checks
  - Performance monitoring
  - Issue detection

### Key Metrics:
- **Progress**: 0/177 components migrated (0.0%)
- **Compatibility Usage**: 177 components
- **System Errors**: 0
- **Performance**: Auth checks averaging <50ms

## Safety Measures

### Rollback Strategy
1. **Immediate Rollback**: Revert to previous deployment if critical issues arise
2. **Component-Level Rollback**: Revert specific component imports if needed
3. **Full System Rollback**: Re-enable compatibility layer entirely

### Testing Requirements
- Unit tests for each migrated component
- Integration tests for authentication flows
- E2E tests for critical user journeys
- Performance regression tests

### Risk Mitigation
- **Low Risk**: Display-only components, simple role checks
- **Medium Risk**: Navigation and routing components
- **High Risk**: Authentication forms, admin panels

## Component Categories

### Critical Auth Infrastructure (Already Migrated)
- AppRouter ✅
- AuthRBACProvider ✅
- Core authentication flows ✅

### High-Impact Components (Phase 2)
- Navigation components (15 components)
- Layout components (8 components)
- Profile components (12 components)

### Feature-Specific Components (Phase 3)
- Authentication & Security (18 components)
- Booking & Calendar (25 components)
- Profile Management (20 components)

### Therapist-Specific Components (Phase 4)
- Dashboard components (22 components)
- Caseload management (18 components)
- Analytics and reporting (15 components)

### Remaining Components (Phase 5)
- Utility components (24 components)
- Video conference components (8 components)
- Notification systems (12 components)

## Success Criteria

### Technical Metrics:
- Zero authentication failures
- No increase in page load times
- All tests passing
- TypeScript compilation successful

### User Experience:
- Seamless login/logout experience
- Proper role-based access control
- No broken navigation
- Consistent UI behavior

### Performance:
- Auth checks < 50ms average
- Role checks < 30ms average
- Permission checks < 20ms average

## Troubleshooting

### Common Issues:
1. **Import Errors**: Ensure correct import path for `useAuthRBAC`
2. **Type Mismatches**: Verify all properties exist in new system
3. **Performance Issues**: Check for unnecessary re-renders
4. **Role Check Failures**: Validate role data integrity

### Debug Tools:
- Migration Dashboard for real-time monitoring
- Browser console for deprecation warnings
- Compatibility Validator for validation checks
- Performance measurement tools

## Support and Resources

### Documentation:
- This migration guide
- API documentation for `useAuthRBAC`
- Troubleshooting guide
- Component-specific migration notes

### Monitoring:
- Migration Dashboard: Real-time progress and health
- Error tracking: Automated issue detection
- Performance monitoring: Response time tracking
- Event logging: Comprehensive activity tracking

### Team Communication:
- Daily migration reports
- Weekly progress reviews
- Issue escalation procedures
- Success milestone celebrations

---

*Last updated: Phase 1 completion*  
*Next milestone: Phase 2 High-Impact Component Migration*
