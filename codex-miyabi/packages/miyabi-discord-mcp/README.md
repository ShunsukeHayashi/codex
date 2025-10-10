# Miyabi Discord MCP Server

Discord bot and MCP server for the Miyabi Autonomous Agent SDK community.

## Features

- **Discord Bot**: Community management with commands (!help, !install, !docs, !status, !feedback, !feature)
- **MCP Server**: Tools for querying Discord channels, sending messages, and getting community stats
- **Welcome Messages**: Automated welcome for new members
- **Feedback Collection**: Channel-based feedback and feature request system

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Discord bot tokens
   ```

3. **Build**:
   ```bash
   pnpm build
   ```

4. **Start**:
   ```bash
   pnpm start
   ```

## MCP Tools

- `get_discord_messages`: Fetch recent messages from a channel
- `send_discord_message`: Send a message to a channel
- `get_community_stats`: Get server statistics
- `search_messages`: Search for messages in a channel

## Bot Commands

- `!help` - Show all commands
- `!install` - Get installation instructions
- `!docs` - Get documentation links
- `!status` - Check SDK status
- `!feedback <message>` - Submit feedback
- `!feature <request>` - Request a feature
- `!ping` - Check bot latency

## Configuration

See `.env.example` for all available environment variables.

## Documentation

For detailed setup instructions, see `../miyabi-agent-sdk/DISCORD_MCP_SETUP.md`

## License

Apache 2.0
