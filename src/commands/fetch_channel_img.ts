import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, AttachmentBuilder } from 'discord.js';
import fs from "node:fs"
import path from "node:path"
import request from "request"
import archiver from "archiver"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetch_channel_img')
        .setDescription('チャンネル内の画像をすべてダウンロード')
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("対象となるチャンネル(指定しないとこのコマンドを呼び出したチャンネルを指定)")
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel")
        if (!channel ||
            channel.type === ChannelType.GuildVoice ||
            channel.type === ChannelType.GuildStageVoice ||
            channel.type === ChannelType.GuildCategory ||
            channel.type === ChannelType.GuildNews
        ) {
            await interaction.reply("テキストチャンネルを指定してください");
            return
        }
        const id = channel.id
        const target_channel = interaction.client.channels.cache.get(id)
        if (!target_channel || !target_channel.isTextBased()) {
            await interaction.reply("チャンネルが見つかりませんでした");
            return
        }
        var messages = await target_channel.messages.fetch()
        const targetDir = `${__dirname}/fetchImages`
        if (fs.existsSync(targetDir)) {
            await fs.promises.rm(targetDir, { recursive: true, force: true })
        }
        await fs.promises.mkdir(`${targetDir}`)
        var fileCount = 0
        messages.forEach((message, index) => {
            message.attachments.forEach((element, index) => {
                console.log(element.contentType)
                if (!element.contentType?.startsWith("image/")) return
                fileCount++
                request.get(element.url)
                    .on("error", console.error)
                    .pipe(fs.createWriteStream(`${targetDir}/${message.author.username}_${element.name ?? "???.png"}`))
            })
        })
        //https://qiita.com/shinshin86/items/d088b325a03c2a5056ff
        const zipPath = `${targetDir}.zip`;
        if (fs.existsSync(zipPath)) {
            console.log("!!!!!!!!!!!!")
            //await fs.promises.unlink(zipPath)
            await fs.promises.rm(zipPath)
        }
        const output = fs.createWriteStream(zipPath);

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(output);

        //archive.glob(path.join(targetDir, '*.png'));
        archive.directory(targetDir, false);

        await archive.finalize();

        const attachment = new AttachmentBuilder(zipPath);
        await interaction.reply({ content: `${fileCount}件の画像を取得しました`, files: [attachment] });
    },
};