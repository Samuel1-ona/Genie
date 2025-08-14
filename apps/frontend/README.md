# Frontend App

A modern React frontend built with Vite, featuring:

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** with Vite plugin for seamless integration
- **shadcn/ui** for beautiful, accessible components
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Zustand** for state management
- **TanStack Table** for data tables
- **Recharts** for data visualization
- **Day.js** for date manipulation
- **Lucide React** for icons
- **ESLint & Prettier** for code quality

## 🎨 UI Components

The project uses shadcn/ui components with:

- Custom CSS variables for theming
- Dark mode support
- Responsive design
- Accessible components

## 🚀 Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   └── counter.tsx  # Example component
├── lib/
│   └── utils.ts     # Utility functions
├── constants/
│   └── counter_process.ts
├── App.tsx
└── main.tsx
```

## 🎯 Features

- ✅ Tailwind CSS with dark theme support
- ✅ shadcn/ui components with proper configuration
- ✅ React Router for navigation
- ✅ TanStack Query for data management
- ✅ ESLint & Prettier configuration
- ✅ TypeScript with path aliases
- ✅ Modern build setup with Vite

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with Tailwind CSS v4 plugin and path aliases
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
