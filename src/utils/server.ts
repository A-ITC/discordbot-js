import { Next, ParameterizedContext } from 'koa'
import { Client, TextChannel } from 'discord.js'
import { createHash } from 'crypto';
import koaBody from "koa-body"
import Router from "koa-router"
import dotenv from "dotenv"
dotenv.config();

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
            throw Error("404 not found")
        }
    } catch (err: any) {
        console.error('error', err)
        ctx.status = ctx.status || 500;
        ctx.body = JSON.stringify({ status: "ng", detail: err.message || err })
    }
}