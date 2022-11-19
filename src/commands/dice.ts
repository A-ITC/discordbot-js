import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('ダイスを振ります')
        .addIntegerOption(option =>
            option.setName('dice')
                .setDescription('ダイスの種類')
                .setRequired(true)
                .addChoices(
                    { name: '4', value: 4 },
                    { name: '6', value: 6 },
                    { name: '8', value: 8 },
                    { name: '12', value: 12 },
                    { name: '20', value: 20 },
                ))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('ダイスの個数')
                .setRequired(true)
                .setMaxValue(10)
                .setMinValue(1)),
    async execute(interaction: ChatInputCommandInteraction) {
        const diceType = interaction.options.getInteger("dice")
        const diceCount = interaction.options.getInteger("count")
        if (!diceType || !diceCount) {
            await interaction.reply("error!");
            return
        }
        const embed_fields = []
        for (var i = 0; i < diceCount; i++) {
            embed_fields.push({ name: `${i + 1}回目`, value: `${getRandomInt(diceType) + 1}` })
        }

        const descriptions = [
            "ダイスの時間だぁ！",
            "ダイスを振ります",
            "なにがでるかな",
            "Dice."
        ]

        const replyEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('ダイス')
            .setDescription(descriptions[getRandomInt(descriptions.length)])
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(embed_fields)
            .setTimestamp();
        await interaction.reply({ embeds: [replyEmbed] });
    },
};