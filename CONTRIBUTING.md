# Contributing to MindBoom 3.0 - Twilio

Thank you for your interest in contributing to MindBoom 3.0! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Security Guidelines](#security-guidelines)
9. [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or bun
- Git
- Supabase CLI (for local development)
- Basic knowledge of React, TypeScript, and WebRTC

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy of the repository.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio.git
   cd MindBoom-3.0-Twilio
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/MindBoom-3.0-Twilio.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

6. **Start development server**

   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

We use Git Flow branching model:

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release preparation

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Define interfaces for all data structures
- Use meaningful variable and function names
- Avoid `any` types - use proper typing

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  role: 'patient' | 'therapist' | 'admin';
}

function getUserById(id: string): Promise<User> {
  // implementation
}
```

**Bad:**
```typescript
function get(x: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Use named exports for components
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

**Component Structure:**
```typescript
import { useState, useEffect } from 'react';
import { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState<Type>(initialValue);
  
  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `UserTypes.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Code Organization

```
src/
├── components/        # React components
│   ├── common/       # Shared components
│   ├── feature/      # Feature-specific components
│   └── ui/           # UI library components
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
├── lib/              # Utility libraries
├── services/         # API and external services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── pages/            # Page components
```

### ESLint and Prettier

Run before committing:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

### Comments

- Write self-documenting code
- Use comments for complex business logic
- Document public APIs with JSDoc
- Avoid obvious comments

**Good:**
```typescript
/**
 * Calculates the time remaining until session timeout
 * @param sessionStart - ISO timestamp of session start
 * @param duration - Session duration in minutes
 * @returns Time remaining in milliseconds
 */
function calculateTimeRemaining(sessionStart: string, duration: number): number {
  // implementation
}
```

**Bad:**
```typescript
// increment i
i++;
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples

```bash
feat(video): add screen sharing functionality

Implemented screen sharing feature using WebRTC's getDisplayMedia API.
Includes UI controls and proper error handling.

Closes #123
```

```bash
fix(auth): prevent session timeout during active calls

Modified session management to extend timeout when user is in an active
video call, preventing unexpected disconnections.

Fixes #456
```

### Atomic Commits

- Make small, focused commits
- Each commit should represent a single logical change
- Commit messages should be clear and descriptive

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update JSDoc comments
   - Update relevant documentation files

### Creating a Pull Request

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template completely

4. Link related issues using keywords (Fixes #123, Closes #456)

### PR Title Format

Follow the same format as commit messages:

```
feat(video): add screen sharing functionality
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Description of tests performed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
Add screenshots showing the changes

## Related Issues
Fixes #123
Relates to #456
```

### Review Process

- PRs require at least one approval
- Address all review comments
- Keep discussions focused and professional
- Be responsive to feedback

### Merging

- Only maintainers can merge PRs
- PRs will be squashed and merged
- Delete branch after merging

## Testing Requirements

### Unit Tests

- Write unit tests for all new functions/components
- Maintain 80%+ code coverage
- Use Vitest for testing

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTimeRemaining } from './utils';

describe('calculateTimeRemaining', () => {
  it('should calculate correct time remaining', () => {
    const start = new Date().toISOString();
    const duration = 60;
    const result = calculateTimeRemaining(start, duration);
    expect(result).toBeGreaterThan(0);
  });
});
```

### Integration Tests

- Test component interactions
- Test API integrations
- Use React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

test('displays user information', () => {
  render(<UserProfile userId="123" />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### E2E Tests

- Test critical user workflows
- Use Playwright
- Place in `tests/e2e/`

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:e2e          # E2E tests
```

## Security Guidelines

### Sensitive Data

- Never commit API keys, passwords, or tokens
- Use environment variables for configuration
- Review changes before committing

### Security Best Practices

- Validate all user inputs
- Sanitize data before rendering
- Use parameterized queries
- Follow OWASP guidelines
- Report security issues privately to security@mindboom.com

### Dependencies

- Keep dependencies up-to-date
- Review security advisories
- Run `npm audit` regularly
- Use `npm audit fix` cautiously

## Documentation

### Code Documentation

- Use JSDoc for public APIs
- Document complex algorithms
- Include usage examples

### README Updates

- Update README for significant changes
- Keep installation instructions current
- Update feature list

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error codes

## Questions?

- Check existing [Issues](https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio/issues)
- Join our [Discussions](https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio/discussions)
- Email: dev@mindboom.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to MindBoom 3.0 - Twilio! 🚀

