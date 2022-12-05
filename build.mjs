import child_process from 'child_process'
import { promisify } from 'util';
import { build } from 'esbuild'
import dotenv from 'dotenv'
import fs from 'node:fs'

const OUTPUT_DIR = "discordbot-js"
const exec = promisify(child_process.exec);
const copyFile = promisify(fs.copyFile)
dotenv.config()

// console.log("(1/3): type check")
// exec("npx tsc --noEmit").then(async () => {
console.log("(2/3): source build")
await build({
    entryPoints: ["src/main.ts"],
    external: ["discord.js"],
    bundle: true,
    minify: false,
    sourcemap: true,
    format: "cjs",
    platform: "node",
    outfile: `${OUTPUT_DIR}/main.js`,
}).then(async () => {
    console.log("(3/3): file upload")
    const user = process.env.DEPLOY_USERNAME
    const address = process.env.DEPLOY_ADDRESS
    const pubKey = process.env.DEPLOY_PUB_KEY
    // const promises = [".env", "main.js", "main.js.map"]
    //     .map(fn => exec(`scp -i ${pubKey} ${OUTPUT_DIR}/${fn} ${user}@${address}:~/${OUTPUT_DIR}/`))
    // await new Promise.all(promises)
})