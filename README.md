# SubRouter Dist-Site Template

A beautiful, open-source frontend template for SubRouter distributors. Built with React, Vite, Tailwind CSS, and [react-bits](https://github.com/DavidHDev/react-bits) animation components.

## Features

- Dark-mode-first design with glassmorphism UI
- Animated landing page with gradient text, spotlight cards, and count-up stats
- User registration, login, and dashboard
- API key management
- Model pricing table
- Package subscription
- Fully responsive
- OpenAI-compatible API endpoint display

## Quick Start

```bash
# Install dependencies
npm install

# Development server (port 3001, proxies /api to localhost:3000)
npm run dev

# Production build
npm run build
```

## Configuration

The template automatically fetches site configuration from the backend API:

- **Site info**: `GET /api/dist/site/info` — name, logo, favicon, announcement
- **Models**: `GET /api/dist/site/models` — available AI models
- **Pricing**: `GET /api/dist/site/pricing` — per-model pricing
- **Packages**: `GET /api/dist/site/packages` — subscription packages

## Customization

### Theming
Edit `tailwind.config.js` to customize colors, fonts, and animations.

### Components
react-bits animation components are in `src/components/bits/`:
- `GradientText` — Animated gradient text
- `ShinyText` — Sweeping shine effect
- `BlurText` — Words blur-in animation
- `CountUp` — Spring-physics number counter
- `SpotlightCard` — Mouse-following spotlight glow
- `StarBorder` — Animated star-light border

### Pages
- `Home` — Landing page with hero, features, models preview
- `Login` / `Register` — Authentication
- `Dashboard` — User overview with balance, usage, redeem
- `Tokens` — API key management
- `Pricing` — Model pricing table
- `Packages` — Subscription packages

## Tech Stack

- [React 18](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [motion/react](https://motion.dev) (Framer Motion)
- [react-hot-toast](https://react-hot-toast.com)
- [react-bits](https://github.com/DavidHDev/react-bits) animation components

## License

MIT
