# AstroLord - Vedic Astrology Platform

AstroLord is a modern web application for generating Vedic astrology birth charts, exploring planetary positions, divisional charts, dashas, and chatting with an AI astrologer for personalized cosmic insights.

## Features

- 🌟 Generate precise Vedic astrology birth charts
- 🪐 View planetary positions with zodiac signs and degrees
- 📊 Explore divisional charts (D1, D9, D10, etc.)
- ⏰ Analyze Vimshottari Dashas (planetary periods)
- 🤖 Chat with AI astrologer for personalized insights
- 💾 Save and manage multiple birth charts

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
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and API client
├── pages/          # Page components
└── main.tsx        # Application entry point
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
