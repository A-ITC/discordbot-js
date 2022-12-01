import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle_voice')
        .setDescription('指定したボイスチャンネルにいる人をシャッフルさせるコンソールを出現させます'),
    async execute(interaction: ChatInputCommandInteraction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Nothing selected')
                    .addOptions(
                        {
                            label: 'Select me',
                            description: 'This is a description',
                            value: 'first_option',
                        },
                        {
                            label: 'You can select me too',
                            description: 'This is also a description',
                            value: 'second_option',
                        },
                    ),
            );

        await interaction.reply('シャッフル元のチャンネルと、移動先のチャンネルを指定してください');
    },
};