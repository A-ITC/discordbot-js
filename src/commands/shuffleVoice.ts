import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, ChannelSelectMenuInteraction, ChannelType, ComponentType, EmbedBuilder, CacheType } from 'discord.js';
import DiscordCommand from '../utils/command';

var selected_target_channels: string[] = []
var selected_target_channel_ids: string[] = []
var selected_members: string[] = []
var selected_members_count: number = 0
var selected_destination_channels: string[] = []
var selected_destination_channel_ids: string[] = []

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default class ShuffleVoice extends DiscordCommand {
    public name = "shuffle_voice"
    public data = new SlashCommandBuilder()
        .setName('shuffle_voice')
        .setDescription('指定したボイスチャンネルにいる人をシャッフルさせるコンソールを出現させます')

    public async chatInputAction(interaction: ChatInputCommandInteraction<CacheType>) {
        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('shuffle_voice:target_channels')
                    .setPlaceholder('対象チャンネル')
                    .setMinValues(1)
                    .setMaxValues(10)
                    .setChannelTypes(ChannelType.GuildVoice)
            );
        const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('shuffle_voice:destination_channels')
                    .setPlaceholder('移動先チャンネル')
                    .setMinValues(1)
                    .setMaxValues(10)
                    .setChannelTypes(ChannelType.GuildVoice)
            );
        const row3 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("shuffle_voice:cancel")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("キャンセル")
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("shuffle_voice:enter")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("決定")
            )
        await interaction.reply({ content: 'シャッフル元のチャンネルと、移動先のチャンネルを指定してください', components: [row, row2, row3] });
    }

    public async channelselectmenuAction(interaction: ChannelSelectMenuInteraction) {
        selected_target_channels = []
        selected_target_channel_ids = []
        selected_members = []
        selected_members_count = 0
        selected_destination_channels = []
        selected_destination_channel_ids = []
        var values = interaction.values
        console.log("values:", values)
        if (interaction.customId === "shuffle_voice:target_channels") {
            selected_target_channels = []
            for (var value in values) {
                var channel = await interaction.guild?.channels.fetch(values[value])
                if (channel && channel?.type === ChannelType.GuildVoice) {
                    selected_target_channels.push(channel.name)
                    selected_target_channel_ids.push(channel.id)
                    selected_members_count += channel.members.size
                    selected_members = selected_members.concat(channel.members.map((member) => member.id))
                }
            }
        } else if (interaction.customId === "shuffle_voice:destination_channels") {
            selected_destination_channels = []
            for (var value in values) {
                var channel = await interaction.guild?.channels.fetch(values[value])
                if (channel && channel?.type === ChannelType.GuildVoice) {
                    selected_destination_channels.push(channel.name)
                    selected_destination_channel_ids.push(channel.id)
                }
            }
        }
        var target_value = selected_target_channels.join(", ")
        if (target_value === "") target_value = "指定されていません"
        var destination_value = selected_destination_channels.join("")
        if (destination_value === "") destination_value = "指定されていません"
        var embedBuilder = new EmbedBuilder()
            .setTitle("Suffle Channel")
            .setDescription(`ボイスチャンネルに入っているメンバーをシャッフルさせます（現在${selected_members_count}人を対象）`)
            .addFields({ name: `移動元`, value: target_value })
            .addFields({ name: `移動先`, value: destination_value })
        await interaction.update({ content: '変更を確認', components: interaction.message.components, embeds: [embedBuilder] })
    }

    public async buttonAction(interaction: ButtonInteraction) {
        if (interaction.customId === "shuffle_voice:cancel") {
            await interaction.update({ content: 'キャンセルされました', components: [] })
        } else if (interaction.customId === "shuffle_voice:enter") {
            await interaction.update({ content: 'メンバーを移動させます', components: [] })
            shuffle(selected_members)
            var index = 0
            try {
                for (var member of selected_members) {
                    var m = await interaction.guild?.members.fetch(member)
                    if (m) {
                        console.log("setCHannel:", m.displayName, selected_destination_channel_ids[index % selected_destination_channel_ids.length])
                        await m.voice.setChannel(selected_destination_channel_ids[index % selected_destination_channel_ids.length])
                    } else {
                        console.log("member not found:", member)
                    }
                    index++
                }
                await interaction.editReply({ content: 'メンバーを移動させました。', components: [] })
            } catch (e: any) {
                await interaction.editReply({ content: 'エラーが発生しました。\n' + e, components: [] })
            }
        }
    }
}