import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Interaction, MessageEmbed } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('leader_board')
    .setDescription('このサーバーでの稼働率をランキング形式で')
    .addBooleanOption(input =>
        input.setName("bot")
            .setDescription("botを含むかどうか"))

export async function answer(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const c = interaction.guild?.channels
    if (!c) {
        await interaction.reply('error!');
        return
    }
    const score: { [name: string]: number } = {};

    let containBots = interaction.options.getBoolean('bot');
    if (!containBots) {
        containBots = false
    }

    for (const ch of c.cache.values()) {
        if (ch.isText()) {
            try {
                console.log("leaderboard  accessing  " + ch.name)
                const m = await ch.messages.fetch()
                m.forEach((msg) => {
                    if (msg.author.bot && !containBots) return
                    if (!score[msg.author.username]) score[msg.author.username] = 0
                    score[msg.author.username] += 1
                })
            } catch (e: any) {
                console.log("leaderboard error")
            }
        }
    }
    console.log(score)
    const mmmmm = Object.keys(score).map((k) => { return { key: k, value: score[k] } }).sort((a, b) => b.value - a.value)
    console.log(mmmmm)

    const embeds = [
        new MessageEmbed()
            .setTitle(`リーダーボード`)
            .setDescription("各チャンネルの直近50件ずつのメッセージから，誰が多く活動しているかランキング形式で見せます．")
    ];
    let index = 1;
    for (const mem of mmmmm) {
        if (index > 10) break
        embeds[0].addField(`${index}位 ${mem.key}`, mem.value.toString(), true)
        index += 1
    }
    await interaction.followUp({ embeds: embeds });
}