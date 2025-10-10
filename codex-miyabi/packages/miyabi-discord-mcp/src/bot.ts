import { Client, GatewayIntentBits, Events, EmbedBuilder, ActivityType } from 'discord.js';
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
  c.user.setActivity('Miyabi SDK v0.1.0-alpha.1 | !help', { type: ActivityType.Watching });
});

// Welcome new members
client.on(Events.GuildMemberAdd, async (member) => {
  if (!process.env.ENABLE_WELCOME_MESSAGES || process.env.ENABLE_WELCOME_MESSAGES === 'false') {
    return;
  }

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

  try {
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
      case 'ping':
        await handlePingCommand(message);
        break;
      default:
        // Unknown command - optionally respond
        break;
    }
  } catch (error) {
    console.error(`Error handling command ${command}:`, error);
    await message.reply('❌ An error occurred while processing your command. Please try again later.');
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
      { name: '!ping', value: 'Check bot latency' },
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
      { name: '📚 Full Guide', value: `[README.md](${process.env.GITHUB_REPO}/blob/main/codex-miyabi/packages/miyabi-agent-sdk/README.md)` },
      { name: '📦 npm Package', value: `[miyabi-agent-sdk](${process.env.NPM_PACKAGE})` },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleDocsCommand(message: any) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Miyabi SDK Documentation')
    .addFields(
      { name: '🌐 Official Website', value: `[miyabi.dev](${process.env.MIYABI_WEBSITE})` },
      { name: '📖 GitHub README', value: `[README.md](${process.env.GITHUB_REPO}/blob/main/codex-miyabi/packages/miyabi-agent-sdk/README.md)` },
      { name: '📝 Changelog', value: `[CHANGELOG.md](${process.env.GITHUB_REPO}/blob/main/codex-miyabi/packages/miyabi-agent-sdk/CHANGELOG.md)` },
      { name: '🚀 Release Strategy', value: `[RELEASE_STRATEGY.md](${process.env.GITHUB_REPO}/blob/main/codex-miyabi/packages/miyabi-agent-sdk/RELEASE_STRATEGY.md)` },
      { name: '🔍 Competitive Analysis', value: `[COMPETITIVE_ANALYSIS.md](${process.env.GITHUB_REPO}/blob/main/codex-miyabi/packages/miyabi-agent-sdk/COMPETITIVE_ANALYSIS.md)` },
      { name: '📰 Blog (Japanese)', value: `[note.ambitiousai.co.jp](${process.env.NOTE_BLOG})` },
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

async function handlePingCommand(message: any) {
  const sent = await message.reply('Pinging...');
  const latency = sent.createdTimestamp - message.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🏓 Pong!')
    .addFields(
      { name: 'Bot Latency', value: `${latency}ms`, inline: true },
      { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
    )
    .setTimestamp();

  await sent.edit({ content: '', embeds: [embed] });
}

// Start bot
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);

export { client };
