# AstroLord - Vedic Astrology Platform

AstroLord is a modern web application for generating Vedic astrology birth charts, exploring planetary positions, divisional charts, dashas, and chatting with an AI astrologer for personalized cosmic insights.

## Features

- 🌟 Generate precise Vedic astrology birth charts
- 🪐 View planetary positions with zodiac signs and degrees
- 📊 Explore divisional charts (D1, D9, D10, etc.)
- ⏰ Analyze Vimshottari Dashas (planetary periods)
- 🤖 Chat with AI astrologer for personalized insights
- 💾 Save and manage multiple birth charts
- 💕 Relationship compatibility matching
- 📱 Mobile-optimized with bottom navigation
- 🌙 Dark & Light theme support

## Recent UI Improvements (v1.1.0)

See [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md) for detailed documentation of the latest updates:

| Feature | Description |
|---------|-------------|
| Mobile Bottom Nav | iOS/Android-style tab bar for mobile users |
| Inline Chart Selector | Pick charts directly in Chat tab |
| Loading Skeletons | Smooth loading states throughout |
| Enhanced Pricing | Clear visual hierarchy for plan comparison |
| Message Timestamps | Relative time display on chat messages |
| Animated Empty States | Engaging illustrations when no data |
| Light Mode Polish | Warmer colors with subtle gradients |
| Contextual Feedback | Dynamic feedback modal experience |
| Micro-Animations | Press effects, hover states, transitions |
| Quick Action Buttons | One-tap astrological queries in chat |

## Getting Started

**Local Development**

Clone this repository and run locally using your preferred IDE.

**Requirements**
- Node.js & npm (LTS version recommended) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Installation Steps**

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd astrolord-frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_backend_api_url
```

## Tech Stack

This project is built with modern web technologies:

- **Build Tool**: Vite
- **Language**: TypeScript
- **Framework**: React 18
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── MobileBottomNav.tsx    # Mobile tab navigation
│   ├── ChatChartSelector.tsx  # Inline chart picker
│   ├── CentralizedChat.tsx    # Main chat component
│   ├── DashboardHome.tsx      # Dashboard overview
│   ├── DashboardNav.tsx       # Sidebar navigation
│   ├── EmptyStates.tsx        # Empty state illustrations
│   └── ...
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API client
├── pages/                # Page components
├── styles/               # Additional CSS
└── main.tsx              # Application entry point
```

## Deployment

Build the project for production:

```sh
npm run build
```

The optimized files will be in the `dist/` directory, ready to be deployed to any static hosting service like Vercel, Netlify, or AWS S3.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
