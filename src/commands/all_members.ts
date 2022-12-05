import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import DiscordCommand from '../utils/command';
import fs from "node:fs/promises";

export default class AllMembers extends DiscordCommand {
    public name = "all_members"

    public data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('メンバーリストを取得')

    public async chatInputAction(interaction: ChatInputCommandInteraction) {
        const guild = interaction.client.guilds.cache.get(process.env.TESTGUILDID ?? "")
        const members = await guild?.members.fetch()
        let text = "id,name\n"
        members?.each((member) => text += `${member.id},${member.displayName}\n`)
        await fs.writeFile("./members.csv", text, "utf-8")
        await interaction.reply({ files: ["./members.csv"] });
    }
}
