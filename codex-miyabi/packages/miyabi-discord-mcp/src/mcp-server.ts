import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { client as discordClient } from './bot.js';

// MCP Server for Miyabi Discord Community
const server = new Server(
  {
    name: 'miyabi-discord-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: 'get_discord_messages',
    description: 'Fetch recent messages from a Discord channel',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to fetch messages from',
        },
        limit: {
          type: 'number',
          description: 'Number of messages to fetch (default: 10, max: 100)',
          default: 10,
        },
      },
      required: ['channelId'],
    },
  },
  {
    name: 'send_discord_message',
    description: 'Send a message to a Discord channel',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to send the message to',
        },
        content: {
          type: 'string',
          description: 'The message content to send',
        },
      },
      required: ['channelId', 'content'],
    },
  },
  {
    name: 'get_community_stats',
    description: 'Get statistics about the Miyabi Discord community',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_messages',
    description: 'Search for messages containing specific text in a channel',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'The Discord channel ID to search in',
        },
        query: {
          type: 'string',
          description: 'The text to search for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
      required: ['channelId', 'query'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_discord_messages': {
        const { channelId, limit = 10 } = args as { channelId: string; limit?: number };

        const channel = await discordClient.channels.fetch(channelId);
        if (!channel?.isTextBased()) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Channel not found or not text-based' }, null, 2),
              },
            ],
          };
        }

        const messages = await channel.messages.fetch({ limit: Math.min(limit, 100) });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  messages: messages.map(msg => ({
                    id: msg.id,
                    author: msg.author.tag,
                    content: msg.content,
                    timestamp: msg.createdAt.toISOString(),
                    attachments: msg.attachments.size,
                    embeds: msg.embeds.length,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'send_discord_message': {
        const { channelId, content } = args as { channelId: string; content: string };

        const channel = await discordClient.channels.fetch(channelId);
        if (!channel?.isTextBased()) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Channel not found or not text-based' }, null, 2),
              },
            ],
          };
        }

        const message = await channel.send(content);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  messageId: message.id,
                  timestamp: message.createdAt.toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_community_stats': {
        const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID!);
        const members = await guild.members.fetch();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  serverName: guild.name,
                  memberCount: guild.memberCount,
                  onlineMembers: members.filter(m => m.presence?.status === 'online').size,
                  channelCount: guild.channels.cache.size,
                  roleCount: guild.roles.cache.size,
                  createdAt: guild.createdAt.toISOString(),
                  boostLevel: guild.premiumTier,
                  boostCount: guild.premiumSubscriptionCount,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'search_messages': {
        const { channelId, query, limit = 10 } = args as {
          channelId: string;
          query: string;
          limit?: number;
        };

        const channel = await discordClient.channels.fetch(channelId);
        if (!channel?.isTextBased()) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Channel not found or not text-based' }, null, 2),
              },
            ],
          };
        }

        // Fetch more messages to search through
        const messages = await channel.messages.fetch({ limit: 100 });
        const searchQuery = query.toLowerCase();

        const results = messages
          .filter(msg => msg.content.toLowerCase().includes(searchQuery))
          .first(Math.min(limit, 100))
          .map(msg => ({
            id: msg.id,
            author: msg.author.tag,
            content: msg.content,
            timestamp: msg.createdAt.toISOString(),
            url: msg.url,
          }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  query,
                  resultsCount: results.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            null,
            2
          ),
        },
      ],
    };
  }
});

// Start MCP server
async function startMcpServer() {
  // Wait for Discord client to be ready
  await new Promise<void>(resolve => {
    if (discordClient.isReady()) {
      resolve();
    } else {
      discordClient.once('ready', () => resolve());
    }
  });

  console.log('✅ Discord client ready, starting MCP server...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log(`✅ MCP Server connected via stdio`);
}

export { server, startMcpServer };
