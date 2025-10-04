# Apostles Model Builder

## Overview
The Apostles Model Builder is a React-based web application for visualizing and analyzing user satisfaction and loyalty data. It provides a sophisticated interface for data entry, visualization, and analysis using the Apostles Model methodology.

## Features
- 📊 Interactive data visualization with quadrant analysis
- 📝 Multiple data input methods (manual entry and CSV import)
- 📈 Dynamic scale management (5-point, 7-point, and 10-point scales)
- 🎯 Advanced positioning and zone management
- 📱 Responsive design with modern UI components
- 💾 Local storage persistence
- 📤 Export capabilities (coming soon)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/apostles-model.git
cd apostles-model
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

## Project Structure
```
apostles-model/
├── src/
│   ├── components/        # React components
│   │   ├── data-entry/   # Data input components
│   │   ├── ui/           # Shared UI components
│   │   └── visualization/# Visualization components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── public/              # Static assets
```

## Technology Stack
- React 18
- TypeScript
- CSS Modules
- PapaParse (CSV parsing)
- React-Window (virtualization)
- Recharts (charting)

## Documentation
Detailed documentation is available in the `docs` directory:
- [Architecture Overview](./docs/architecture.md)
- [Component Documentation](./docs/components/)
- [Development Guide](./docs/development.md)

## Contributing
We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Apostles Model methodology by [Author]
- Design inspiration from [Sources]
