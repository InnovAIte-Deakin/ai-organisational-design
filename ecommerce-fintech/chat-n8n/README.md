# AI Co-founder Chat Interface

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)

## Overview

This folder contains the main React application for the AI Co-founder project - a conversational AI interface designed for e-commerce entrepreneurs. The interface mimics a ChatGPT-like experience but is specifically tailored for business operations.

## Features

- **Chat Interface**: Natural language interaction with AI agents
- **Website Builder**: Simple website creation with templates
- **Email Marketing**: Campaign creation and management
- **N8N Workflow Integration**: Visual workflow automation
- **Dashboard**: Business metrics visualization
- **Multiple Views**: Cart recovery, inventory, marketing, and SEO content sections

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- n8n server running (for workflow functionality)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

```
chat-n8n/
├── public/               # Public assets
│   └── vite.svg          # Vite logo
├── src/                  # Source code
│   ├── api.js            # API connection handling
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global CSS (Tailwind)
│   ├── assets/           # Static assets
│   ├── components/       # UI Components
│   │   ├── chat/         # Chat interface components
│   │   ├── dashboard/    # Business dashboard components
│   │   ├── email/        # Email marketing components
│   │   ├── n8nWorkflow/  # n8n workflow components
│   │   ├── website/      # Website builder components
│   │   └── ui/           # Shared UI elements
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Layout components
│   └── utils/            # Utility functions
└── vite.config.js        # Vite configuration
```

## Integration with N8N

This interface connects with n8n to execute workflows. To enable full functionality:

1. Make sure n8n is running (see main README for setup instructions)
2. Import the provided workflows in n8n
3. Ensure the API endpoint in `src/api.js` points to your n8n server

## Available Views

- **Chat**: Main conversational interface
- **Cart Recovery**: Tools for recovering abandoned carts
- **Inventory**: Inventory management tools
- **Marketing**: Email and social marketing campaigns
- **SEO Content**: Content generation and optimization
- **Settings**: Application configuration
- **Website Builder**: Simple website creation interface

## Development

The project uses:
- Vite for fast development and building
- React for UI components
- Tailwind CSS for styling
- Context API for state management

## Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.
