# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Financial Analytics Platform (财务分析平台) consisting of:
- **Frontend**: Vue 3 + TypeScript + Vite application in `financial-analytics-platform/`
- **Backend**: Node.js Express API server in `financial-backend/`

The platform provides comprehensive financial reporting and analysis for multiple companies (南华公司, 拓源公司) with extensive financial statement management, budgeting, inventory tracking, and business intelligence features.

## Development Commands

### Frontend (financial-analytics-platform/)
```bash
# Development server
npm run dev

# Production build
npm run build

# Staging build with TypeScript checking
npm run staging

# Preview build
npm run serve

# Linting
npm run lint
npm run stylelint
```

### Backend (financial-backend/)
```bash
# Start production server
npm start

# Development with auto-restart
npm run dev

# PM2 management
pm2 start ecosystem.config.js
pm2 status
pm2 logs financial-backend
pm2 restart financial-backend
pm2 stop financial-backend
```

### Deployment
```bash
# Frontend deployment (automated)
./deploy.sh

# Backend deployment (automated)
cd financial-backend && ./deploy.sh

# Full stack deployment
./deploy-all.sh [frontend|backend|all]
```

## Architecture Overview

### Frontend Architecture
- **Framework**: Vue 3 with Composition API
- **TypeScript**: Full TypeScript support with strict typing
- **State Management**: Pinia for reactive state management
- **Routing**: Vue Router 4 with permission-based access control
- **UI Framework**: Element Plus components
- **Charts**: ECharts for data visualization
- **CSS**: Tailwind CSS + SCSS
- **Build Tool**: Vite with compression and component auto-import

**Key Directories:**
- `src/views/` - Page components organized by business modules (nanhua/, tuoyuan/, newTable/, analytics/)
- `src/api/` - HTTP client and API endpoint definitions
- `src/stores/` - Pinia stores for state management
- `src/components/` - Reusable UI components
- `src/router/` - Route definitions and permission guards
- `src/utils/` - Utility functions and helpers

### Backend Architecture
- **Framework**: Express.js with comprehensive middleware
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT-based with bcrypt password hashing
- **File Upload**: Multer for multipart form handling
- **Process Management**: PM2 for production deployment
- **API Design**: RESTful endpoints with consistent JSON responses

**Key Directories:**
- `routes/` - API route handlers organized by business domain
- `config/` - Database connection and environment configuration
- `middleware/` - Custom middleware (budget middleware, etc.)
- `sql/` - Database schema and migration files
- `scripts/` - Utility scripts for data management and setup

### Database Design
The system uses a MySQL database with tables for:
- Financial statements (balance_sheet, cash_flow, income_statement)
- Business analytics (business_income_structure, main_business_income, etc.)
- Company-specific modules (nanhua_*, tuoyuan_*)
- User management and permissions
- File attachments and form submissions

## Business Domain Knowledge

### Multi-Company Support
The platform supports multiple companies with dedicated modules:
- **南华公司 (Nanhua)**: Manufacturing/construction company modules
- **拓源公司 (Tuoyuan)**: Alternative business structure modules
- **Shared modules**: Common financial reporting components

### Key Financial Modules
1. **Core Financial Statements**: Balance sheet, income statement, cash flow
2. **Business Analysis**: Revenue structure, profit margins, contribution rates
3. **Inventory Management**: Stock levels, work-in-progress, contract inventory
4. **Sales & Marketing**: New orders, project tracking, bidding status
5. **Cost Management**: Cost center analysis, estimation, and provisioning
6. **Receivables**: Accounts receivable, overdue accounts, bad debt provisions

## Development Guidelines

### API Patterns
- All API endpoints follow RESTful conventions
- Consistent response format: `{success: true, data: {}, message: ""}` for success
- Error responses: `{error: "Error message"}`
- Period-based data using YYYY-MM format
- JSON data storage in MySQL for flexibility

### Frontend Patterns
- Vue 3 Composition API with `<script setup>` syntax
- TypeScript interfaces for type safety
- Element Plus for consistent UI components
- Reactive data binding with Pinia stores
- Route-based code splitting for performance

### Database Operations
- Use prepared statements via mysql2
- JSON columns for flexible data structures
- `ON DUPLICATE KEY UPDATE` for upsert operations
- Proper error handling and connection pooling

## Testing and Quality

### Health Checks
- Backend health endpoint: `GET /health`
- Frontend serves on port 8080 (dev) / nginx (production)
- Backend serves on port 3000

### Logging
- PM2 handles process logs in `logs/` directory
- Error, output, and combined logs available
- Frontend build logs during deployment

## Environment and Deployment

### Environment Variables
Backend uses `.env` file with:
- Database connection (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- Server port configuration
- JWT secrets for authentication

### Production Deployment
- Frontend: Vite build → nginx static serving
- Backend: PM2 process management with auto-restart
- Database: MySQL on port 3306
- Automated deployment scripts handle backup, build, and service restart

## File Structure Notes

- `backup/` contains timestamped deployment backups
- `sql/` directory has incremental schema updates
- Route files are organized by business function and company
- Vue components follow domain-driven organization
- Extensive file upload support in `uploads/` directory