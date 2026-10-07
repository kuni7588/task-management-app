# タスク管理アプリ

スマートフォン向けタスク管理Webアプリケーションです。

## 概要

本人が自分のタスクを管理するためのWebアプリケーションです。

## 使用技術

- React
- Vite
- Java
- Spring Boot
- H2 Database
- Git
- GitHub

## 機能

- ログイン
- タスク一覧表示
- タスク登録
- タスク編集
- タスク削除

## 開発環境

- Visual Studio Code
- IntelliJ IDEA
- H2 Database
- Git
- GitHub

## ローカルでの起動方法

以下はWindowsのPowerShellを使う場合の手順です。
Java・Node.js・npmを事前にインストールしてください。
Javaのバージョンは `backend/pom.xml` の `java.version` に合わせてください。

### 1. バックエンドの起動

プロジェクト直下でターミナルを開き、実行します。

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

バックエンドは `http://localhost:8080` で起動します。
このターミナルは実行したままにします。

### 2. 初回のみ：H2のテーブル作成

開発用DBは `backend/data/` に保存されます。
DBファイルはGit管理対象外のため、初回はテーブル作成が必要です。

ブラウザで次を開きます。

```text
http://localhost:8080/h2-console
```

接続設定：

| 項目         | 値                                                |
| ------------ | ------------------------------------------------- |
| Driver Class | org.h2.Driver                                     |
| JDBC URL     | jdbc:h2:file:./data/taskdb;DB_CLOSE_ON_EXIT=FALSE |
| User Name    | sa                                                |
| Password     | 空欄                                              |

接続後、`backend/src/main/resources/schema.sql` の内容をSQL入力欄へ貼り付けて実行します。

このSQLは初回だけ実行します。
既存のテーブルがある場合は、再実行しません。

通常起動時は、テーブルの自動作成や `schema.sql` の自動実行を行わない設定です。

### 3. 初回のみ：開発確認用ユーザーの登録

ユーザー登録画面は実装していないため、開発確認用ユーザーをH2に登録します。

1. IntelliJ IDEAで `backend` プロジェクトを開きます。
2. `src/test/java/com/example/taskmanagementbackend/PasswordHashGenerator.java` を開きます。
3. `testPassword` に開発確認用のパスワードを設定します。
4. `PasswordHashGenerator.main()` を実行します。
5. 出力された `PASSWORD_HASH` の値と、`照合確認: true` を確認します。

H2 Consoleで、以下のハッシュ部分を生成した値に置き換えてから実行します。

```sql
INSERT INTO USERS (USERNAME, PASSWORD_HASH)
VALUES ('demo', 'ここを生成したハッシュ値に置き換える');
```

ログイン時は、ユーザー名に `demo`、パスワードに `testPassword` に設定した文字列を入力します。
ハッシュ値そのものをログイン画面へ入力する必要はありません。

この手順のユーザー作成は初回だけ行います。
実際のサービスで使用しているパスワードは使わないでください。

### 4. フロントエンドの起動

別のターミナルをプロジェクト直下で開き、実行します。

```powershell
Set-Location frontend
npm ci
npm run dev
```

ターミナルに表示されたLocalのURLをブラウザで開きます。
標準のURLは `http://localhost:5173/` です。

開発中の `/api` への通信は、Viteのproxyを通してバックエンドへ転送します。

## 認証とタスクの所有者

- パスワードはBCryptでハッシュ化して保存します。
- ログイン状態はサーバーのセッションで管理します。
- 登録・更新・削除・ログアウト時にはCSRFトークンを送信します。
- タスクの所有者はサーバー側の認証情報から決定します。
- ログインユーザーは自分のタスクだけを取得・更新・削除できます。
- 別ユーザーのタスクをIDで指定した場合は404を返します。
- 未ログインでタスク一覧へアクセスした場合は401を返します。

## ビルド・テスト

### フロントエンド

`frontend` フォルダで実行します。

```powershell
npm run build
```

配布用ファイルは `frontend/dist/` に生成されます。
Viteのproxy設定は開発サーバー用のため、配布時には別途APIへの接続構成が必要です。

### バックエンド

`backend` フォルダで実行します。

```powershell
.\mvnw.cmd test
```

現在の自動テストは、Spring Bootの構成全体の起動確認です。
テスト専用のメモリ上のH2を使用します。

ログイン・ログアウト・タスク操作・ユーザー間のアクセス制限・通信失敗時の動作は、ブラウザとPostmanで手動確認しています。

## Git管理対象外のファイル

以下はGitHubへ含めません。

- 開発用DB：`backend/data/`
- Javaのビルド結果：`target/`
- Node.jsの依存ライブラリ：`node_modules/`
- Reactのビルド結果：`dist/`
- 環境変数ファイル：`.env` など
