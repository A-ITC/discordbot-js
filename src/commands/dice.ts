import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, MessageEmbed } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('dice')
    .setDescription('ダイスをふります')
    .addIntegerOption(option =>
        option.setName('dice')
            .setDescription('ダイスの種類')
            .setRequired(true)
            .addChoice("4面", 4)
            .addChoice("6面", 6)
            .addChoice("8面", 8)
            .addChoice("10面", 10)
            .addChoice("12面", 12)
            .addChoice("20面", 20)
            .addChoice("100面", 10)
    )
    .addIntegerOption(option =>
        option.setName("count")
            .setDescription("ダイスの数")
    )


function getRandomInt(max: number) {
    return Math.floor(Math.random() * max) + 1
}

export async function answer(interaction: CommandInteraction<CacheType>) {
    const diceType = interaction.options.getInteger("dice")
    const diceCount = interaction.options.getInteger("count")
    if (!diceType || !diceCount) {
        await interaction.reply('エラーだよ！');
        return
    }
    const result: number[] = []
    for (let i = 0; i < diceCount; i++) {
        result.push(getRandomInt(diceType))
    }
    let answer = ""
    for (let i = 0; i < diceCount; i++) {
        answer += "" + (i + 1) + "回目：" + result[i] + "\n"
    }

    const urls: { [name: number]: string } = {
        4: "https://kyoichi001.github.io/image/dice4.png",
        6: "https://kyoichi001.github.io/image/dice6.png",
        8: "https://kyoichi001.github.io/image/dice8.png",
        12: "https://kyoichi001.github.io/image/dice12.png",
        20: "https://kyoichi001.github.io/image/dice20.png",
    }

    const embeds = [
        new MessageEmbed()
            .setTitle(`${diceType}面ダイス`)
            .setDescription("結果")
            .setThumbnail(urls[diceType])
    ];
    for (let i = 0; i < diceCount; i++) {
        embeds[0].addField(`${i + 1}回目：`, result[i].toString())
    }
    await interaction.reply({ embeds: embeds });
}