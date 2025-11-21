# Changelog

All notable changes to this project are documented below.  
This follows [Conventional Commits](https://www.conventionalcommits.org/) style.

## [v0.0.4] - 2025-11-21

### Features

- feat: add notifications for adhan

## [v0.0.3] - 2025-11-20

### Features

- feat: add privacy policy pages for English and Arabic

### Refactors

- refactor: refactor the logic of location calculation to be more solid and simpler

## [v0.0.2] - 2025-11-09

### Features

- feat: add footer links to options page (GitHub, extension home, privacy policy)

### Fixes

- fix: correct location search debounce issue to avoid unnecessary API calls

### Refactors

- refactor: simplify popup layout structure for better UI and readability

### Chores

- chore: update dependencies

## [v0.0.1] - 2024-01-01

### Features

- feat: initial setup of Plasmo framework with React and TypeScript
- feat: integrate Adhan.js for Islamic prayer times calculation
- feat: implement popup interface with prayer times display
- feat: create comprehensive options page with settings management
- feat: responsive design with Tailwind CSS
- feat: automatic location detection using browser geolocation API
- feat: manual location search with Nominatim API integration
- feat: real-time countdown to next prayer and current prayer highlighting
- feat: support 12/24 hour format toggle
- feat: extension badge showing time to next prayer
- feat: background service for continuous prayer time monitoring
- feat: localized interface with Arabic and English support
- feat: multiple calculation methods and customizable prayer time settings
- feat: persistent storage using browser extension storage API

### Development Setup

- chore: configure ESLint and Prettier for consistent code formatting
- chore: integrate PostCSS and Tailwind CSS for styling
- chore: full TypeScript implementation with strict type checking
- chore: organize component-based architecture with separation of concerns

### Assets

- feat: add extension icon (512px)
- feat: integrate Adhan notification sound (adhan-alger.ogg)
- chore: establish color palette and design tokens

### Documentation

- chore: create comprehensive README.md with setup instructions
- feat: add locale support for Arabic and English languages
- chore: configure for Chrome MV3 and Firefox support
