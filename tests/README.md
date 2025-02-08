# Testing Documentation

This directory contains test suites for both the Generator Platform and Generated Applications templates.

## Directory Structure

```
tests/
├── generator/           # Generator Platform tests
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── performance/    # Performance tests
│
├── generated/          # Generated Applications tests
│   ├── templates/      # Template tests
│   ├── components/     # Component tests
│   └── e2e/           # End-to-end tests
│
└── common/            # Common test utilities
    ├── fixtures/      # Test fixtures
    ├── helpers/       # Test helpers
    └── mocks/        # Mock data and services
```

## Testing Guidelines

1. All tests should follow the AAA pattern (Arrange, Act, Assert)
2. Maintain test isolation
3. Use meaningful test descriptions
4. Include both positive and negative test cases
5. Keep tests focused and atomic

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test generator
npm test generated

# Run with coverage
npm run test:coverage
```

## Test Coverage Requirements

- Unit Tests: 90% coverage
- Integration Tests: 80% coverage
- E2E Tests: Key user flows covered

## Version Control

- Current Version: 1.0.0
- Last Updated: [Current Date] 