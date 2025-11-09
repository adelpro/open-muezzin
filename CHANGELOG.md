# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.0.2] - 2024-12-19

### 🚧 In Development

This version is currently under development with upcoming features and improvements.

## [v0.0.1] - 2024-01-01

### ✨ Features

- **Extension Architecture**: Initial setup of Plasmo framework with React and TypeScript
- **Prayer Times Calculation**: Integrated Adhan.js library for accurate Islamic prayer times
- **User Interface**:
  - Implemented popup interface with prayer times display
  - Created comprehensive options page with settings management
  - Added responsive design with Tailwind CSS
- **Location Services**:
  - Automatic location detection using browser geolocation API
  - Manual location search with Nominatim API integration
  - In-memory caching for optimized reverse geocoding
- **Prayer Time Display**:
  - Real-time countdown to next prayer
  - Current prayer highlighting with visual indicators
  - Support for 12/24 hour format toggle
- **Browser Extension Features**:
  - Extension badge showing time to next prayer
  - Background service for continuous prayer time monitoring
  - Localized interface with Arabic and English support
- **Configuration**:
  - Multiple calculation methods (Muslim World League, etc.)
  - Customizable prayer time settings
  - Persistent storage using browser extension storage API

### 🔧 Development Setup

- **Code Quality**: Configured ESLint and Prettier for consistent code formatting
- **Build System**: Integrated PostCSS and Tailwind CSS for styling
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Project Structure**: Organized component-based architecture with proper separation of concerns

### 📦 Assets

- **Branding**: Added extension icon (512px)
- **Audio**: Integrated Adhan notification sound (adhan-alger.ogg)
- **Design System**: Established color palette and design tokens

### 📚 Documentation

- **Project Documentation**: Created comprehensive README.md with setup instructions
- **Internationalization**: Added locale support for Arabic and English languages
- **Browser Compatibility**: Configured for Chrome MV3 and Firefox support
