[README.md](https://github.com/user-attachments/files/28667161/README.md)
# shared-calendar# 共有カレンダー Web アプリ

このワークスペースには、Next.js フロントエンドと NestJS バックエンドで構成された共有カレンダーアプリが含まれています。

## フォルダー構成

- `backend/` - NestJS サーバー、Prisma、認証、カレンダー、イベント API
- `frontend/` - Next.js アプリ、MUI、FullCalendar

認証はユーザー名（`username`）とパスワードで行う設定になっています。メールアドレスは登録時に任意で提供できます。

## 前提

- Node.js / npm がインストールされていること
- `backend/.env` にデータベースと JWT の設定があること

## バックエンド起動

1. `cd backend`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run start:dev`

> PowerShell で `npx` / `npm` に `スクリプトの実行が無効` というエラーが出る場合は、以下のいずれかを使用してください。
>
> - `cmd /c "npx prisma generate && npx prisma migrate dev --name init && npm run start:dev"`
> - `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force`

## フロントエンド起動

1. `cd frontend`
2. `npm install`
3. `npm run dev`

### API

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /calendars`
- `POST /calendars`
- `GET /calendars/:id/members`
- `POST /calendars/:id/members`
- `GET /events/calendar/:id?month=YYYY-MM`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

## 注意

この実装では開発向けに SQLite を使用しています。Supabase/PostgreSQL へ移行する場合は `backend/prisma/schema.prisma` の `datasource` を変更してください。
