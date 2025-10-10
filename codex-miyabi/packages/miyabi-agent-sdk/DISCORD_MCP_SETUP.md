# Discord MCP Server Setup for Miyabi Community

**Last Updated**: 2025-10-12
**Status**: Configuration Ready
**Purpose**: Community management, user education, and feedback collection

---

## Overview

This document configures the Discord server (ID: `1199878847466836059`) as an MCP server for the Miyabi Autonomous Agent SDK community.

**Key Objectives**:
1. Build an open-source community around Miyabi SDK
2. Gather user feedback and feature requests
3. Provide education and support
4. Foster collaboration among contributors

---

## Discord Bot Configuration

### Bot Details

- **Application ID**: `1292996090613862451`
- **Bot Token**: `YOUR_DISCORD_BOT_TOKEN` (get from https://discord.com/developers/applications/1292996090613862451/bot)
- **Client Secret**: `YOUR_DISCORD_CLIENT_SECRET` (get from https://discord.com/developers/applications/1292996090613862451/oauth2)
- **Server ID**: `1199878847466836059`

### Required Bot Permissions

```
Bot Permissions (Bitwise): 8589934592
- View Channels
- Send Messages
- Send Messages in Threads
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands
- Manage Messages (for moderation)
- Manage Threads
```

### OAuth2 Scopes

```
- bot
- applications.commands (for slash commands)
```

### Privileged Gateway Intents

```
- MESSAGE_CONTENT (to read message content for commands)
- GUILD_MEMBERS (to track member joins/leaves)
- GUILD_MESSAGES (to receive message events)
```

---

## MCP Server Configuration

### Installation

```bash
# Navigate to project root
cd /Users/shunsuke/Dev/codex

# Create MCP server directory
mkdir -p codex-miyabi/packages/miyabi-discord-mcp
cd codex-miyabi/packages/miyabi-discord-mcp

# Initialize package
pnpm init

# Install dependencies
pnpm add discord.js @modelcontextprotocol/sdk dotenv
pnpm add -D typescript @types/node
```

### Environment Configuration

Create `.env` file:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=1292996090613862451
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET
DISCORD_GUILD_ID=1199878847466836059

# MCP Server Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_NAME=miyabi-discord-mcp
MCP_SERVER_VERSION=0.1.0

# Integration URLs
MIYABI_WEBSITE=https://miyabi.dev
GITHUB_REPO=https://github.com/ShunsukeHayashi/codex
NPM_PACKAGE=https://www.npmjs.com/package/miyabi-agent-sdk
NOTE_BLOG=https://note.ambitiousai.co.jp/
```

### Bot Implementation (`src/bot.ts`)

```typescript
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Bot ready event
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Miyabi Discord Bot ready! Logged in as ${c.user.tag}`);

  // Set bot status
  c.user.setActivity('Miyabi SDK v0.1.0-alpha.1 | !help', { type: 'WATCHING' });
});

// Welcome new members
client.on(Events.GuildMemberAdd, async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    ch => ch.name === 'welcome' || ch.name === 'general'
  );

  if (!welcomeChannel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle(`Welcome to Miyabi Community! 🎉`)
    .setDescription(`Hi ${member}! Welcome to the Miyabi Autonomous Agent SDK community.`)
    .addFields(
      { name: '📚 Getting Started', value: 'Check out <#getting-started> to install Miyabi SDK' },
      { name: '💬 Ask Questions', value: 'Head to <#support> for help and questions' },
      { name: '🤝 Contribute', value: 'Visit <#contributors> to get involved' },
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: 'Miyabi SDK - 100% Free AI Coding Agent' });

  await welcomeChannel.send({ embeds: [embed] });
});

// Command handler
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    case 'help':
      await handleHelpCommand(message);
      break;
    case 'install':
      await handleInstallCommand(message);
      break;
    case 'docs':
      await handleDocsCommand(message);
      break;
    case 'status':
      await handleStatusCommand(message);
      break;
    case 'feedback':
      await handleFeedbackCommand(message, args);
      break;
    case 'feature':
      await handleFeatureRequestCommand(message, args);
      break;
  }
});

// Command implementations
async function handleHelpCommand(message: any) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Miyabi Discord Bot Commands')
    .setDescription('Here are all available commands:')
    .addFields(
      { name: '!help', value: 'Show this help message' },
      { name: '!install', value: 'Get installation instructions' },
      { name: '!docs', value: 'Get links to documentation' },
      { name: '!status', value: 'Check Miyabi SDK status and version' },
      { name: '!feedback <message>', value: 'Submit feedback to the team' },
      { name: '!feature <request>', value: 'Request a new feature' },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleInstallCommand(message: any) {
  const embed = new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle('Install Miyabi SDK')
    .setDescription('Get started with Miyabi in 3 minutes:')
    .addFields(
      {
        name: '1️⃣ Install via npm',
        value: '```bash\nnpm install -g miyabi-agent-sdk\n```',
      },
      {
        name: '2️⃣ Verify installation',
        value: '```bash\nmiyabi --version\n# Output: 0.1.0-alpha.1\n```',
      },
      {
        name: '3️⃣ Run your first command',
        value: '```bash\nmiyabi analyze 42 --repo owner/repo\n```',
      },
    )
    .addFields(
      { name: '📚 Full Guide', value: '[README.md](https://github.com/ShunsukeHayashi/codex/blob/main/codex-miyabi/packages/miyabi-agent-sdk/README.md)' },
      { name: '📦 npm Package', value: '[miyabi-agent-sdk](https://www.npmjs.com/package/miyabi-agent-sdk)' },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleDocsCommand(message: any) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Miyabi SDK Documentation')
    .addFields(
      { name: '🌐 Official Website', value: '[miyabi.dev](https://miyabi.dev)' },
      { name: '📖 GitHub README', value: '[README.md](https://github.com/ShunsukeHayashi/codex/blob/main/codex-miyabi/packages/miyabi-agent-sdk/README.md)' },
      { name: '📝 Changelog', value: '[CHANGELOG.md](https://github.com/ShunsukeHayashi/codex/blob/main/codex-miyabi/packages/miyabi-agent-sdk/CHANGELOG.md)' },
      { name: '🚀 Release Strategy', value: '[RELEASE_STRATEGY.md](https://github.com/ShunsukeHayashi/codex/blob/main/codex-miyabi/packages/miyabi-agent-sdk/RELEASE_STRATEGY.md)' },
      { name: '🔍 Competitive Analysis', value: '[COMPETITIVE_ANALYSIS.md](https://github.com/ShunsukeHayashi/codex/blob/main/codex-miyabi/packages/miyabi-agent-sdk/COMPETITIVE_ANALYSIS.md)' },
      { name: '📰 Blog (Japanese)', value: '[note.ambitiousai.co.jp](https://note.ambitiousai.co.jp/)' },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleStatusCommand(message: any) {
  const embed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('Miyabi SDK Status')
    .addFields(
      { name: '📦 Version', value: '`0.1.0-alpha.1`', inline: true },
      { name: '🏷️ Release', value: 'Alpha', inline: true },
      { name: '📅 Released', value: '2025-10-12', inline: true },
      { name: '🆓 Cost', value: '$0 (100% Free)', inline: true },
      { name: '🤖 Agents', value: '6 Specialized', inline: true },
      { name: '⚡ Status', value: '✅ Operational', inline: true },
    )
    .addFields(
      { name: '📊 Metrics', value: '```\nTypeScript Strict: 100%\nDocumentation: 98/100\nTest Infrastructure: 100%\n```' },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleFeedbackCommand(message: any, args: string[]) {
  if (args.length === 0) {
    await message.reply('❌ Please provide feedback: `!feedback <your message>`');
    return;
  }

  const feedback = args.join(' ');

  // Send to feedback channel
  const feedbackChannel = message.guild.channels.cache.find(
    ch => ch.name === 'feedback' || ch.name === 'product-feedback'
  );

  if (feedbackChannel?.isTextBased()) {
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('New Feedback Received')
      .setDescription(feedback)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await feedbackChannel.send({ embeds: [embed] });
  }

  await message.reply('✅ Thank you for your feedback! The team will review it soon.');
}

async function handleFeatureRequestCommand(message: any, args: string[]) {
  if (args.length === 0) {
    await message.reply('❌ Please describe the feature: `!feature <your request>`');
    return;
  }

  const featureRequest = args.join(' ');

  // Send to feature requests channel
  const featureChannel = message.guild.channels.cache.find(
    ch => ch.name === 'feature-requests' || ch.name === 'ideas'
  );

  if (featureChannel?.isTextBased()) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('New Feature Request')
      .setDescription(featureRequest)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .addFields({ name: 'Status', value: '🔍 Under Review' })
      .setTimestamp();

    const msg = await featureChannel.send({ embeds: [embed] });

    // Add voting reactions
    await msg.react('👍');
    await msg.react('👎');
  }

  await message.reply('✅ Feature request submitted! Community members can vote in <#feature-requests>.');
}

// Start bot
client.login(process.env.DISCORD_BOT_TOKEN);

export { client };
```

### MCP Server Implementation (`src/mcp-server.ts`)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk';
import { client as discordClient } from './bot';

const server = new McpServer({
  name: 'miyabi-discord-mcp',
  version: '0.1.0',
});

// Register tools
server.tool('get_discord_messages', async (params) => {
  const { channelId, limit = 10 } = params;

  const channel = await discordClient.channels.fetch(channelId);
  if (!channel?.isTextBased()) {
    return { error: 'Channel not found or not text-based' };
  }

  const messages = await channel.messages.fetch({ limit });

  return {
    messages: messages.map(msg => ({
      id: msg.id,
      author: msg.author.tag,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
    })),
  };
});

server.tool('send_discord_message', async (params) => {
  const { channelId, content } = params;

  const channel = await discordClient.channels.fetch(channelId);
  if (!channel?.isTextBased()) {
    return { error: 'Channel not found or not text-based' };
  }

  const message = await channel.send(content);

  return {
    success: true,
    messageId: message.id,
    timestamp: message.createdAt.toISOString(),
  };
});

server.tool('get_community_stats', async () => {
  const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID!);

  return {
    memberCount: guild.memberCount,
    channelCount: guild.channels.cache.size,
    roleCount: guild.roles.cache.size,
    createdAt: guild.createdAt.toISOString(),
  };
});

// Start MCP server
server.listen(parseInt(process.env.MCP_SERVER_PORT || '3000'));

console.log(`✅ MCP Server listening on port ${process.env.MCP_SERVER_PORT || 3000}`);
```

---

## Recommended Discord Server Structure

### Categories & Channels

```
📚 WELCOME
├─ 📢 announcements (read-only, for releases)
├─ 👋 welcome (new member greetings)
└─ 📜 rules (community guidelines)

🚀 GETTING STARTED
├─ 🎯 getting-started (installation guide)
├─ 📖 tutorials (step-by-step guides)
└─ 🎓 resources (links, docs, videos)

💬 COMMUNITY
├─ 💭 general (general discussion)
├─ 🛠️ show-and-tell (share your projects)
├─ 🎉 events (community events, meetups)
└─ 🤝 introductions (introduce yourself)

🆘 SUPPORT
├─ 🆘 support (help and questions)
├─ 🐛 bug-reports (report bugs)
└─ 💡 feature-requests (suggest features)

👨‍💻 DEVELOPMENT
├─ 👨‍💻 contributors (for active contributors)
├─ 🔧 dev-discussion (technical discussions)
└─ 📝 pull-requests (PR notifications)

📊 FEEDBACK
├─ 💬 feedback (general feedback)
├─ 📊 polls (community polls)
└─ 📈 roadmap (product roadmap discussion)

🌏 INTERNATIONAL
├─ 🇯🇵 japanese (日本語)
├─ 🌐 english (English)
└─ 🌍 other-languages (Español, 中文, etc.)

🤖 BOT COMMANDS
└─ 🤖 bot-commands (test bot commands here)
```

### Roles

```
👑 Founder / 創設者
🛡️ Admin / 管理者
🔨 Moderator / モデレーター
⭐ Core Contributor / コアコントリビューター
💎 Contributor / コントリビューター
🎓 Educator / エデュケーター
🌟 Early Adopter / アーリーアダプター
👤 Member / メンバー
🤖 Bot / ボット
```

---

## Setup Instructions

### Step 1: Enable Bot in Discord Developer Portal

1. Visit: https://discord.com/developers/applications/1292996090613862451/bot
2. Enable **Privileged Gateway Intents**:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
3. Save changes

### Step 2: Generate Bot Invite URL

```
https://discord.com/api/oauth2/authorize?client_id=1292996090613862451&permissions=8589934592&scope=bot%20applications.commands
```

Visit this URL and select your server (ID: 1199878847466836059)

### Step 3: Install Dependencies

```bash
cd /Users/shunsuke/Dev/codex/codex-miyabi/packages/miyabi-discord-mcp
pnpm install
```

### Step 4: Build and Run

```bash
# Build TypeScript
pnpm build

# Start bot
pnpm start

# Or run in dev mode
pnpm dev
```

### Step 5: Verify Bot is Online

1. Check Discord server - bot should appear online
2. Test command: `!help` in any channel
3. Check console for: `✅ Miyabi Discord Bot ready!`

---

## Integration with Miyabi SDK

### Add Discord Link to Documentation

Update `README.md`:

```markdown
## Community & Support

- 💬 **Discord Community**: [Join our Discord](https://discord.gg/YOUR_INVITE_LINK)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/ShunsukeHayashi/codex/issues)
- 📅 **Book a Meeting**: [Schedule a call](https://customer-cloud.jp.larksuite.com/scheduler/0f3b79b2b065aaa8)
```

### Add Discord Notifications for Releases

Configure GitHub Actions to post to Discord on release:

```yaml
# .github/workflows/discord-notify.yml
name: Discord Release Notification

on:
  release:
    types: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord Notification
        uses: Ilshidur/action-discord@master
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
        with:
          args: '🎉 **New Miyabi SDK Release**: ${{ github.event.release.tag_name }}\n\n${{ github.event.release.body }}\n\n[View Release](${{ github.event.release.html_url }})'
```

---

## Community Management Strategy

### Week 1: Soft Launch
- ✅ Set up bot and channels
- ✅ Invite 5-10 early adopters
- ✅ Post welcome message and guidelines
- ✅ Test all bot commands

### Week 2-4: Public Launch
- [ ] Share invite link on HackerNews, Reddit, Twitter
- [ ] Host "Office Hours" voice chat (weekly)
- [ ] Create tutorial video series
- [ ] Run first community poll

### Month 2-3: Growth Phase
- [ ] Weekly "Show & Tell" events
- [ ] Monthly community meetup (virtual)
- [ ] Contributor recognition program
- [ ] Translation volunteer recruitment

---

## Moderation Guidelines

### Rules

1. **Be Respectful**: No harassment, hate speech, or discrimination
2. **Stay On Topic**: Keep discussions relevant to Miyabi SDK
3. **No Spam**: No advertising, self-promotion, or bot spam
4. **Help Others**: Be patient and helpful with newcomers
5. **Follow Discord ToS**: https://discord.com/terms

### Enforcement

- **Warning**: First offense (DM from mod)
- **Mute**: Second offense (24 hours)
- **Kick**: Third offense (rejoin possible)
- **Ban**: Severe offense or repeated violations

---

## Success Metrics

### Week 1
- [ ] 10+ members
- [ ] 5+ active users
- [ ] 1+ feedback submission

### Month 1
- [ ] 50+ members
- [ ] 20+ active users
- [ ] 10+ feature requests

### Month 3
- [ ] 200+ members
- [ ] 50+ active users
- [ ] 5+ contributors

---

## Support Contact

- **Discord Setup Help**: Contact @ShunsukeHayashi on GitHub
- **Bot Issues**: Open issue at https://github.com/ShunsukeHayashi/codex/issues
- **Community Questions**: Post in `#support` channel

---

**Created**: 2025-10-12
**Last Updated**: 2025-10-12
**Status**: Ready for Implementation
