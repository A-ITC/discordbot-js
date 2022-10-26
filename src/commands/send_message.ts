import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, CacheType, Collection, CommandInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, Role, SelectMenuInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('send_message')
    .setDescription('このサーバーにいるメンバーにDMで一斉送信します')

let message = ""
let wait_for_message = false
let target_members: Collection<string, GuildMember> | null = null

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
                .setCustomId('send_message_role_select')
                .setPlaceholder('Nothing selected')
                .addOptions(options)
                .setMinValues(1)
                .setMaxValues(Math.min(8, options.length))
        );
    const row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("send_message_cancel_button")
                .setLabel("キャンセル")
                .setStyle('SECONDARY')
        );

    await interaction.reply({ content: '絞り込むロールを選択してください', components: [row, row2] });

}

async function interactionSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
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

    const allMembers = guild.members.cache
    target_members = allMembers.filter(member => interactionroles.every(e => member.roles.cache.has(e.id)))
    const embeds = [
        new MessageEmbed().setTitle(`検索対象のロール  (${interactionroles.length})`).setDescription(interactionroles.map(e => `${e}`).join("\n")),
        new MessageEmbed().setTitle(`検索結果 (${target_members.size})`).setDescription(target_members.map(e => `${e}`).join("\n")),
    ];

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("send_message_yes_button")
                .setLabel("はい")
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId("send_message_cancel_button")
                .setLabel("いいえ")
                .setStyle('DANGER'),
        );

    await interaction.update({
        content: "このメンバーにメッセージを送信します。\nよろしければ，「はい」を押し，送信するメッセージを入力してください。",
        embeds: embeds,
        components: [row]
    })
    return
}

//はいと押した場合遷移
async function waitForMessage(interaction: ButtonInteraction<CacheType>) {
    message = ""
    wait_for_message = true
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("send_message_finish_button")
                .setLabel("完了")
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId("send_message_cancel_button")
                .setLabel("キャンセル")
                .setStyle('DANGER'),
        );
    await interaction.update({ components: [] })
    await interaction.followUp({ content: "メッセージを入力してください．", components: [row] });
    return
}

async function interactionCancelButton(interaction: ButtonInteraction<CacheType>) {
    await interaction.update({ components: [] })
    await interaction.followUp({ content: "send_message をキャンセルしました", components: [], embeds: [] });
    return
}

async function interactionEnterButton(interaction: ButtonInteraction<CacheType>) {
    wait_for_message = false
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("send_message_final_yes_button")
                .setLabel("はい")
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId("send_message_cancel_button")
                .setLabel("いいえ")
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId("send_message_retry_button")
                .setLabel("やり直す")
                .setStyle('PRIMARY'),
        );
    await interaction.update({ components: [] })
    await interaction.followUp({ content: "以下の内容で送信しますか？\n\n" + message, components: [row] });
    return
}

async function interactionFinish(interaction: ButtonInteraction<CacheType>) {
    if (target_members == null) {
        await interaction.update({ components: [] })
        await interaction.followUp({ content: "エラー", components: [] });
        return
    }
    for (const m of target_members.values()) {
        await m.send(message)
    }
    await interaction.update({ components: [] })
    await interaction.followUp({ content: "送信しました", components: [] });
    return
}

export async function interaction(interaction: Interaction<CacheType>) {

    if (interaction.isSelectMenu()) {
        const { customId } = interaction;
        if (customId === "send_message_role_select") {
            await interactionSelectMenu(interaction)
        }
    }
    if (interaction.isButton()) {
        const { customId } = interaction;
        console.log("send_message current customID " + customId)
        if (customId === "send_message_cancel_button") {
            await interactionCancelButton(interaction)
        }
        if (customId === "send_message_yes_button") {
            await waitForMessage(interaction)
        }
        if (customId === "send_message_no_button") {
            await interactionCancelButton(interaction)
        }
        if (customId === "send_message_finish_button") {
            await interactionEnterButton(interaction)
        }
        if (customId === "send_message_final_yes_button") {
            await interactionFinish(interaction)
        }
        if (customId === "send_message_retry_button") {
            await waitForMessage(interaction)
        }
    }
}

export async function onMessageCreate(mes: Message) {
    console.log("wait send_message")
    if (mes.author.bot) return
    if (wait_for_message) {
        message += mes.content
    }
}