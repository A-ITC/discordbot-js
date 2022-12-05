import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { createRouter, apiErrorHandler } from './utils/server';
import { DiscordCommandHandler } from './utils/command';
import dotenv from "dotenv"
import Dice from './commands/dice';
import FetchChannelImg from './commands/fetch_channel_img';
import Ping from './commands/ping';
import ShuffleVoice from './commands/shuffleVoice';
import Stop from './commands/stop';
import cors from '@koa/cors'
import Koa from 'koa'
import AllMembers from './commands/all_members';
import "./utils/logging"
import { getLogger } from 'log4js';

const logger = getLogger()

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const handler = new DiscordCommandHandler()

handler.registerCommands([
    new Dice(),
    new FetchChannelImg(),
    new Ping(),
    new ShuffleVoice(),
    new Stop(),
    new AllMembers(),
])

new REST({ version: '10' }).setToken(process.env.TOKEN ?? "").put(
    Routes.applicationGuildCommands(process.env.CLIENTID ?? "", process.env.TESTGUILDID ?? ""),
    { body: handler.rests },
).catch(error => {
    logger.error(error);
})

client.on(Events.InteractionCreate, async (interaction) => {
    logger.log(`interaction: ${interaction}`)
    handler.execute(interaction)
});

client.once(Events.ClientReady, c => {
    logger.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);

const app = new Koa();
app.use(cors());
app.use(apiErrorHandler);
app.use(createRouter(client))
app.listen(4030, () => process.stdout.write('RESTAPI server started at port 4030\n'))