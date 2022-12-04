import { Next, ParameterizedContext } from 'koa'
import { Client, TextChannel } from 'discord.js'
import { createHash } from 'crypto';
import koaBody from "koa-body"
import Router from "koa-router"
import dotenv from "dotenv"
dotenv.config();

// https://scrapbox.io/discordjs-japan/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%82%92%E3%83%A1%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%99%E3%82%8B

export function createRouter(client: Client<boolean>) {
    // ここにAPIを定義
    const router = new Router()

    router.post('/messages', koaBody(), async ctx => {
        const { channelId, content, signature } = ctx.request.body
        const text = `${channelId},${content},${process.env.SECRET_KEY}`
        if (createHash('sha256').update(text).digest('hex') !== signature) {
            throw Error("invalid signature")
        }
        const channel = client.channels.cache.get(channelId) as TextChannel
        await channel.send(content);
        ctx.body = JSON.stringify({ "status": "ok" })
    })

    return router.routes()
}

export async function apiErrorHandler(ctx: ParameterizedContext, next: Next) {
    // APIのエラー処理
    try {
        await next();
        if (ctx.status === 404) {
            ctx.app.emit("error", ctx, { status: 404, message: "404 Not Found" })
        }
    } catch (err: any) {
        console.log('error', err)
        ctx.status = err.status || 500;
        ctx.body = err.message || err;
        ctx.app.emit("error", ctx, err);
    }
}
