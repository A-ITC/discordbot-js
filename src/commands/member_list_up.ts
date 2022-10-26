import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, CacheType, CommandInteraction, Interaction, InteractionUpdateOptions, MessageActionRow, MessageButton, MessageEmbed, MessagePayload, MessageSelectMenu, MessageSelectOptionData, Role, SelectMenuInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('member_list_up')
    .setDescription('メンバー一覧')

export async function answer(interaction: CommandInteraction<CacheType>) {

    const roles = interaction.guild?.roles.cache
    if (!roles) {
        await interaction.reply("error")
        return
    }
    const options: MessageSelectOptionData[] = roles.map((role) => {
        return {
            label: role.name,
            value: role.id,
            default: false
        }
    })
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('member_list_up')
                .setPlaceholder('Nothing selected')
                .addOptions(options)
                .setMinValues(1)
                .setMaxValues(Math.min(8, options.length))
        );
    const row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("cancel_button")
                .setLabel("キャンセル")
                .setStyle('SECONDARY')
        );

    await interaction.reply({ content: '絞り込むロールを選択してください', components: [row, row2] });

}

async function interactionSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
    console.log("member_interaction start")
    //await interaction.deferUpdate()
    const guild = interaction.guild
    if (!guild) {
        await interaction.update({ content: "error!" });
        return
    }
    const interactionroles: Role[] = []
    for (const i of interaction.values ?? []) {
        const r = guild.roles.resolve(i)
        if (r) interactionroles.push(r)
    }
    const roles = interaction.guild?.roles.cache
    const options: MessageSelectOptionData[] = roles.map((role) => {
        return {
            label: role.name,
            value: role.id,
            default: interactionroles.includes(role)
        }
    })
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('member_list_up')
                .setPlaceholder('Nothing selected')
                .addOptions(options)
                .setMinValues(1)
                .setMaxValues(Math.min(8, options.length))
        );

    console.log("create message")
    const allMembers = guild.members.cache
    console.log("members fetched")
    const members = allMembers.filter(member => interactionroles.every(e => member.roles.cache.has(e.id)))
    console.log("creating embed")
    const percentage = (members.size / allMembers.size * 100).toFixed(3)
    const embeds = [
        new MessageEmbed().setTitle(`検索対象のロール  (${interactionroles.length})`).setDescription(interactionroles.map(e => `${e}`).join("\n")),
        new MessageEmbed()
            .setTitle(`検索結果 (${members.size})`)
            .setDescription(members.map(e => `${e}`).join("\n"))
            .setFooter(`${members.size} / ${allMembers.size} (${percentage}%)`),
    ];

    const row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("member_list_up_but")
                .setLabel("完了")
                .setStyle('PRIMARY')
        );

    console.log("send message")
    await interaction.update({ embeds: embeds, components: [row, row2] });
    return
}

async function interactionButton(interaction: ButtonInteraction<CacheType>) {
    await interaction.update({ components: [] })
    await interaction.followUp({ content: "member_list_up を終了しました", embeds: interaction.message.embeds, components: [] });
    return
}

export async function interaction(interaction: Interaction<CacheType>) {

    if (interaction.isSelectMenu()) {
        const { customId } = interaction;
        if (customId === "member_list_up") {
            await interactionSelectMenu(interaction)
        }
    }
    if (interaction.isButton()) {
        const { customId } = interaction;
        if (customId === "member_list_up_but") {
            await interactionButton(interaction)
        }
        if (customId === "cancel_button") {
            await interactionButton(interaction)
        }
    }
}