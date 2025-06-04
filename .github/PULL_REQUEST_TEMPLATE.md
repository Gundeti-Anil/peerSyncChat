# 🚀 PEER SYNC PULL REQUEST TEMPLATE

## 📋 Overview

### Summary

<!-- Provide a clear and concise summary of the changes made in this PR -->

**Type:** `✨ Feature` | `🐛 Bug Fix` | `🔧 Enhancement` | `📝 Documentation` | `🧹 Refactor` | `⚡ Performance`

**Description:**

<!-- Brief description of what this PR accomplishes -->

### 🎯 Linear Ticket

- **Ticket:** [XXX-000](https://linear.app/peer-sync-2025/issue/XXX-000)
- **Epic/Project:** <!-- Link to related epic if applicable -->

---

## 🛠️ Technical Details

### 🏗️ Architecture Changes

<!-- Describe any architectural decisions, new patterns, or structural changes -->

- [ ] New components created
- [ ] API routes added/modified
- [ ] Database schema changes
- [ ] External service integrations
- [ ] State management updates

### 📱 Frontend Implementation

<!-- For UI/Frontend changes -->

- **Design System:** <!-- Mention if using specific components from design system -->
- **Responsive Breakpoints:** `mobile` | `tablet` | `desktop` | `all`
- **Browser Support:** <!-- Specify browser requirements -->
- **Accessibility:** <!-- WCAG compliance level if applicable -->

### 🎨 Design Implementation

<!-- For pixel-perfect implementations -->

- [ ] Figma design review completed
- [ ] Design tokens/variables used
- [ ] Responsive behavior matches designs
- [ ] Interactive states implemented
- [ ] Animations/transitions added

### 🔧 Code Quality

- **TypeScript:** <!-- Mention new types, interfaces, or strict mode compliance -->
- **Performance:** <!-- Bundle size impact, Core Web Vitals considerations -->

---

### 🔍 Manual Testing

- [ ] Desktop testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Tablet testing (iPad, Android tablets)
- [ ] Keyboard navigation tested

### 📊 Performance Validation

- [ ] Lighthouse scores maintained/improved
- [ ] Bundle size impact verified (`pnpm run analyze`)
- [ ] Core Web Vitals check passed
- [ ] No performance regressions

---

## 📸 Visual Evidence

### 🖼️ Screenshots/GIFs

<!-- Add before/after screenshots or GIFs showing the changes -->

**Before:**

<!-- Screenshot of previous state -->

**After:**

<!-- Screenshot of new implementation -->

### 📱 Mobile Views

<!-- Include mobile screenshots if applicable -->

### 🗃️ Database Migrations

- [ ] No database changes
- [ ] Migrations included
- [ ] Seed data updated

## ✅ Quality Checklist

### 🏗️ Code Standards

- [ ] Follows [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
- [ ] ESLint passes with no errors (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] TypeScript strict mode compliance
- [ ] No `any` types used (unless justified)
- [ ] Proper error handling implemented

### 🎯 Frontend Specific

- [ ] Components are properly typed
- [ ] Props have proper TypeScript interfaces
- [ ] Custom hooks follow naming conventions
- [ ] State management is optimized
- [ ] No prop drilling issues
- [ ] Proper loading and error states
- [ ] Form validation implemented (if applicable)

### 🔒 Security & Performance

- [ ] No sensitive data exposed to client
- [ ] XSS prevention measures in place
- [ ] CSRF protection maintained
- [ ] Image optimization implemented
- [ ] Lazy loading for appropriate content
- [ ] SEO metadata updated (if applicable)

### ♿ Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where necessary
- [ ] Keyboard navigation support
- [ ] Color contrast meets WCAG standards
- [ ] Focus management implemented
- [ ] Screen reader friendly

---

### 🔗 Dependencies

<!-- List any new dependencies added -->

```json
{
  "dependencies": {
    "new-package": "^1.0.0"
  },
  "devDependencies": {
    "new-dev-package": "^1.0.0"
  }
}
```

**🎉 Ready for Review!**
This PR is ready for review and follows all the established guidelines. Please check the relevant sections above and test thoroughly before approval.
