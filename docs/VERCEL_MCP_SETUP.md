# Vercel MCP Server Setup Guide

This guide will help you set up a Vercel MCP (Model Context Protocol) server to enable AI assistants to interact with your Vercel deployments.

## Overview

The MCP server will allow AI assistants (like Cursor, ChatGPT, etc.) to:
- Monitor deployment status
- View build logs
- Inspect deployments
- Manage environment variables
- Trigger deployments

## Prerequisites

- Vercel account (already authenticated: `samdekian`)
- Node.js 18+ installed
- Vercel CLI installed (already installed: `vercel@48.8.0`)

## Step 1: Create MCP Server Project

Create a new directory for the MCP server:

```bash
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev"
mkdir vercel-mcp-server
cd vercel-mcp-server
```

## Step 2: Initialize Project

```bash
npm init -y
npm install @modelcontextprotocol/sdk vercel @vercel/node
npm install -D typescript @types/node tsx
```

## Step 3: Create MCP Server Structure

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "deploy": "vercel --prod"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/api/$1.ts"
    }
  ]
}
```

## Step 4: Create MCP Server Implementation

### `src/server.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class VercelMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'vercel-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_deployments',
          description: 'List recent Vercel deployments for a project',
          inputSchema: {
            type: 'object',
            properties: {
              project: {
                type: 'string',
                description: 'Vercel project name (default: mind-boom-3-0-twilio)',
              },
              limit: {
                type: 'number',
                description: 'Number of deployments to return (default: 10)',
              },
            },
          },
        },
        {
          name: 'get_deployment',
          description: 'Get details of a specific Vercel deployment',
          inputSchema: {
            type: 'object',
            properties: {
              deploymentUrl: {
                type: 'string',
                description: 'Vercel deployment URL',
              },
            },
            required: ['deploymentUrl'],
          },
        },
        {
          name: 'get_deployment_logs',
          description: 'Get build logs for a Vercel deployment',
          inputSchema: {
            type: 'object',
            properties: {
              deploymentUrl: {
                type: 'string',
                description: 'Vercel deployment URL',
              },
            },
            required: ['deploymentUrl'],
          },
        },
        {
          name: 'list_projects',
          description: 'List all Vercel projects',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'trigger_deployment',
          description: 'Trigger a new deployment for a project',
          inputSchema: {
            type: 'object',
            properties: {
              project: {
                type: 'string',
                description: 'Vercel project name',
              },
              branch: {
                type: 'string',
                description: 'Git branch to deploy (default: main)',
              },
            },
            required: ['project'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_deployments':
            return await this.listDeployments(args as any);
          case 'get_deployment':
            return await this.getDeployment(args as any);
          case 'get_deployment_logs':
            return await this.getDeploymentLogs(args as any);
          case 'list_projects':
            return await this.listProjects();
          case 'trigger_deployment':
            return await this.triggerDeployment(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async listDeployments(args: { project?: string; limit?: number }) {
    const project = args.project || 'mind-boom-3-0-twilio';
    const limit = args.limit || 10;

    const { stdout } = await execAsync(
      `vercel ls --limit ${limit} --json`
    );

    const deployments = JSON.parse(stdout);
    const filtered = deployments.filter((d: any) => 
      d.name === project || d.url?.includes(project)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(filtered, null, 2),
        },
      ],
    };
  }

  private async getDeployment(args: { deploymentUrl: string }) {
    const { stdout } = await execAsync(
      `vercel inspect ${args.deploymentUrl} --json`
    );

    return {
      content: [
        {
          type: 'text',
          text: stdout,
        },
      ],
    };
  }

  private async getDeploymentLogs(args: { deploymentUrl: string }) {
    try {
      const { stdout } = await execAsync(
        `vercel logs ${args.deploymentUrl}`
      );

      return {
        content: [
          {
            type: 'text',
            text: stdout,
          },
        ],
      };
    } catch (error: any) {
      // Logs might not be available for failed deployments
      return {
        content: [
          {
            type: 'text',
            text: `Logs not available: ${error.message}\n\nTry checking the Vercel Dashboard for build logs.`,
          },
        ],
      };
    }
  }

  private async listProjects() {
    const { stdout } = await execAsync('vercel project ls --json');

    return {
      content: [
        {
          type: 'text',
          text: stdout,
        },
      ],
    };
  }

  private async triggerDeployment(args: { project: string; branch?: string }) {
    const branch = args.branch || 'main';
    const { stdout } = await execAsync(
      `cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom" && vercel --prod`
    );

    return {
      content: [
        {
          type: 'text',
          text: `Deployment triggered:\n${stdout}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vercel MCP server running on stdio');
  }
}

const server = new VercelMCPServer();
server.run().catch(console.error);
```

## Step 5: Create API Route for HTTP Access (Optional)

### `src/api/mcp.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VercelMCPServer } from '../server';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle MCP requests via HTTP
  // This allows web-based MCP clients to connect
  res.setHeader('Content-Type', 'application/json');
  
  // Implement HTTP-to-stdio bridge if needed
  res.status(200).json({
    message: 'Vercel MCP Server',
    status: 'running',
  });
}
```

## Step 6: Configure MCP Client

### For Cursor/VS Code

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "node",
      "args": ["/path/to/vercel-mcp-server/dist/server.js"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token"
      }
    }
  }
}
```

### Get Vercel Token

```bash
vercel login
# Token is stored in ~/.vercel/auth.json
```

## Step 7: Deploy to Vercel

```bash
vercel login
vercel link
vercel --prod
```

## Step 8: Test the MCP Server

```bash
npm run dev
```

Then test with MCP Inspector or your MCP client.

## Security Considerations

1. **OAuth Setup**: For production, implement OAuth authentication
2. **Token Management**: Store Vercel tokens securely
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Access Control**: Restrict which projects can be accessed

## Troubleshooting

- **Permission Errors**: Ensure Vercel CLI is authenticated
- **Command Not Found**: Ensure `vercel` is in PATH
- **Connection Issues**: Check MCP client configuration

## Next Steps

1. Deploy the MCP server to Vercel
2. Configure your MCP client to connect
3. Test with deployment monitoring commands
4. Add more tools as needed (environment variables, domains, etc.)

## Resources

- [Vercel MCP Documentation](https://vercel.com/docs/mcp)
- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

