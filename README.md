# Otaku Hub

A premium anime-inspired e-commerce platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Overview

Otaku Hub is a premium Shopify-inspired e-commerce platform focused on anime-inspired fashion and collectibles. Built with a focus on performance, beautiful animations, and a luxury shopping experience.

This implementation follows the [Otaku Hub PRD](OTAKU_HUB_PRD_v1.0.docx) specifications, featuring:

- Custom Shopify theme with GSAP animations
- Luxury anime/minimal/cinematic design
- Mobile-first approach
- Performance-optimized architecture
- Reusable component system

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) (configured for production)
- **Linting**: [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/)
- **Code Quality**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Package Manager**: [npm](https://www.npmjs.com/)

## Project Structure

```
otaku-hub/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable UI components
├── lib/                 # Utility functions and helpers
├── public/              # Static assets
├── styles/              # Global styles and CSS
├.husky/                 # Git hooks
├── .gitignore           # Git ignore rules
├── .prettierrc.json     # Prettier configuration
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.mjs   # PostCSS/Tailwind configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (tested with v20.x)
- npm 9+ (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will auto-reload as you edit files.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code checking
- `npm run lint:fix` - Run ESLint with auto-fix

## Code Quality

This project uses a comprehensive code quality setup:

- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **Husky** for Git hooks (pre-commit)
- **lint-staged** for running linters on staged files

The pre-commit hook automatically runs lint-staged which:

- Lints staged `.js`, `.jsx`, `.ts`, `.tsx` files with ESLint
- Automatically fixes fixable issues
- Formats code with Prettier

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

The build output will be in the `.next/` directory.

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com) (the creators of Next.js), but can also be deployed to any Node.js hosting platform.

For Vercel deployment:

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Deploy with default settings (it automatically detects Next.js projects)

## Environment Variables

Create a `.env.local` file in the root directory for environment variables:

```env
# Example environment variables
NEXT_PUBLIC_API_URL=https://api.example.com
```

> **Note**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

## License

This project is proprietary and confidential. All rights reserved.
