# Exchange Monitor - Real-time Currency Tracking Application

## Overview

This is a full-stack web application for monitoring real-time exchange rates between USD, JPY, and KRW currencies. The application provides live rate tracking, customizable price alerts, and historical data visualization with a modern, responsive interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **API Pattern**: RESTful API with centralized error handling

### Development Tools
- **Development Server**: Vite with HMR and Express middleware integration
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Database Migrations**: Drizzle Kit for schema management
- **Build Process**: ESBuild for server bundling, Vite for client assets

## Key Components

### Core Features
1. **Real-time Exchange Rate Monitoring**
   - Fetches live rates from ExchangeRate API every 30 seconds
   - Supports USD/KRW, JPY/KRW, and USD/JPY currency pairs
   - Displays rate changes and percentage movements

2. **Price Alert System**
   - User-configurable alerts for specific price thresholds
   - "Above" and "below" alert types
   - Browser notifications when alerts are triggered
   - Active alert management with enable/disable functionality

3. **Historical Data Tracking**
   - Stores rate history in PostgreSQL database
   - Provides recent rate history views
   - Change calculation and trend analysis

4. **Responsive UI Components**
   - Currency cards with real-time updates
   - Alert management interface
   - Rate history visualization
   - Status bar with live update indicators

### Data Models
- **Users**: Basic user management (currently in-memory)
- **Alerts**: Price alert configuration and status
- **ExchangeRates**: Historical rate data with timestamps

## Data Flow

1. **Rate Fetching**: Server periodically fetches rates from external API
2. **Data Storage**: Rates stored in PostgreSQL with change calculations
3. **Client Polling**: Frontend polls server every 30 seconds for updates
4. **Alert Processing**: Server checks alerts against current rates
5. **Notifications**: Browser notifications sent when alerts trigger
6. **State Management**: TanStack Query manages cache and synchronization

## External Dependencies

### Third-party Services
- **ExchangeRate API**: Primary source for live currency data
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Inter font family for typography

### Key Libraries
- **UI Components**: Extensive Radix UI component library
- **Data Fetching**: TanStack Query for robust server state management
- **Database**: Drizzle ORM with Zod schema validation
- **Styling**: Tailwind CSS with class-variance-authority
- **Icons**: Lucide React for consistent iconography

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Development**: Vite dev server with Express middleware
- **Production**: Static asset serving with Express
- **Database**: PostgreSQL connection via environment variables

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Environment variables for API keys and database URLs

## Changelog
- June 30, 2025. Initial setup
- June 30, 2025. Added PostgreSQL database for persistent storage
- June 30, 2025. Improved logging to show only USD/KRW rates and reduced update frequency to 30 seconds
- June 30, 2025. Implemented real-time exchange rate system with FXRatesAPI and Investing.com scraping
- June 30, 2025. Changed from 1362.34원 (outdated API) to 1348.36원 (real-time accurate rate)
- June 30, 2025. Added dynamic update interval settings (30s-60min) with live Status Bar countdown
- June 30, 2025. Fixed JPY/KRW accuracy: implemented Naver Finance scraping (9.4105원) replacing incorrect 9.3698원
- July 1, 2025. Resolved JPY/KRW data overwrite issue: protected scraped values from API calculation interference, now displaying accurate real-time rates (9.6127원)
- July 1, 2025. Changed primary data source to Daum Finance main page (https://finance.daum.net/exchanges) for comprehensive currency data scraping
- July 1, 2025. Disabled Hana Bank scraping due to inaccurate data (1381원 vs actual 1350원), now using Daum Finance exclusively for accuracy
- July 1, 2025. Added Investing.com as primary JPY/KRW data source for improved accuracy (9.4248원 vs actual 9.41원, only 0.015 difference)
- July 1, 2025. Enhanced JPY/KRW accuracy: system now shows 9.4255원 while actual rate is 9.41원 (excellent precision within 0.016 margin)
- July 1, 2025. Fixed dashboard card display order: USD/KRW, JPY/KRW, USD/JPY (frontend sorting implemented)
- July 1, 2025. System working accurately with real-time data and correct visual ordering
- July 1, 2025. Complete JPY/KRW and USD/JPY alert system implementation: all currency pairs now support full alert functionality with browser notifications, proper UI display with latest-first sorting, and 5-second refresh intervals for immediate alert updates
- July 1, 2025. KakaoTalk push notification system fully operational: implemented token storage with expiration tracking, fixed OAuth callback handling, successfully tested with real-time message delivery for all currency pair alerts
- July 1, 2025. Refined JPY/KRW alert precision: cleaned up redundant 9.41-9.42 alerts, maintaining only critical thresholds (above 9.43, below 9.38) for accurate range-based notifications with enhanced delete functionality and improved UI visibility
- July 1, 2025. Enhanced alert system with timestamp functionality: all notifications now include precise Korean time (Asia/Seoul) showing when alerts triggered, applied to server logs, KakaoTalk messages, and browser notifications
- July 1, 2025. Implemented intelligent alert deduplication system: prevents repeated notifications for same threshold breach until rate exits and re-enters range, includes database tracking with wasTriggered state and automatic reset mechanism
- July 1, 2025. Upgraded to state-based alert system (WAIT_UP/WAIT_DOWN): replaced buffer zone approach with finite state machine for precise event handling, using ±3원 reset thresholds for reliable duplicate prevention
- July 12, 2025. Resolved React Hook errors by simplifying component architecture: removed complex UI library dependencies, created streamlined vanilla React implementation with full alert functionality, maintaining real-time exchange rate monitoring and complete notification system
- July 13, 2025. Completed UI refinement: removed log display functionality for cleaner interface, implemented dedicated settings modal with update interval configuration (5s-10min), finalized two-button design with alert creation and settings management
- July 13, 2025. Successfully resolved browser cache issues and finalized clean interface: created App-clean.tsx with only essential features (alert creation and settings), completely removed log functionality, achieved optimal user experience with streamlined two-button layout
- July 13, 2025. Enhanced settings menu with log display toggle: added checkbox control in settings modal allowing users to show/hide event logs on demand, maintaining clean interface while providing optional detailed logging capability
- July 13, 2025. Prepared Vercel deployment: optimized build configuration, created deployment guide, obtained Neon PostgreSQL database connection string for production environment
- July 13, 2025. Successfully completed Vercel deployment: exchange-monitor.vercel.app now live with Neon PostgreSQL backend, ExchangeRate API integration, real-time currency monitoring, and alert system fully operational in production

## User Preferences

Preferred communication style: Simple, everyday language.