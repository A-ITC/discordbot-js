import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('ボットを停止させます'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("botを停止させます")
        process.exit()
    },
};