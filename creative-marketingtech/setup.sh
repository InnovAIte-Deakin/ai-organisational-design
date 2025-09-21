#!/bin/bash

# Social Media Campaign Tool - Setup Script
# This script sets up the complete project with all dependencies

set -e  # Exit on any error

echo "🚀 Setting up Social Media Campaign Tool..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env.local from template
if [ ! -f .env.local ]; then
    print_status "Creating .env.local from template..."
    cp env.template .env.local
    print_success ".env.local created"
    print_warning "Please edit .env.local and add your API keys:"
    print_warning "  - GEMINI_API_KEY: Get from https://aistudio.google.com/apikey"
    print_warning "  - KIE_API_KEY: Get from https://kieai.erweima.ai"
else
    print_warning ".env.local already exists, skipping creation"
fi

# Create additional directories if needed
print_status "Creating additional directories..."
mkdir -p public/images
mkdir -p public/videos
mkdir -p logs
print_success "Directories created"

# Set up git hooks (optional)
if [ -d .git ]; then
    print_status "Setting up git hooks..."
    # Add pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi
EOF
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
fi

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check

if [ $? -eq 0 ]; then
    print_success "TypeScript type checking passed"
else
    print_warning "TypeScript type checking failed. Please fix the issues."
fi

# Run linting
print_status "Running ESLint..."
npm run lint

if [ $? -eq 0 ]; then
    print_success "ESLint passed"
else
    print_warning "ESLint found issues. Please fix them."
fi

# Build the project
print_status "Building the project..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Project built successfully"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Create README.md if it doesn't exist
if [ ! -f README.md ]; then
    print_status "Creating README.md..."
    cat > README.md << 'EOF'
# Social Media Campaign Tool

AI-powered social media campaign generation using Gemini 2.0 Flash and Kie.ai APIs.

## Features

- 🎯 Single post generation for multiple platforms
- 📅 Full campaign generation with strategy
- 🎨 AI-enhanced prompts
- 🖼️ Image and video generation
- 📱 Platform-specific optimization
- 🚀 Real-time progress tracking

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your API keys
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Keys Required

- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/apikey)
- **Kie.ai API Key**: Get from [Kie.ai](https://kieai.erweima.ai)

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
docker build -t social-media-tool .
docker run -p 3000:3000 --env-file .env.local social-media-tool
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── lib/          # Utilities and services
│   └── page.tsx      # Main page
├── public/           # Static assets
└── package.json      # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
EOF
    print_success "README.md created"
fi

# Final success message
echo ""
print_success "🎉 Setup completed successfully!"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env.local and add your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${BLUE}API Keys needed:${NC}"
echo "• Gemini API Key: https://aistudio.google.com/apikey"
echo "• Kie.ai API Key: https://kieai.erweima.ai"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "• npm run dev     - Start development server"
echo "• npm run build   - Build for production"
echo "• npm run lint    - Run linting"
echo "• npm run type-check - Check TypeScript types"
echo ""
print_success "Happy coding! 🚀"
