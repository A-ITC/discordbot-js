import { Collection, Interaction, ChatInputCommandInteraction, ButtonInteraction, ChannelSelectMenuInteraction } from 'discord.js';

export default abstract class DiscordCommand {
    public abstract name: string
    public abstract data: any

    public async chatInputAction(interaction: ChatInputCommandInteraction) {
        const message = `'chatInputAction' does not defined in the command: ${this.name}`
        console.error(message);
        await interaction.reply({ content: message, ephemeral: true });
    }

    public async buttonAction(interaction: ButtonInteraction) {
        const message = `'buttonAction' does not defined in the command: ${this.name}`
        console.error(message);
        await interaction.reply({ content: message, ephemeral: true });
    }

    public async channelselectmenuAction(interaction: ChannelSelectMenuInteraction) {
        const message = `'channelselectmenuAction' does not defined in the command: ${this.name}`
        console.error(message);
        await interaction.reply({ content: message, ephemeral: true });
    }
}


export class DiscordCommandHandler {
    private commands: { [name: string]: DiscordCommand } = {}
    public rests = new Collection<string, string>()

    public registerCommands(commands: DiscordCommand[]) {
        for (const command of commands) {
            this.commands[command.name] = command
            this.rests.set(command.data.name, command.data.toJSON());
        }
    }

    public async execute(interaction: Interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                await this.executeChatInputAction(interaction)
            }
            else if (interaction.isButton()) {
                await this.executeButtonAction(interaction)
            }
            else if (interaction.isChannelSelectMenu()) {
                await this.executeChannelselectmenuAction(interaction)
            }
        } catch (error) {
            console.error(error);
            await (interaction as any)?.reply({ content: `An error occurred while executing the command.`, ephemeral: true });
        }
    }

    private async executeChatInputAction(interaction: ChatInputCommandInteraction) {
        const commandName = interaction.commandName
        const command = this.commands[commandName]
        if (command) {
            await command.chatInputAction(interaction);
        } else {
            throw Error(`No command matching ${commandName} was found.`);
        }
    }

    private async executeButtonAction(interaction: ButtonInteraction) {
        const key = interaction.customId.split(":")
        const command = this.commands[key[0]]
        if (command) {
            await command.buttonAction(interaction);
        } else {
            throw Error(`No command matching ${key} was found.`);
        }
    }

    private async executeChannelselectmenuAction(interaction: ChannelSelectMenuInteraction) {
        var key = interaction.customId.split(":")
        const command = this.commands[key[0]]
        if (command) {
            await command.channelselectmenuAction(interaction);
        } else {
            throw Error(`No command matching ${key} was found.`);
        }
    }
}
