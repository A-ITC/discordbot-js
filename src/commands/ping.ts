import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import DiscordCommand from '../utils/command';

export default class Ping extends DiscordCommand {
    public name = "ping"
    public data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
    public async chatInputAction(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.reply('Pong!');
    }
}
