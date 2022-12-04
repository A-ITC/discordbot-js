import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, CacheType } from 'discord.js';
import DiscordCommand from '../utils/command';

export default class Dice extends DiscordCommand {
    public name = "dice"

    public data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('ダイスを振ります')
        .addIntegerOption(option =>
            option.setName(this.name)
                .setDescription('ダイスの種類')
                .setRequired(true)
                .addChoices(
                    { name: '4面', value: 4 },
                    { name: '6面', value: 6 },
                    { name: '8面', value: 8 },
                    { name: '12面', value: 12 },
                    { name: '20面', value: 20 },
                ))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('ダイスの個数')
                .setRequired(true)
                .setMaxValue(10)
                .setMinValue(1))

    private getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    public async chatInputAction(interaction: ChatInputCommandInteraction<CacheType>) {
        const diceType = interaction.options.getInteger("dice")
        const diceCount = interaction.options.getInteger("count")
        if (!diceType || !diceCount) {
            await interaction.reply("error!");
            return
        }
        const embed_fields = []
        var value_sum = 0
        for (var i = 0; i < diceCount; i++) {
            var value = this.getRandomInt(diceType) + 1
            value_sum += value;
            embed_fields.push({ name: `${i + 1}回目`, value: `${value}` })
        }
        embed_fields.push({ name: "合計", value: `${value_sum}` })
        const descriptions = [
            "ダイスの時間だぁ！",
            "ダイスを振ります",
            "なにがでるかな",
            "Dice."
        ]

        const replyEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${diceType}面ダイス`)
            .setDescription(descriptions[this.getRandomInt(descriptions.length)])
            .setThumbnail(`https://github.com/a-itc/discordbot-js/blob/main/resrouce/dice_${diceType}.png?raw=true`)
            .addFields(embed_fields)
            .setTimestamp();
        await interaction.reply({ embeds: [replyEmbed] });
    }
}
