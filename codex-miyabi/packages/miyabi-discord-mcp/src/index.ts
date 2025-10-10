#!/usr/bin/env node
import './bot.js';
import { startMcpServer } from './mcp-server.js';

// Start both Discord bot and MCP server
async function main() {
  console.log('🚀 Starting Miyabi Discord MCP Server...');
  console.log('📝 Version: 0.1.0');
  console.log('🔗 Server ID:', process.env.DISCORD_GUILD_ID);
  console.log('');

  try {
    // MCP server will wait for Discord client to be ready
    await startMcpServer();

    console.log('');
    console.log('✅ All systems operational!');
    console.log('💬 Discord bot commands available with prefix: !');
    console.log('🔧 MCP tools available via stdio');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
