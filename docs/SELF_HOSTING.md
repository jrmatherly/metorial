<img src="../assets/repo-header.webp" alt="Metorial" width="100%" />

<h1 align="center">Self-Hosting Guide</h1>

<p align="center">
Complete guide to self-hosting Metorial and running MCP containers locally
</p>

> [!TIP]
> *Skip the self-hosting setup:* The fastest and most reliable way to use Metorial is through our hosted platform. Get started with our free tier and scale as needed.
>
> ➡️ **[Get Started with Hosted Metorial](https://app.metorial.com/)**

## Overview

This guide covers everything you need to self-host Metorial, including:

- Running the **Metorial Platform** (the engine that powers Metorial)
- Building and running **MCP containers** locally
- Configuring your self-hosted instance
- Integrating with your development workflow

Self-hosting gives you complete control over your Metorial infrastructure, enabling you to:

- Run Metorial entirely on your own infrastructure
- Customize the platform to your specific needs
- Ensure data privacy and compliance requirements
- Develop and test new MCP servers locally

## Architecture

The Metorial ecosystem consists of three main components:

1. **[Metorial Platform](https://github.com/metorial/metorial-platform)** - The engine that manages MCP sessions, handles OAuth flows, and orchestrates server deployments
2. **[MCP Containers](https://github.com/metorial/mcp-containers)** (this repo) - Containerized MCP servers that provide tools and resources to AI models
3. **Metorial SDKs** - Client libraries for [Node.js/TypeScript](https://github.com/metorial/metorial-node) and [Python](https://github.com/metorial/metorial-python)

## Prerequisites

Before setting up your self-hosted Metorial instance, ensure you have the following installed:

### Required Tools

- **[Docker](https://www.docker.com/)** (v20.10 or later) - For running containerized MCP servers
- **[Docker Compose](https://docs.docker.com/compose/)** (v2.0 or later) - For orchestrating multiple containers
- **[Bun](https://bun.sh/)** (v1.0 or later) - For building MCP servers and running scripts
- **[Nixpacks](https://nixpacks.com/docs/install)** - For building container images without Dockerfiles

### Optional Tools

- **[Node.js](https://nodejs.org/)** (v18 or later) - If you prefer npm/yarn over Bun
- **[Git](https://git-scm.com/)** - For cloning repositories and version control

### System Requirements

- **Operating System:** Linux, macOS, or Windows with WSL2
- **RAM:** Minimum 4GB, recommended 8GB or more
- **Disk Space:** Minimum 10GB free space for containers and builds
- **Network:** Internet connection for pulling images and dependencies

## Quick Start

Get up and running with a self-hosted Metorial instance in minutes:

### 1. Clone the Repositories

First, clone both the MCP Containers repository and the Metorial Platform:

```bash
# Clone MCP Containers
git clone https://github.com/metorial/mcp-containers.git
cd mcp-containers

# Clone Metorial Platform (in a separate directory)
cd ..
git clone https://github.com/metorial/metorial-platform.git
cd metorial-platform
```

### 2. Set Up MCP Containers

Install dependencies and verify the build system:

```bash
cd mcp-containers
bun install

# Verify installation
bun run check-versions
```

### 3. Build MCP Servers

You can build individual servers or all servers at once:

```bash
# Build a specific server (faster for testing)
bun run build single github

# Or build all servers (takes longer)
bun run build all
```

### 4. Set Up the Metorial Platform

Follow the setup instructions in the [Metorial Platform repository](https://github.com/metorial/metorial-platform):

```bash
cd ../metorial-platform

# Follow the platform-specific setup instructions
# (Refer to the platform's README for detailed steps)
```

### 5. Configure Your Environment

Create a `.env` file in your Metorial Platform directory with the required configuration:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/metorial

# Redis (for session management)
REDIS_URL=redis://localhost:6379

# API Keys (for OAuth and external services)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# MCP Container Registry
MCP_REGISTRY_URL=http://localhost:5000
```

> [!NOTE]
> See the [Configuration](#configuration) section for detailed environment variable options.

## Building MCP Containers

### Building Individual Servers

To build a specific MCP server container:

```bash
# Build by server ID
bun run build single <server-id>

# Examples:
bun run build single github
bun run build single google-calendar
bun run build single slack
```

This will:
1. Read the server's `metorial.json` configuration
2. Use Nixpacks to generate a build plan
3. Build the Docker image
4. Tag the image appropriately

### Building All Servers

To build all available MCP servers:

```bash
bun run build all
```

This process will:
- Build all servers in the `servers/` directory
- Build all cataloged servers from `catalog/`
- Display progress and any errors
- Generate a build report

> [!WARNING]
> Building all servers can take significant time (30+ minutes) and disk space (10+ GB).

### Building Custom Servers

To add and build your own MCP server:

```bash
# Run the interactive server wizard
bun add-server

# Follow the prompts to:
# 1. Choose server type (custom or catalog)
# 2. Configure server metadata
# 3. Set up OAuth (if needed)
# 4. Test build the server
```

For more details, see the [Contributing Guide](../CONTRIBUTING.md).

## Configuration

### Environment Variables

Configure your self-hosted Metorial instance using environment variables:

#### Core Platform Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `PORT` | Platform API port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `LOG_LEVEL` | Logging verbosity | No | `info` |

#### MCP Container Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MCP_REGISTRY_URL` | Docker registry URL for MCP containers | Yes | - |
| `MCP_BUILD_TIMEOUT` | Build timeout in seconds | No | `600` |
| `MCP_MAX_MEMORY` | Maximum memory per container (MB) | No | `512` |
| `MCP_MAX_CPU` | Maximum CPU per container (cores) | No | `1.0` |

#### OAuth Configuration

Configure OAuth providers for MCP servers that require authentication:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub server |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | For GitHub server |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google servers |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Google servers |
| `SLACK_CLIENT_ID` | Slack OAuth client ID | For Slack server |
| `SLACK_CLIENT_SECRET` | Slack OAuth client secret | For Slack server |

> [!TIP]
> Store sensitive credentials in a `.env` file and never commit it to version control.

### Server Configuration

Each MCP server has its own `metorial.json` configuration file. Example:

```json
{
  "id": "github",
  "name": "GitHub MCP Server",
  "version": "1.0.0",
  "description": "MCP server for GitHub API integration",
  "runtime": "typescript.deno",
  "entrypoint": "server.ts",
  "oauth": {
    "provider": "github",
    "scopes": ["repo", "user"]
  }
}
```

### Network Configuration

By default, MCP containers run on an isolated Docker network. To customize:

```bash
# Create a custom network
docker network create metorial-network

# Run containers on the custom network
docker run --network metorial-network <container-image>
```

## Docker Usage

### Running MCP Containers

After building your MCP servers, run them as Docker containers:

#### Running a Single Server

```bash
# Run the GitHub MCP server
docker run -d \
  --name mcp-github \
  -e GITHUB_TOKEN=your_token_here \
  -p 3001:3000 \
  metorial/github:latest

# View logs
docker logs -f mcp-github

# Stop the container
docker stop mcp-github
```

#### Using Docker Compose

Create a `docker-compose.yml` file for managing multiple MCP servers:

```yaml
version: '3.8'

services:
  github-server:
    image: metorial/github:latest
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    ports:
      - "3001:3000"
    restart: unless-stopped

  google-calendar-server:
    image: metorial/google-calendar:latest
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    ports:
      - "3002:3000"
    restart: unless-stopped

  slack-server:
    image: metorial/slack:latest
    environment:
      - SLACK_TOKEN=${SLACK_TOKEN}
    ports:
      - "3003:3000"
    restart: unless-stopped

networks:
  default:
    name: metorial-network
```

Start all servers:

```bash
docker-compose up -d

# View logs for all services
docker-compose logs -f

# Stop all services
docker-compose down
```

#### Container Management

Common Docker commands for managing MCP containers:

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-name>

# Execute commands in a running container
docker exec -it <container-name> /bin/sh

# Remove a container
docker rm <container-name>

# Remove all stopped containers
docker container prune

# View container resource usage
docker stats
```

### Docker Registry

For production deployments, you may want to push your built containers to a private registry:

```bash
# Tag the image for your registry
docker tag metorial/github:latest registry.example.com/metorial/github:latest

# Push to registry
docker push registry.example.com/metorial/github:latest

# Pull from registry
docker pull registry.example.com/metorial/github:latest
```

## Integration with Development Workflow

### Using with Claude Desktop

Configure Claude Desktop to use your self-hosted MCP servers:

1. Open Claude Desktop settings
2. Navigate to **Developer** → **Edit Config**
3. Add your self-hosted server:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_TOKEN",
        "metorial/github:latest"
      ],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Using with Cursor

Configure Cursor to use your self-hosted MCP servers:

1. Open Cursor settings
2. Go to **Features** → **MCP Servers**
3. Add your server configuration similar to Claude Desktop

### Using with the Metorial SDK

Connect your self-hosted platform to the Metorial SDK:

```typescript
import { Metorial } from 'metorial';

const metorial = new Metorial({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000' // Your self-hosted platform URL
});

// Use as normal
const result = await metorial.run({
  message: 'Create a GitHub issue for bug fix',
  serverDeployments: ['github-server'],
  model: 'gpt-4o',
  client: openai
});
```

```python
from metorial import Metorial

metorial = Metorial(
    api_key="your-api-key",
    base_url="http://localhost:3000"  # Your self-hosted platform URL
)

# Use as normal
response = await metorial.run(
    message="Create a GitHub issue for bug fix",
    server_deployments=["github-server"],
    model="gpt-4o",
    client=openai
)
```

## Troubleshooting

### Common Issues

#### Build Failures

**Issue:** Server build fails with "Nixpacks not found"

```bash
# Verify Nixpacks installation
nixpacks --version

# If not installed, install Nixpacks
curl -sSL https://nixpacks.com/install.sh | bash
```

**Issue:** Docker build fails with permission errors

```bash
# On Linux, add your user to the docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker access
docker ps
```

**Issue:** Build fails with "out of memory" error

```bash
# Increase Docker memory limit in Docker Desktop settings
# Or use the build command with memory limits:
docker build --memory=4g --memory-swap=4g -t <image-name> .
```

#### Runtime Issues

**Issue:** Container exits immediately after starting

```bash
# Check container logs for errors
docker logs <container-name>

# Verify environment variables are set
docker inspect <container-name> | grep -A 10 Env
```

**Issue:** Cannot connect to MCP server

```bash
# Verify container is running
docker ps | grep <container-name>

# Check port mappings
docker port <container-name>

# Test connection
curl http://localhost:<port>/health
```

**Issue:** OAuth flow fails

1. Verify OAuth credentials are correctly set in environment variables
2. Ensure redirect URIs match your configuration
3. Check the platform logs for OAuth errors
4. Verify the OAuth provider's app settings

#### Platform Issues

**Issue:** Platform fails to start

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Redis connection
redis-cli -u $REDIS_URL ping

# View platform logs
docker-compose logs platform
```

**Issue:** Platform cannot find MCP containers

1. Verify containers are running: `docker ps`
2. Check network connectivity between platform and containers
3. Verify `MCP_REGISTRY_URL` is correctly configured
4. Ensure container names match deployment configurations

### Getting Help

If you encounter issues not covered here:

1. **Check the logs:** Most issues can be diagnosed from container and platform logs
2. **Search issues:** Look through [GitHub Issues](https://github.com/metorial/mcp-containers/issues) for similar problems
3. **Ask the community:** Join our [Discord community](https://discord.gg/metorial) for support
4. **Report bugs:** Open a new issue with detailed reproduction steps

Include the following information when reporting issues:

- Operating system and version
- Docker version (`docker --version`)
- Bun version (`bun --version`)
- Nixpacks version (`nixpacks --version`)
- Relevant logs and error messages
- Steps to reproduce the issue

## Advanced Topics

### Custom MCP Server Development

To develop custom MCP servers for your self-hosted instance:

1. Use the server wizard: `bun add-server`
2. Follow the patterns in `servers/` directory
3. Implement using `@metorial/mcp-server-sdk`
4. Build and test locally before deploying

For detailed guidance, see the [Contributing Guide](../CONTRIBUTING.md).

### Scaling Your Deployment

For production deployments:

- **Use Kubernetes:** Deploy MCP containers using Kubernetes for orchestration
- **Load Balancing:** Use a load balancer to distribute traffic across multiple platform instances
- **Monitoring:** Set up monitoring with Prometheus and Grafana
- **Logging:** Centralize logs using the ELK stack or similar
- **Backup:** Implement regular database backups

### Security Best Practices

When self-hosting Metorial:

- **Use HTTPS:** Always use SSL/TLS for production deployments
- **Rotate Secrets:** Regularly rotate API keys and OAuth credentials
- **Network Isolation:** Run containers on isolated networks
- **Resource Limits:** Set memory and CPU limits on containers
- **Access Control:** Implement proper authentication and authorization
- **Update Regularly:** Keep dependencies and containers up to date

### Performance Optimization

Optimize your self-hosted deployment:

- **Container Caching:** Use Docker layer caching to speed up builds
- **Registry Mirrors:** Use a local Docker registry mirror
- **Resource Allocation:** Allocate appropriate CPU and memory to containers
- **Database Tuning:** Optimize PostgreSQL settings for your workload
- **Redis Configuration:** Configure Redis for optimal session management

## Resources

### Documentation

- **[Metorial Platform Repository](https://github.com/metorial/metorial-platform)** - The engine powering Metorial
- **[MCP Containers Repository](https://github.com/metorial/mcp-containers)** - This repository
- **[Metorial Node SDK](https://github.com/metorial/metorial-node)** - TypeScript/JavaScript SDK
- **[Metorial Python SDK](https://github.com/metorial/metorial-python)** - Python SDK
- **[Model Context Protocol Specification](https://modelcontextprotocol.io/)** - Official MCP docs

### Community

- **[Discord Community](https://discord.gg/metorial)** - Get help and connect with other users
- **[GitHub Discussions](https://github.com/metorial/mcp-containers/discussions)** - Ask questions and share ideas
- **[Twitter/X](https://twitter.com/metorial)** - Follow for updates and announcements

### Contributing

We welcome contributions to both the platform and MCP servers! See:

- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to this repository

---

**Need more help?** Check out our [hosted platform](https://app.metorial.com/) for a fully managed solution, or reach out to our team at [hello@metorial.com](mailto:hello@metorial.com).
