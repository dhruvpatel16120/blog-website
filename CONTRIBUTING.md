# Contributing to TechBlog

Thank you for your interest in contributing to TechBlog! Whether you are fixing a typo, resolving an open issue, or proposing a new feature, your help makes this open-source project better for everyone.

Repository: [https://github.com/dhruvpatel16120/blog-website](https://github.com/dhruvpatel16120/blog-website)

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating in project discussions or submitting code.

---

## How Can You Contribute?

* **Report Bugs**: Encounter an issue? Open a [Bug Report](https://github.com/dhruvpatel16120/blog-website/issues/new?template=bug_report.md) with reproduction steps.
* **Suggest Features**: Have an idea for a feature or UI improvement? Open a [Feature Request](https://github.com/dhruvpatel16120/blog-website/issues/new?template=feature_request.md).
* **Write Code**: Pick up an issue marked `good first issue` or `help wanted`.
* **Improve Documentation**: Enhance setup guides, API docs, or code comments.

---

## Local Development Setup

### 1. Prerequisites
* **Node.js**: `v18.17+` or `v20+` recommended
* **npm**: `v9+` or `pnpm`
* **PostgreSQL Database**: Local instance or free cloud database (e.g., Neon, Supabase)

### 2. Fork & Clone
```bash
git clone https://github.com/<your-username>/blog-website.git
cd blog-website
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and NextAuth secret.

### 5. Setup Database
Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma db push
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Workflow & Guidelines

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Code Standards**:
   * Follow the existing ESLint rules and formatting.
   * Run `npm run lint` before committing to make sure there are no warnings or errors.
   * Write readable, self-documenting code with meaningful variable and function names.

3. **Commit Messages**:
   Follow conventional commits:
   * `feat: add markdown preview to post editor`
   * `fix: correct contributor avatar loading in team page`
   * `docs: update setup instructions in readme`
   * `refactor: simplify email queue retry backoff`

4. **Submitting a Pull Request (PR)**:
   * Push your branch to your fork: `git push origin feature/your-feature-name`.
   * Open a PR against the `main` branch of `dhruvpatel16120/blog-website`.
   * Complete the pull request template: describe what changed, why, and reference any related issues (e.g., `Closes #12`).
   * A maintainer will review your PR and provide constructive feedback!

---

## Questions or Need Help?

* Start a thread in [GitHub Discussions](https://github.com/dhruvpatel16120/blog-website/discussions)
* Reach out via email: [hello@techblog.com](mailto:hello@techblog.com)
