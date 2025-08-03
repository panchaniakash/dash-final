# Overview

This is a Node.js-based dashboard application for Adani's ISMS (Integrated Safety Management System) that provides executive-level safety analytics and reporting. The system features multiple dashboard views including Chairman Daily and Monthly reports with dynamic data visualization, filtering capabilities, and real-time data fetching from Microsoft SQL Server. The application serves as a comprehensive safety management interface with role-based access control and customizable dashboard configurations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Pure JavaScript**: No frameworks - uses vanilla JavaScript with jQuery for DOM manipulation and AJAX calls
- **Bootstrap 4.5.2**: Responsive UI framework for consistent styling and grid layout
- **Modular Design**: Separate JS files for different dashboard views (indexChairmanDaily.js)
- **Real-time Data Binding**: Dynamic dropdowns, tables, and charts that fetch data via REST API calls
- **Chart Visualization**: ApexCharts integration for data visualization with interactive tooltips and menus
- **Map Integration**: Leaflet.js for geographical data representation with marker clustering
- **Component Libraries**: Select2 for enhanced dropdowns, SweetAlert2 for notifications

## Backend Architecture
- **Express.js Server**: RESTful API server handling HTTP requests and static file serving
- **Modular Routing**: Separate route handlers organized in `/routes` directory
- **Database Layer**: Microsoft SQL Server integration using `mssql` package with connection pooling
- **Authentication**: Token-based authentication using ACCESS_TOKEN environment variable
- **CORS Configuration**: Configured for specific Adani domain origins with fallback for development

## Data Management
- **Microsoft SQL Server**: Primary database for all dashboard data and user configurations
- **Connection Pooling**: Optimized database connections with automatic reconnection handling
- **Schema Flexibility**: Configurable database schema through environment variables
- **Real-time Queries**: Dynamic SQL generation based on user filters and permissions

## Security & Access Control
- **Token Authentication**: Header-based authentication using configurable ACCESS_TOKEN
- **CORS Protection**: Whitelist-based origin control for production domains
- **Environment Configuration**: Sensitive data managed through .env files
- **User-Level Filtering**: Role-based data access control at the database query level

# External Dependencies

## Database
- **Microsoft SQL Server**: Primary data store accessed via configurable connection parameters
- **Schema**: `dbo` (configurable) containing user charts, grids, and dashboard configurations

## Frontend Libraries
- **Bootstrap 4.5.2**: UI framework for responsive design
- **jQuery**: DOM manipulation and AJAX functionality
- **ApexCharts**: Interactive data visualization and charting
- **Leaflet.js 1.9.4**: Interactive maps with marker clustering support
- **Select2 4.0.13**: Enhanced dropdown components
- **SweetAlert2**: User notification and alert system
- **Font Awesome 5.15.4**: Icon library for UI elements

## Backend Dependencies
- **Express.js 5.1.0**: Web application framework
- **mssql 11.0.1**: Microsoft SQL Server driver with Azure support
- **cors 2.8.5**: Cross-origin resource sharing middleware
- **dotenv 17.2.1**: Environment variable management

## External Services
- **CDN Resources**: External hosting for CSS/JS libraries (cdnjs, unpkg, stackpath)
- **Adani Domains**: Integration with `ismsuser.adani.com` and `ismsdashboard.adani.com`
- **Font Services**: Google Fonts API for Poppins font family