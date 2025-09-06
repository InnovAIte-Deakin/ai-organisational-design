# Overview

This is a comprehensive dental AI dashboard application that combines modern web technologies with artificial intelligence to provide dental professionals with tools for patient management, dental X-ray analysis, telemedicine consultations, and clinical documentation. The system features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and OpenAI's GPT-4 for AI-powered dental insights.

The application provides five core modules: an overview dashboard for key metrics, dental X-ray analysis with AI-powered interpretation, patient record management with AI-generated dental summaries, appointment transcription with treatment note generation, and telemedicine scheduling capabilities for dental consultations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, featuring a modern component-based architecture. The UI leverages shadcn/ui components built on top of Radix UI primitives for accessibility and consistency. Styling is handled through Tailwind CSS with a custom design system including CSS variables for theming.

State management utilizes TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates. The routing system uses Wouter for lightweight client-side navigation. The application follows a tab-based interface pattern with five main sections: Overview, Scan Analysis, Patient Records, Transcription, and Telemedicine.

## Backend Architecture
The server employs Express.js with TypeScript in ESM format, implementing a RESTful API architecture. The application uses a modular route structure with centralized error handling and request/response logging middleware. File uploads are handled through Multer with memory storage for medical scan processing.

The storage layer implements an interface-based pattern (IStorage) with both in-memory and database implementations, allowing for flexible data persistence strategies. Currently using an in-memory implementation with sample data for development, but structured to easily transition to database persistence.

## Data Storage Solutions
Database schema is defined using Drizzle ORM with PostgreSQL as the target database. The schema includes four main entities: patients (with demographics, insurance, dental history, and emergency contacts), dental X-rays (with AI analysis results and findings), appointments (supporting multiple consultation types and procedure tracking), and dental history records (with tooth-specific treatment tracking and costs).

The Drizzle configuration supports schema-driven database migrations with automatic SQL generation. Database credentials are managed through environment variables with proper validation.

## Authentication and Authorization
Currently, the application operates without explicit authentication mechanisms, indicating it's designed for internal healthcare environments or development purposes. The architecture supports future implementation of authentication through the established middleware pattern.

## AI Integration
OpenAI's GPT-4 model powers multiple AI features throughout the application. Dental X-ray analysis processes uploaded images and generates professional dental summaries with confidence scores and specific findings like cavities, periodontal disease, and bone loss. Patient record AI summaries aggregate dental history into comprehensive overviews. Treatment note generation automatically converts appointment transcriptions into structured dental documentation with chief complaints, examinations, diagnoses, and treatment plans.

The AI service layer implements proper error handling and response formatting, ensuring dental disclaimers are included in AI-generated content for professional dental practice compliance.

# External Dependencies

## Core Framework Dependencies
- **React 18** with TypeScript for frontend development
- **Express.js** for backend API server
- **Vite** for development tooling and build process
- **Node.js** runtime environment

## Database and ORM
- **PostgreSQL** as the primary database system
- **Drizzle ORM** for type-safe database operations and migrations
- **@neondatabase/serverless** for PostgreSQL connection management

## AI and Machine Learning
- **OpenAI API** for GPT-4 powered medical analysis and text generation
- **OpenAI JavaScript SDK** for API integration

## UI and Styling
- **Radix UI** component primitives for accessibility-first components
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library for consistent design system
- **Lucide React** for icon components

## Development and Build Tools
- **TypeScript** for type safety across the stack
- **ESBuild** for backend bundling and optimization
- **PostCSS** and **Autoprefixer** for CSS processing
- **TSX** for TypeScript execution in development

## File Handling and Processing
- **Multer** for multipart/form-data handling and file uploads
- **File type validation** for medical scan processing

## Session and State Management
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **connect-pg-simple** for PostgreSQL session storage (when authentication is implemented)

## Utility Libraries
- **date-fns** for date manipulation and formatting
- **clsx** and **class-variance-authority** for conditional CSS classes
- **nanoid** for unique identifier generation
- **Zod** for runtime type validation and schema definition