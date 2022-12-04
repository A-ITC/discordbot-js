# itc-discord-ob
OB用に制作予定のdiscordbotです

## 起動の仕方
### ローカル
1. npm run compile
2. npm run start

### デプロイ
1. ソースコードのビルド（とアップロード）
```sh
$ npm run build
```
2. 起動
```sh
$ cd discordbot-js
$ nohup node --enable-source-maps main.js &
```

Google Application Engine を使うことを予定