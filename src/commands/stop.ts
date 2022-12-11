import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import DiscordCommand from '../utils/command';
export default class Stop extends DiscordCommand {
    public name = "stop"
    public data = new SlashCommandBuilder()
        .setName('stop')
        .setDescription('ボットを停止させます')
    public async chatInputAction(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply();
        await interaction.editReply("botを停止させます")
        process.exit()
    }
}
