# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change (no functional changes)
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test updates
- [ ] 🔧 Configuration change
- [ ] 🚀 Build/deployment change

## Related Issues

<!-- Link related issues using keywords like "Fixes #123" or "Relates to #456" -->

Fixes #
Relates to #

## Changes Made

<!-- List the main changes made in this PR -->

- Change 1
- Change 2
- Change 3

## How Has This Been Tested?

<!-- Describe the tests you ran to verify your changes -->

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

### Test Configuration

- **Browser(s)**: 
- **Device(s)**: 
- **OS**: 

### Test Scenarios

1. Scenario 1
2. Scenario 2
3. Scenario 3

## Screenshots / Videos

<!-- If applicable, add screenshots or videos to demonstrate the changes -->

### Before


### After


## Checklist

<!-- Mark completed items with an "x" -->

### Code Quality

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have removed any console.log statements and debug code
- [ ] My code generates no new warnings or errors
- [ ] I have run `npm run lint` and fixed all issues
- [ ] I have run `npm run type-check` successfully

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested on multiple browsers (if frontend change)
- [ ] I have tested on mobile devices (if applicable)
- [ ] I have tested with different user roles (if applicable)

### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have added/updated JSDoc comments for public APIs
- [ ] I have updated the README.md if needed
- [ ] I have added/updated inline code comments where necessary

### Security & Performance

- [ ] My changes don't introduce security vulnerabilities
- [ ] I have validated all user inputs
- [ ] I have not exposed any sensitive information
- [ ] My changes don't negatively impact performance
- [ ] I have considered accessibility (a11y) requirements

### Dependencies

- [ ] I have updated package.json if dependencies were added/changed
- [ ] I have run `npm audit` and addressed any vulnerabilities
- [ ] Dependencies are properly licensed

### Database & Backend (if applicable)

- [ ] Database migrations are included and tested
- [ ] Edge functions are updated and deployed
- [ ] RLS policies are reviewed
- [ ] API changes are backward compatible (or breaking changes are documented)

## Breaking Changes

<!-- If this PR includes breaking changes, describe them here -->

<!-- 
Example:
- Changed API endpoint from `/api/users` to `/api/v2/users`
- Removed deprecated prop `oldProp` from Component
- Updated database schema - requires migration
-->

## Migration Steps

<!-- If migration is required, provide step-by-step instructions -->

1. Step 1
2. Step 2
3. Step 3

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No performance impact
- [ ] Improves performance
- [ ] May impact performance (describe below)

**Details:**

## Deployment Notes

<!-- Any special considerations for deployment? -->

- [ ] Requires environment variable changes (list below)
- [ ] Requires database migration
- [ ] Requires edge function redeployment
- [ ] Requires cache clearing
- [ ] Requires third-party service configuration

**Environment Variables:**
```
NEW_VAR_NAME=value
```

## Rollback Plan

<!-- Describe how to rollback these changes if issues arise -->

1. Revert step 1
2. Revert step 2

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Post-Merge Actions

<!-- Actions to take after merging this PR -->

- [ ] Update staging environment
- [ ] Monitor error tracking
- [ ] Update documentation site
- [ ] Notify team in Slack
- [ ] Create follow-up issues

---

## Reviewer Guidelines

### What to Review

- Code quality and style
- Test coverage
- Security implications
- Performance impact
- Documentation completeness
- Accessibility compliance

### Checklist for Reviewers

- [ ] Code follows project conventions
- [ ] Changes are well-tested
- [ ] Documentation is clear and complete
- [ ] No security concerns
- [ ] No performance regressions
- [ ] Breaking changes are properly documented

---

**Thank you for your contribution! 🚀**

