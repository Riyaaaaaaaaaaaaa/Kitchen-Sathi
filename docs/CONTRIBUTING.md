# 🤝 Contributing to KitchenSathi

Thank you for your interest in contributing to KitchenSathi! We welcome contributions from everyone.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

**Our Standards:**
- Be respectful and constructive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards other contributors

---

## 🎯 How Can I Contribute?

### 1. Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When filing a bug report, include:**
- Clear descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)
- Error messages or logs

**Bug Report Template:**
```markdown
## Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 18.0.0]
```

### 2. Suggesting Features

Feature suggestions are welcome! Please provide:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

**Feature Request Template:**
```markdown
## Feature Description
What feature would you like to see?

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Any alternative approaches?

## Additional Context
Mockups, examples, etc.
```

### 3. Code Contributions

We accept contributions for:
- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- Test coverage
- UI/UX enhancements

---

## 🛠 Development Setup

### Prerequisites

- Node.js v18+
- MongoDB
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/kitchensathi.git
   cd kitchensathi
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/kitchensathi.git
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Set up environment variables**
   - Copy `.env.example` to `.env` in both `backend` and `frontend`
   - Fill in your API keys and credentials

6. **Run the application**
   ```bash
   # Backend (in backend directory)
   npm run dev

   # Frontend (in frontend directory)
   npm run dev
   ```

---

## 📝 Coding Guidelines

### TypeScript

**Style:**
```typescript
// Use interfaces for objects
interface User {
  name: string;
  email: string;
}

// Use type for unions
type Status = 'pending' | 'completed';

// Use async/await
const fetchData = async (): Promise<Data> => {
  const result = await api.call();
  return result;
};

// Avoid 'any' - use proper types
const processData = (data: UserData): ProcessedData => {
  // ...
};
```

**Naming Conventions:**
- Variables/Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts` or `PascalCase.tsx` (components)

### React Components

**Functional Components:**
```typescript
import React from 'react';

interface Props {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  const [state, setState] = React.useState<string>('');
  
  React.useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

**Best Practices:**
- Extract reusable logic into custom hooks
- Use meaningful prop names
- Add PropTypes or TypeScript interfaces
- Keep components small and focused
- Use composition over inheritance

### Backend API

**Route Structure:**
```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET - Read
router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await Model.find({ userId: req.user.id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST - Create
router.post('/', requireAuth, async (req, res) => {
  try {
    const validated = schema.parse(req.body);
    const item = await Model.create({ ...validated, userId: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Validation error' });
  }
});

export default router;
```

**Best Practices:**
- Always use authentication middleware for protected routes
- Validate input with Zod schemas
- Use appropriate HTTP status codes
- Handle errors gracefully
- Add logging for debugging

### Database

**Model Definition:**
```typescript
import mongoose from 'mongoose';

interface ItemDocument extends mongoose.Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance
ItemSchema.index({ userId: 1, createdAt: -1 });

export const Item = mongoose.model<ItemDocument>('Item', ItemSchema);
```

**Best Practices:**
- Add indexes for frequently queried fields
- Use TypeScript interfaces
- Add validation at schema level
- Use meaningful collection names

---

## 💬 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(grocery): add expiry date notification system

fix(auth): resolve JWT token expiration issue

docs(api): update API documentation for meal planner

refactor(analytics): optimize database queries
```

**Guidelines:**
- Use present tense ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 50 characters
- Add detailed body if needed

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, tested code
   - Follow coding guidelines
   - Add comments where needed
   - Update documentation

4. **Test thoroughly**
   - Test all affected features
   - Check for console errors
   - Test on different browsers
   - Verify mobile responsiveness

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting PR

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in the PR template

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing process

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
- [ ] Responsive design maintained

## Screenshots (if applicable)
Add screenshots

## Related Issues
Closes #123
```

### Review Process

- Maintainers will review your PR
- Address requested changes
- Keep PR focused on single feature/fix
- Be patient and respectful

---

## ✅ Checklist Before PR

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Followed coding guidelines
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main
- [ ] PR description is complete

---

## 🎨 UI/UX Contributions

When contributing UI changes:

**Guidelines:**
- Follow existing design patterns
- Use Tailwind CSS utility classes
- Maintain consistent spacing
- Ensure mobile responsiveness
- Test on multiple screen sizes
- Check color contrast for accessibility
- Add loading states
- Handle empty states

**Screen Sizes to Test:**
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1440px, 1920px

---

## 📚 Documentation Contributions

Documentation is crucial! You can help by:

- Fixing typos and grammar
- Improving clarity
- Adding examples
- Updating outdated information
- Translating to other languages

**Documentation Standards:**
- Use clear, concise language
- Add code examples
- Include screenshots
- Update table of contents
- Check all links work

---

## 🐛 Debugging Tips

### Backend Issues

**Check logs:**
```bash
# In backend directory
npm run dev
# Look for error messages in terminal
```

**Common issues:**
- MongoDB not running
- Missing environment variables
- Port already in use
- Invalid API keys

### Frontend Issues

**Check browser console:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

**Common issues:**
- API endpoint not accessible
- CORS errors
- Missing environment variables
- Build errors

---

## 🤔 Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Contact maintainers

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Acknowledged in release notes
- Credited in CHANGELOG

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to KitchenSathi! 🎉**

Every contribution, no matter how small, helps make this project better for everyone.

Happy coding! 🚀

