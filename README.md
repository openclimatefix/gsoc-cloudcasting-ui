# CloudCasting UI

### An interactive cloud forecasting platform to show real-time cloud movements

The code is as open source as we can possibly make it (safely) and is powered by satellite imagery, machine learning, and an advanced prediction API.

> This project was developed as part of Google Summer of Code 2025 with Open Climate Fix. Student Developer: [Suvan Banerjee](https://github.com/suvanbanerjee) | Mentors: [Brad Fulford](https://github.com/braddf) | Project Timeline: May-August 2024 | [GSoC Project Page](https://summerofcode.withgoogle.com/programs/2025/projects/GXFLZMmW)

## Cloud Movement Prediction

CloudCasting UI is a web application developed for visualizing and predicting cloud movements up to 3 hours ahead with updates every 15 minutes. The platform helps grid operators, solar farms, and smart home owners optimize energy usage through precise short-term forecasting.

The term "nowcasting" refers to forecasting for the next few hours using statistical techniques and machine learning models on near-real-time data.

## Why is this project important?

Better cloud movement prediction directly impacts renewable energy efficiency:

1. Grid operators can better anticipate fluctuations in solar generation
2. Solar farm operators can optimize energy trading and maintenance scheduling
3. Smart home systems can time energy-intensive tasks to coincide with optimal solar conditions

As a rough estimate, improved solar forecasting across global energy markets could reduce CO2 emissions by hundreds of millions of tonnes by 2035 by reducing the need for carbon-intensive backup power generation.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) with Auth0
- **Mapping:** [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/)
- **Testing:** Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Mapbox API key
- Auth0 account and credentials

### Environment Setup

Create `.env.local` file with the following variables:

```
# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Auth0 Configuration
AUTH0_SECRET=your_random_secret
AUTH0_ISSUER_BASE_URL=https://your-tenant.region.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SCOPE=openid profile email

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Installation

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Start production server
npm run start
```

## Project Structure

- `app` - Next.js App Router pages and API routes
- `components` - Reusable UI components
- `hooks` - Custom React hooks
- `utils` - Utility functions
- `types` - TypeScript type definitions
- `__test__` - Jest test files

## Authentication

Authentication is handled via Auth0 integration with NextAuth.js. Protected routes use the `withAuth` HOC to redirect unauthenticated users to the login page.

## Features

- **Interactive Map**: Visualizes cloud movements using Mapbox GL
- **Authentication**: Secure login via Auth0
- **Responsive Design**: Works across different device sizes
- **Dark Mode**: Optimized for viewing satellite imagery
- **Time-series Forecasting**: View predicted cloud positions at 15-minute intervals

## Development Workflow

- `npm run lint` - Run ESLint for code linting
- `npm run format` - Run Prettier for code formatting
- `npm run lint-format` - Run both linting and formatting
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode

## Contributing

We welcome contributions to the CloudCasting UI project! Whether it's fixing bugs, improving documentation, or adding new features, your help is appreciated.

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Learn More

- [Cloudcasting](https://www.openclimatefix.org/work/cloudcasting)
- [Open Climate Fix](https://openclimatefix.org/)
