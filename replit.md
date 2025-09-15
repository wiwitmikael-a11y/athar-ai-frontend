# AtharAI Chatbot

## Overview

AtharAI is a modern web-based AI assistant application that provides both chat and image generation capabilities. The application features a React frontend with a sleek aurora-themed UI and a Node.js backend that interfaces with Hugging Face models for AI inference. The system supports real-time chat conversations and AI-powered image generation through a job queue system with server-sent events for live updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: TailwindCSS with custom aurora animations and glassmorphic design
- **UI Components**: Modular component structure with Header, ChatView, ImageView, and supporting components
- **State Management**: React hooks (useState, useRef, useEffect) for local component state
- **Real-time Updates**: Server-Sent Events (EventSource) for streaming job results from backend
- **Build System**: Vite with TypeScript compilation and static asset optimization

### Backend Architecture
- **Framework**: Express.js with Node.js runtime
- **API Design**: RESTful endpoints with job-based asynchronous processing
- **Job Queue System**: MongoDB-based job storage with worker polling for AI inference tasks
- **Security**: Helmet for security headers, CORS for cross-origin requests, rate limiting
- **Error Handling**: Graceful fallbacks and retry mechanisms for external API calls
- **Worker Pattern**: Separate worker process polls for pending jobs and processes them asynchronously

### Data Storage Solutions
- **Primary Database**: MongoDB for persistent storage of chats, jobs, and cache
- **Fallback Database**: In-memory JavaScript objects when MongoDB is unavailable
- **Caching Strategy**: SHA-256 based cache keys with configurable TTL for AI responses
- **Collections**: 
  - `chats` for conversation history
  - `jobs` for async AI inference tasks
  - `cache` for response caching with automatic expiration

### Authentication and Authorization
- **API Security**: Hugging Face API key-based authentication for AI model access
- **Rate Limiting**: 30 requests per minute per IP address
- **Request Validation**: Input sanitization and length limits for prompts

### Job Processing System
- **Async Processing**: Jobs are queued immediately and processed by background worker
- **Status Tracking**: Jobs have pending/done/failed states with error handling
- **Real-time Communication**: Server-sent events stream job results to frontend
- **Retry Logic**: Configurable retry attempts for failed AI API calls

## External Dependencies

### AI Services
- **Hugging Face Inference API**: Primary AI service for both text generation and image generation
  - Text models: distilgpt2 (default) and other transformer models
  - Image models: runwayml/stable-diffusion-v1-5 (default) and other diffusion models
  - Authentication via HF_API_KEY environment variable

### Database Services
- **MongoDB**: Primary database with connection string via MONGO_URI
  - Used for persistent storage of conversations, jobs, and caching
  - Includes automatic indexing for performance optimization
  - Falls back to in-memory storage if unavailable

### Development and Deployment
- **Vercel**: Configured for static site deployment with build optimization
- **Node.js Environment**: Backend requires Node.js runtime with ES modules support
- **Environment Variables**: 
  - `GEMINI_API_KEY` (mentioned in README but not used in current implementation)
  - `HF_API_KEY` for Hugging Face authentication
  - `MONGO_URI` for MongoDB connection
  - `VITE_BACKEND_URL` for frontend-backend communication

### Build and Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TailwindCSS**: Utility-first CSS framework with PostCSS processing
- **TypeScript**: Type safety for both frontend and backend code
- **Nodemon**: Development server with auto-restart for backend changes