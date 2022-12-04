import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { DiscordCommandHandler } from './utils/command';
import dotenv from "dotenv"
import Dice from './commands/dice';

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
])

new REST({ version: '10' }).setToken(process.env.TOKEN ?? "").put(
    Routes.applicationGuildCommands(process.env.CLIENTID ?? "", process.env.TESTGUILDID ?? ""),
    { body: handler.rests },
).catch(error => {
    console.error(error);
})

client.on(Events.InteractionCreate, async (interaction) => {
    console.log("interaction:", interaction)
    handler.execute(interaction)
});

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);