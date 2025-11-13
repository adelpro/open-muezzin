# Open Muezzin

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#) [![Plasmo](https://img.shields.io/badge/Plasmo-F4A261?logo=plasmo&logoColor=fff)](#) [![License](https://img.shields.io/badge/License-MIT-green.svg)](#license) [![Version](https://img.shields.io/badge/Version-0.0.2-blue.svg)](#changelog)

Open-Muezzin is an open-source browser extension that provides accurate Islamic prayer times and location-based Athan notifications, with no tracking, no ads, and universal support for most browsers.

## Key Features

- **Accurate Prayer Times**: Uses the Adhan.js library for precise Islamic prayer time calculations
- **Location-Based Notifications**: Automatic location detection with manual location override options
- **Athan Notifications**: Audio notifications for prayer times with customizable settings
- **Multi-Browser Support**: Compatible with Chrome, Firefox, and other modern browsers
- **Privacy-Focused**: No tracking, no ads, completely open-source
- **Multi-Language Support**: Arabic and English localization
- **Responsive Design**: Modern UI with Tailwind CSS and dark mode support
- **Multiple Calculation Methods**: Support for various Islamic calculation methods

## Technology Stack

- **Framework**: [Plasmo](https://www.plasmo.com/) - Next-gen browser extension framework
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for persistent settings
- **Prayer Time Calculation**: Adhan.js library
- **Build Tool**: Vite
- **Package Manager**: pnpm

## System Requirements

- Node.js 16.x or higher
- pnpm package manager
- Modern web browser (Chrome 88+, Firefox 78+, Safari 14+)

## Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/open-muezzin.git
cd open-muezzin
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Development Setup

Start the development server:

```bash
pnpm dev
```

For Firefox development:

```bash
pnpm dev:firefox
```

### 4. Load the Extension in Your Browser

#### Chrome/Edge

1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` directory

#### Firefox

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `build/firefox-mv3-dev/manifest.json` file

## Usage Documentation

### Running the Application

The extension provides two main interfaces:

1. **Popup Interface** (click extension icon):
   - View current prayer times
   - See countdown to next prayer
   - Quick access to settings

2. **Options Page** (right-click → Options):
   - Configure calculation method
   - Set location preferences
   - Customize time format (12/24 hour)
   - Manage notification settings

### Common Commands

```bash
# Development
pnpm dev              # Start development server (Chrome)
pnpm dev:firefox      # Start development server (Firefox)

# Building
pnpm build            # Build for production (Chrome)
pnpm build:firefox    # Build for production (Firefox)

# Code Quality
pnpm lint             # Run ESLint
pnpm clean            # Clean build artifacts

# Packaging
pnpm package          # Create extension package
```

### Configuration Options

The extension supports the following configuration options:

- **Calculation Method**: Choose from various Islamic calculation methods (Muslim World League, ISNA, etc.)
- **Location Settings**: Automatic location detection or manual city selection
- **Time Format**: Toggle between 12-hour and 24-hour formats
- **Notifications**: Enable/disable Athan notifications
- **Language**: Switch between Arabic and English interfaces

## Development Guidelines

### Contribution Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run linting and tests (`pnpm lint`)
5. Commit using conventional commits (`yarn commit`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Testing Procedures

- **Manual Testing**: Test the extension in both Chrome and Firefox
- **Code Quality**: Run `pnpm lint` to ensure code quality
- **Build Verification**: Ensure `pnpm build` completes successfully
- **Extension Loading**: Verify the extension loads correctly in browsers

### Code Style Standards

- **TypeScript**: Strict mode enabled with no implicit any
- **React**: Functional components with hooks only
- **File Naming**: snake_case for all files
- **Imports**: Sorted imports with specific order
- **Styling**: Tailwind CSS classes, no inline styles
- **Accessibility**: All interactive elements must be keyboard and screen-reader friendly

### Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── lib/                # Utility functions
├── background/         # Background scripts
├── popup/              # Popup interface
├── options/            # Options page
├── styles.css          # Global styles
└── assets/             # Static assets
```

## Build & Deployment

### Production Build

Create a production-ready build:

```bash
pnpm build
```

This creates optimized builds in the `build` directory:

- `chrome-mv3-prod/` - Chrome extension
- `firefox-mv3-prod/` - Firefox extension

### Automated Deployment

The project includes GitHub Actions workflow for automated deployment:

1. **Manual Trigger**: Use the "Submit to Web Store" workflow
2. **Automated Builds**: Runs on `pnpm build` and `pnpm package`
3. **Browser Store Submission**: Configured for Chrome Web Store and Firefox Add-ons

## Additional Information

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and version updates.

### Acknowledgments

- **[Adhan.js](https://github.com/batoulapps/adhan-js)**: For accurate prayer time calculations
- **[Plasmo Framework](https://www.plasmo.com/)**: For the excellent browser extension development platform
- **[Tailwind CSS](https://tailwindcss.com/)**: For the utility-first CSS framework
- **[React](https://reactjs.org/)**: For the component-based UI library

### Contact Details

- **Author**: Adelpro
- **Email**: <contact@adelpro.us.kg>
- **Project Link**: [https://github.com/adelpro/open-muezzin](https://github.com/adelpro/open-muezzin)

### Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/adelpro/open-muezzin/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for the Muslim community worldwide**
