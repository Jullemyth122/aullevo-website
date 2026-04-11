# Aullevo Web

The official presentation and landing page website for **Aullevo** — the AI-powered browser extension that automatically fills forms and repetitive data entries securely using your local profile and the Gemini AI API.

This repository exclusively contains the front-end web application (the landing page, feature showcases, documentation, and download hubs).

![Aullevo Hero Mockup](public/vite.svg) *Optional: Replace with actual screenshot*

## 🚀 Features Highlights

- **Trust-First Design**: A clean, glassmorphic UI aesthetic emphasizing privacy, security, and open-source transparency.
- **Interactive Demos**: Features a custom-built, React-based animated hero mock-up (`DemoAnimation.tsx`) that visually demonstrates how the extension traverses and fills form DOMs using AI context.
- **Documentation Hub**: Fully responsive, scroll-spied developer and user documentation explaining Aullevo's boundaries, security models, and API key integrations.
- **Micro-interactions**: Powered by GSAP and custom SCSS keyframes for fluid hover effects, shimmering highlights, and cursor-following glow cards.
- **Multi-Gateway Donation Modal**: A seamless donation integration offering users the choice between Global Payments (via Buy Me A Coffee/Stripe) and localized payment networks (via PayMongo/GCash for the Philippines).

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite (Fast HMR via SWC)
- **Routing**: React Router v7
- **Styling**: Vanilla SCSS (`sass`) heavily utilizing CSS variables, glassmorphism, and mesh gradients.
- **Animation**: GSAP (GreenSock) for complex sequencing + native CSS keyframes.

## 📦 Local Development Setup

To run the Aullevo website locally, ensure you have Node.js installed, then follow these steps:

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The site will be available on `http://localhost:5173` (or the port specified by Vite).*

3. **Build for Production**
   ```bash
   npm run build
   ```
   *This compiles the TypeScript code and bundles the minified assets into the `dist/` directory, ready for deployment.*

## 📂 Project Structure

```text
src/
├── assets/         # Static assets, SVGs, etc.
├── components/     # Reusable React components (Layout, Navbar, DonateButton, TrustModal)
├── pages/          # Primary page routes (Home, About, Documentation, Features, HowItWorks)
└── styles/         # Modular SCSS architecture (_variables, _home, _donate, etc.)
```

## 🌍 Donation Links Configuration

To update the global and local payment processing links (e.g., PayMongo and Buy Me a Coffee), open `src/pages/DonateButton.tsx` and modify the constants at the top of the file:

```tsx
const GLOBAL_PAYMENT_LINK = 'https://buymeacoffee.com/...';
const LOCAL_PAYMENT_LINK = 'https://paymongo.page/l/...';
```

## 🔒 Privacy & Security

Aullevo (the extension) is designed with a zero-knowledge trust model. Your data is stored locally via IndexedDB and encrypted using `AES-256-GCM`. The website reflects these principles by explicitly distributing the extension as an **unpacked ZIP archive**, allowing developers worldwide to inspect `100%` of the source code before installation.
