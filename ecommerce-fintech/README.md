# AI Co-founder: Ethical AI Assistant for E-Commerce Entrepreneurs

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss)
![N8N](https://img.shields.io/badge/N8N-Workflows-00FFFF?style=for-the-badge)
![MCP](https://img.shields.io/badge/MCP-Integration-FF6B6B?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)

## Project Overview

The AI Co-founder is an ethical AI assistant designed specifically for solo entrepreneurs in the e-commerce sector. This project was developed as part of a Capstone initiative to create a conversational AI platform that helps automate operations such as shop setup, email marketing, and social media scheduling while prioritizing ethical considerations including bias mitigation, data privacy (GDPR compliance), and human-AI collaboration. The system aims to boost productivity by 30-50% without compromising fairness or stakeholder well-being.

The platform integrates various specialized AI agents through a chat interface similar to ChatGPT, allowing entrepreneurs to manage all operations via natural language commands. These agents handle specific functions like Cart Recovery, Inventory Management, SEO/Content Creation, and Marketing, enabling automation of repetitive tasks while maintaining human-in-the-loop oversight.

![AI Co-founder Dashboard](https://via.placeholder.com/800x400?text=AI+Co-founder+Dashboard)

## Core Features

### 1. Conversational AI Interface
- Natural language chat interface for business management
- Centralized command center for all e-commerce operations
- Intuitive interactions modeled after ChatGPT

### 2. Specialized AI Agents

#### Cart Recovery Agent
- Monitors abandoned cart data (70.19% abandonment rate industry-wide)
- Automates follow-up messaging via email/SMS
- Personalized discount offerings and customer re-engagement
- Analytics for understanding abandonment patterns

#### Inventory Management Agent
- Stock level monitoring and alerts
- Sales trend analysis and forecasting
- Automated reordering based on thresholds
- Supplier performance analysis and recommendations

#### SEO/Content Agent
- Keyword performance tracking and optimization
- Content generation for product descriptions and blogs
- Website SEO audits and improvement recommendations
- Backlink and ranking analysis

#### Marketing Agent
- Automated social media content planning and scheduling
- Ad campaign optimization and A/B testing
- Engagement analytics and ROI tracking
- Cross-promotional strategy development

### 3. Ethical AI Implementation
- Bias detection and mitigation systems
- GDPR-compliant data handling and anonymization
- Human-in-the-loop oversight for critical decisions
- Data security through isolated software architecture

### 4. Workflow Automation
- n8n-powered workflow integration
- Seamless connections to e-commerce tools (Shopify, Klaviyo)
- Process automation for repetitive tasks
- Real-time monitoring and status updates

## Technology Stack

- **Frontend:** React with Tailwind CSS
- **Build Tool:** Vite
- **State Management:** React Hooks, Context API
- **Workflow Automation:** n8n
- **AI Integration:** Model Context Protocol (MCP) servers
- **Agent Architecture:** LangChain/LangGraph
- **Local LLM:** Ollama (for ethical safeguards and privacy)
- **Integration Capabilities:** Shopify, Klaviyo, Twilio APIs (planned)

## Project Status and Achievements

This project was developed across two sprints, delivering a functional prototype that demonstrates the potential for AI-assisted e-commerce operations:

### Sprint 1 Accomplishments:
- Defined standard business models in e-commerce, identifying pain points like cart abandonment (70.19%)
- Explored MCP for AI-human collaboration, focusing on shop creation, email marketing, and social media automation
- Addressed ethical, legal, and compliance considerations for AI tools
- Proposed feasible AI integration workflows including dynamic email sequences and social scheduling
- Projected 20-30% operational savings and 3-5x ROI through human-AI synergy

### Sprint 2 Accomplishments:
- Created MCP Problem Statement documents outlining organizational problems addressable through MCP
- Developed workflow diagrams showing intercommunication between system components
- Researched tools supporting MCP implementations, selecting n8n for the prototype
- Created individual MCP tool workflows and AI integrations
- Built a functional React dashboard with integrated workflows
- Conducted internal simulations demonstrating efficiency improvements

### Current Status:
The prototype currently features:
- Functional UX interface with conversational AI chat
- Working agent orchestration system using React/Tailwind CSS
- n8n workflow automation for basic operations
- Embedded ethical safeguards
- AI simulation producing realistic automation outputs

The system is not yet connected to live production backends or external e-commerce tools.

## Installation and Setup

### Requirements
- Node.js (v16+)
- npm or yarn
- Docker (for n8n and other services)
- Ollama (for local LLM hosting)

### Required Services
To fully utilize this project, you'll need to host the following services:

1. **n8n** - Workflow automation server (Docker recommended)
2. **Ollama** - Local LLM hosting for ethical AI processing
3. **Frontend Interface** - React application (chat-n8n)
4. **Data Server** - For cart data analysis (cart-data-server)
5. **MCP Server** - For Model Context Protocol communication

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/your-username/ai-cofounder-ecommerce.git
cd ai-cofounder-ecommerce
```

2. Install dependencies for all components
```bash
# Install chat interface dependencies
cd chat-n8n
npm install
cd ..

# Install cart analysis MCP dependencies
cd cart-analysis-mcp
npm install
cd ..

# Install cart data server dependencies
cd cart-data-server
npm install
cd ..
```

3. Set up environment variables
```bash
# Create .env file for the MCP server (if using Brave Search)
cd cart-analysis-mcp
cp .env.example .env
# Edit the .env file to add your Brave Search API key
cd ..
```

4. Run the frontend development environment
```bash
cd chat-n8n
npm run dev
# or
yarn dev
```

5. Access the application at `http://localhost:5173`

6. For full functionality, start all services:
```bash
# In separate terminals:

# Start the MCP server
cd cart-analysis-mcp
npm start

# Start the cart data server
cd cart-data-server
npm start

# Start n8n (using Docker)
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Start Ollama (if using local LLMs)
ollama serve
```

7. Import the provided n8n workflows by following the n8n-integration-guide.md instructions

### Setting up n8n with Docker

1. Start n8n using Docker:
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

2. Access n8n at `http://localhost:5678`

3. Import the provided workflow:
   - Go to Workflows → Import from File
   - Select the `AI co-founder store.json` file
   - Save the workflow and activate it

### Setting up Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai)

2. Pull the Llama 3.1 8B model:
```bash
ollama pull llama3.1:8b
```

3. Start the Ollama server:
```bash
ollama serve
```

4. Configure n8n to connect to your Ollama instance:
   - In n8n, go to Settings → Credentials
   - Add new Ollama API credentials
   - Set the host URL to `http://host.docker.internal:11434` if running in Docker, or `http://localhost:11434` if running locally

### Setting up the Data Server

1. Start the cart data server:
```bash
cd cart-data-server
npm install
npm start
```

2. The server will be available at `http://localhost:3000`

### Project Structure

```
project/
├── chat-n8n/               # Main React application
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/        # Chat interface components
│   │   │   ├── dashboard/   # Dashboard visualization
│   │   │   ├── email/       # Email marketing components
│   │   │   ├── n8nWorkflow/ # n8n integration components
│   │   │   ├── website/     # Website builder components
│   │   │   └── ui/          # Shared UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Layout components
│   │   ├── services/        # Service APIs
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Root component
│   │   ├── App.css          # Global styles
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── cart-analysis-mcp/       # MCP integration for cart analysis
│   ├── examples/            # Example workflows
│   └── tools/               # MCP tools
│
├── cart-data-server/        # Cart data API server
│   └── examples/            # Example implementations
│
├── cart-data-analysis.ipynb # Jupyter notebook for cart analysis
│
└── n8n-integration-guide.md # Guide for integrating n8n with the system
```

## Component Descriptions

### chat-n8n
The main React application featuring a ChatGPT-like interface that serves as the central control point for all AI agents. It includes modules for dashboard visualization, email marketing campaign management, website building, and n8n workflow integration. Each component has its own README with detailed setup and usage instructions.

### cart-analysis-mcp
MCP (Model Context Protocol) integration specifically for cart abandonment analysis. This module connects the chat interface with specialized LLMs and tools for analyzing customer behavior, identifying patterns in cart abandonment, and automatically generating recovery strategies. The module includes a comprehensive README with installation and API documentation.

### cart-data-server
A server handling cart data storage and retrieval, providing APIs for the frontend to access abandoned cart information, customer profiles, and purchasing patterns while maintaining GDPR compliance. The server includes a README with API endpoint documentation and integration instructions.

### cart-data-analysis.ipynb
A Jupyter notebook containing examples and demonstrations of cart data analysis techniques, serving as both documentation and a development tool for improving the cart recovery agent's capabilities. A separate markdown document provides instructions for using the notebook.

### n8n-integration-guide.md
A comprehensive guide for integrating the system with n8n workflows, including setup instructions, workflow templates, and troubleshooting tips. This document is essential for understanding how the various components connect through n8n automation.

## Next Steps for Future Development

The project has completed the research phase and delivered a working prototype. Future teams could enhance the system by:

1. **Integrating Dedicated Data Dashboards** for each AI agent:
   - Cart Recovery dashboard with real-time abandonment metrics
   - Inventory dashboard with sales trends and stock forecasting
   - SEO dashboard with keyword performance and content recommendations
   - Marketing dashboard with campaign analytics and A/B testing results

2. **Implementing Live Backend Connections**:
   - Integration with Shopify, Klaviyo, and Twilio APIs
   - Real-time data syncing with e-commerce platforms
   - Payment processing system connections

3. **Enhancing Security and Compliance**:
   - Role-based access controls
   - Secure data storage solutions
   - Advanced GDPR compliance measures

4. **Expanding the Agent Pool**:
   - Customer service automation
   - Product recommendation engines
   - Supply chain optimization
   - Business intelligence reporting

5. **Conducting Pilot Testing** with actual solo entrepreneurs to gather feedback and refine the user experience

## Deployment

The project can be deployed using services like Vercel, Netlify, or GitHub Pages for the frontend, while backend services would require appropriate server deployments:

```bash
# Build for production
npm run build
# or
yarn build
```

For a complete deployment, you would also need:
1. n8n server instance for workflow automation
2. MCP server deployment for AI agent coordination
3. Database setup for storing customer and business data
4. API configuration for e-commerce platform integrations

## Business Impact

The AI Co-founder project aims to deliver significant business value for solo entrepreneurs:

- **Efficiency Gains**: 30-50% boost in productivity through task automation
- **Cost Savings**: 20-30% reduction in operational costs
- **ROI**: Projected 3-5x return on investment through human-AI collaboration
- **Operational Improvements**: Reduction in cart abandonment rates (industry average: 70.19%)
- **Ethical Advantage**: Built-in bias detection, data privacy compliance, and human oversight

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## References

- [n8n Documentation](https://docs.n8n.io/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Model Context Protocol](https://modelcontextprotocol.github.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [LangChain Documentation](https://js.langchain.com/docs/)

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

Email - team@ai-cofounder.com
GitHub - [@ai-cofounder-team](https://github.com/ai-cofounder-team)