import { configure } from "log4js"
import dotenv from "dotenv"
dotenv.config()

configure({
    appenders: {
        stdout: {
            type: 'stdout'
        },
        file: {
            type: "dateFile",
            filename: "./logs/discordbot-js.log",
            pattern: "yyyy-MM-dd",
            keepFileExt: true,
            numBackups: 5,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd} %r %f{1}:%l] %p %m'
            }
        }
    },
    categories: {
        default: {
            appenders: ["stdout", "file"],
            enableCallStack: true,
            level: process.env.LOG_LEVEL ?? "info"
        }
    }
})