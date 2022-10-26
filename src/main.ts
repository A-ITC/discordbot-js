
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Message, Client, CommandInteraction, CacheType, InteractionUpdateOptions, MessagePayload, SelectMenuInteraction, ButtonInteraction, Interaction } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'node:fs'

dotenv.config()

const token = process.env.TOKEN ?? "0"
const clientId = process.env.CLIENTID ?? "0";
const guildId = process.env.TESTGUILDID2 ?? "0";

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "DIRECT_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_VOICE_STATES",
        "GUILD_PRESENCES",
        "GUILD_MESSAGE_REACTIONS"
    ],
})

const rest = new REST({ version: '9' }).setToken(token);

interface Command {
    data: any,
    answer: (interaction: CommandInteraction<CacheType>) => Promise<void>,
    interaction?: (interaction: Interaction<CacheType>) => Promise<void>,
    onMessageCreate?: (mes: Message) => Promise<void>
}

// eslint-disable-next-line prefer-const
let commands: { [name: string]: Command } = {};

(async () => {

    console.log("loading")
    const commandFiles = fs.readdirSync('./build/commands').filter(file => file.endsWith('.js'));
    console.log("loaded ts files length:" + commandFiles.length)
    const request_commands: any[] = []
    try {
        for (const file of commandFiles) {
            console.log("importing " + file)
            const command = await import(`./commands/${file}`);
            const commandName = file.split('.')[0]
            if (command.data !== undefined) {
                commands[commandName] = {
                    data: command.data.toJSON(),
                    answer: command.answer,
                    interaction: command.interaction,
                    onMessageCreate: command.onMessageCreate
                };
                request_commands.push(command.data.toJSON())
            }
            console.log(commands[commandName])
        }
        console.log(commands)
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: request_commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})()

client.once('ready', () => {
    console.log('Ready!')
})

client.on('messageCreate', async (message: Message) => {
    console.log("on message created")
    if (message.author.bot) return
    Object.keys(commands).forEach(async (key) => {
        const func = commands[key].onMessageCreate
        if (func) await func(message)
    })
})

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        await commands[commandName].answer(interaction)
        return
    }

    Object.keys(commands).forEach(async (key) => {
        const func = commands[key].interaction
        if (func) await func(interaction)
    })
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    const newUserChannel = newMember.channelId;
    const oldUserChannel = oldMember.channelId;

    if (newUserChannel === "Channel id here") //don't remove ""
    {
        // User Joins a voice channel
        console.log("Joined vc with id " + newUserChannel);
    }
    else {
        // User leaves a voice channel
        console.log("Left vc");
    }
});

client.login(token)