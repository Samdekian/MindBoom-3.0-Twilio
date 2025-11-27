// MindBoom 3.0 - Twilio: Production ESLint Configuration
// Stricter rules for production builds

module.exports = {
  extends: ['./eslint.config.js'],
  rules: {
    // Disallow console statements in production
    'no-console': ['error', { allow: ['warn', 'error'] }],
    
    // Disallow debugger statements
    'no-debugger': 'error',
    
    // Disallow alert, confirm, and prompt
    'no-alert': 'error',
    
    // Disallow unused variables
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    
    // Require explicit return types
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true
      }
    ],
    
    // Disallow any types
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Require proper error handling
    'no-throw-literal': 'error',
    
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // React specific rules
    'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/jsx-no-script-url': 'error',
    
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    
    // Performance rules
    'react/jsx-no-bind': ['warn', {
      allowArrowFunctions: false,
      allowBind: false,
      ignoreRefs: true
    }],
    
    // Code quality
    'complexity': ['warn', { max: 15 }],
    'max-depth': ['warn', { max: 4 }],
    'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 5 }]
  },
  
  overrides: [
    {
      // Test files can be less strict
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off'
      }
    }
  ]
};

