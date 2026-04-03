# Contributing to intentional-cognition-os

Thank you for your interest in contributing to **intentional-cognition-os**! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Git
- GitHub account

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jeremylongshore/intentional-cognition-os.git
cd intentional-cognition-os

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linter
pnpm lint
```

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/jeremylongshore/intentional-cognition-os/issues) first
2. Open a [bug report](https://github.com/jeremylongshore/intentional-cognition-os/issues/new?template=bug_report.md)
3. Include reproduction steps, expected vs actual behavior, and environment details

### Suggesting Enhancements

1. Check [existing feature requests](https://github.com/jeremylongshore/intentional-cognition-os/issues?q=label%3Aenhancement)
2. Open a [feature request](https://github.com/jeremylongshore/intentional-cognition-os/issues/new?template=feature_request.md)

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Commit with [conventional commit messages](#commit-messages)
7. Push and open a pull request

## Development Process

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation changes |

### Testing

Run the test suite before submitting a PR:

```bash
pnpm test
pnpm lint
pnpm typecheck
```

### Code Review

- All PRs require at least 1 maintainer approval
- CI must pass (lint + tests)
- Keep PRs focused — one feature or fix per PR

## Style Guides

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Examples:**
- `feat(compiler): add concept extraction pipeline`
- `fix(ingest): handle empty PDF gracefully`
- `docs(readme): update installation instructions`

### Code Style

- TypeScript with strict mode
- 2-space indentation
- Run linting before committing
- Write clear, self-documenting code
- Add comments only where logic isn't obvious

## Community

- **Questions**: [GitHub Discussions](https://github.com/jeremylongshore/intentional-cognition-os/discussions)
- **Bugs**: [Issue Tracker](https://github.com/jeremylongshore/intentional-cognition-os/issues)
- **Email**: jeremy@jeremylongshore.com

## License

By contributing, you agree that your contributions will be licensed under the
project's [MIT License](LICENSE).

---

*Thank you for helping improve intentional-cognition-os!*
