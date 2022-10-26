import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('サーバーのコンテンツについての情報を表示します')
    .addSubcommand(subcommand =>
        subcommand.setName("guild")
            .setDescription("このサーバーについて")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("user")
            .setDescription("ユーザについて")
            .addUserOption(option => option.setName("target").setDescription("対象"))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("channel")
            .setDescription("チャンネルについて")
            .addChannelOption(option => option.setName("target").setDescription("対象"))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("role")
            .setDescription("ロールについて")
            .addRoleOption(option => option.setName("target").setDescription("対象").setRequired(true))
    )

//日付から文字列に変換する関数
function getStringFromDate(date: Date | null) {
    if (!date) return "null"

    let format_str = 'YYYY-MM-DD hh:mm:ss';
    format_str = format_str.replace(/YYYY/g, date.getFullYear().toString());
    format_str = format_str.replace(/MM/g, 1 + date.getMonth().toString());
    format_str = format_str.replace(/DD/g, date.getDate().toString());
    format_str = format_str.replace(/hh/g, date.getHours().toString());
    format_str = format_str.replace(/mm/g, date.getMinutes().toString());
    format_str = format_str.replace(/ss/g, date.getSeconds().toString());

    return format_str;
}

export async function answer(interaction: CommandInteraction<CacheType>) {
    if (interaction.options.getSubcommand() === 'guild') {
        const guild = interaction.guild
        if (!guild) {
            await interaction.reply("エラー！")
            return
        }
        const embeds = [
            new MessageEmbed()
                .setTitle(`サーバー情報`)
                .setThumbnail(guild.iconURL() ?? "")
                .addFields(
                    { name: "Name", value: guild.name },
                    { name: "Id", value: guild.id },
                    { name: "Created at", value: getStringFromDate(guild.createdAt) },
                    { name: "Joined at", value: getStringFromDate(guild.joinedAt) },
                    { name: "Member count", value: "" + guild.memberCount }
                ),
        ];
        await interaction.reply({ embeds: embeds });
        return
    }
    if (interaction.options.getSubcommand() === 'user') {
        let user = interaction.options.getUser('target');
        if (!user) {
            user = interaction.user
        }
        const guildMember = interaction.guild?.members.resolve(user.id)
        if (!guildMember) {
            await interaction.reply({ content: "error" });
            return
        }
        const embeds = [
            new MessageEmbed()
                .setTitle(`ユーザー情報`)
                .setThumbnail(user.avatarURL() ?? "")
                .setColor(user.accentColor ?? 0)
                .addFields(
                    { name: "User name", value: user.username },
                    { name: "Nick name", value: guildMember.nickname ?? "none" },
                    { name: "Mention", value: user.toString() },
                    { name: "Id", value: user.id },
                    { name: "Bot?", value: user.bot ? "true" : "false" },
                    { name: "Accent color", value: user.accentColor?.toString(16) ?? "none" },
                    { name: "Status", value: guildMember.presence?.status ?? "none" },
                    { name: "Joined at", value: getStringFromDate(guildMember.joinedAt) },
                    { name: "Created at", value: getStringFromDate(user.createdAt) },
                ),
        ];
        await interaction.reply({ embeds: embeds });
        return
    }
    if (interaction.options.getSubcommand() === 'channel') {
        const channel = interaction.options.getChannel('target');
        if (channel) {
            const embeds = [
                new MessageEmbed()
                    .setTitle(`チャンネル情報`)
                    .addFields(
                        { name: "Name", value: channel.name },
                        { name: "Mention", value: channel.toString() },
                        { name: "Id", value: channel.id },
                    ),
            ];
            await interaction.reply({ embeds: embeds });
        } else {
            const target = interaction.channel
            if (!target) {
                await interaction.reply({ content: "error" });
                return
            }
            const embeds = [
                new MessageEmbed()
                    .setTitle(`チャンネル情報`)
                    .addFields(
                        { name: "Mention", value: target.toString() },
                        { name: "Id", value: target.id },
                    ),
            ];
            await interaction.reply({ embeds: embeds });
        }
        return
    }
    if (interaction.options.getSubcommand() === 'role') {
        const role = interaction.options.getRole('target');
        if (role) {
            const embeds = [
                new MessageEmbed()
                    .setTitle(`ロール情報`)
                    .setColor(role.color)
                    .addFields(
                        { name: "Name", value: role.name },
                        { name: "Mention", value: role.toString() },
                        { name: "Id", value: role.id },
                        { name: "Color", value: role.color.toString(16) },
                    ),
            ];
            await interaction.reply({ embeds: embeds });
        } else {
            await interaction.reply(`error`);
        }
        return
    }
}