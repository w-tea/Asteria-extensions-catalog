# Asteria Extensions Catalog / Asteria 拡張カタログ

このディレクトリは、公開カタログリポジトリ`w-tea/Asteria-extensions-catalog`の元になる雛形です。Asteriaは次のGitHub Raw URLから、`main`のカタログだけを取得します。

```text
https://raw.githubusercontent.com/w-tea/Asteria-extensions-catalog/main/catalog-v1.json
```

## 日本語

### このリポジトリが扱うもの

カタログには、Asteria拡張機能の名前、対応バージョン、要求する権限、配布ZIPのURL、SHA-256、サイズといった**メタデータ**だけを登録します。ZIP本体は、認証情報なしでアクセスできるHTTPSの公開先に置きます。通常はバージョンタグを付けてGitHub Releasesへ公開すると、配布元とバージョンの対応を確認しやすくなります。

Asteria に公開されるのは、レビューを経て `main` にマージ済みの内容だけです。fork、作業ブランチ、Pull Request の途中の内容は配信されません。`main` の保護設定と `.github/CODEOWNERS` により、掲載は `@w-tea` の明示的な確認を前提にします。

### 掲載を申請する手順

1. 拡張機能の公開リポジトリを用意し、バージョンごとに新しいZIPをGitHub ReleasesなどのHTTPS配布先へ公開します。公開後は、同じURLのファイルを差し替えないでください。
2. そのZIPのSHA-256を英小文字で表記し、正確なサイズを計算します。Windows PowerShellでは、たとえば次で確認できます。

   ```powershell
   (Get-FileHash -Algorithm SHA256 .\extension.zip).Hash.ToLower()
   (Get-Item .\extension.zip).Length
   ```

3. このカタログリポジトリをフォークし、自分の作業ブランチを作ります。
4. `catalog-v1.json`に掲載内容を追加します。すでに同じIDがある場合は、過去版を増やさず**現行の掲載内容を一つだけ**更新してください。IDは大文字・小文字を区別せず並べ替えます。
5. `asteria.minimum`と`asteria.maximum_exclusive`には、実際に確認した対応範囲を記入します。
6. `execution_level`と`permissions`は必ず記入します。標準拡張では`execution_level`を`standard`にして、`prompt.read`、接続先のHTTPSオリジン、ローカル接続先のうち必要な権限だけを`permissions`へ記載します。`capabilities`は空にしてください。
7. フルアクセス拡張では`execution_level`を`full_access`にして、`permissions`を空にします。`network`、`filesystem`、`subprocess`のうち必要な機能は`capabilities`へ記載してください。
8. このディレクトリで `npm ci`、続けて `npm run validate` を実行します。
9. カタログリポジトリの `main` 宛てに Pull Request を開き、PR テンプレートの確認事項をすべて記入します。

JSON Schema、IDの重複・並び順、HTTPS URL、互換性の範囲、SHA-256、サイズは自動で検証されます。ただし、この検証は拡張機能コードのセキュリティ監査ではありません。掲載されていることも、安全性、品質、動作、継続的な提供を保証するものではありません。利用者と管理者は、導入前にソース、リリースの出所、ライセンス、拡張機能が要求する権限を確認してください。

### ローカル検証

```bash
npm ci
npm run validate
```

`schemas/extension-catalog-v1.schema.json`は、Asteriaリポジトリの正規スキーマを一バイト単位で複製したものです。似た別スキーマを追加したり、このコピーだけを手で変更したりしないでください。

## English

### What this repository contains

This directory is the canonical bootstrap template for the public `w-tea/Asteria-extensions-catalog` repository. Asteria fetches only the catalog at the raw GitHub endpoint shown above. Extension archives stay at each author's credential-free HTTPS release location; a tagged GitHub Release asset is the normal choice because its provenance and version are easy to inspect.

Only merged `main` is published to Asteria. Forks, topic branches, and open Pull Requests are never catalog delivery sources. Protected-branch rules and `.github/CODEOWNERS` require `@w-tea` review before a listing can become public.

### How to submit a listing

1. Publish an immutable ZIP for the extension at a credential-free HTTPS release URL.
2. Compute the ZIP's lowercase SHA-256 and exact `size_bytes`.
3. Fork this catalog repository and create a topic branch.
4. Add the entry to `catalog-v1.json`, or update the one current entry for that ID. Do not add a second historical entry for the same ID. Keep IDs sorted case-insensitively.
5. Declare the tested Asteria compatibility range.
6. Always declare `execution_level` and `permissions`. Standard extensions use `standard`, list only the required `prompt.read`, HTTPS-origin, and localhost permissions, and leave `capabilities` empty.
7. Full-access extensions use `full_access`, leave `permissions` empty, and declare every required `network`, `filesystem`, or `subprocess` capability.
8. Run `npm ci` and then `npm run validate` in this directory.
9. Open a Pull Request against `main` and complete every item in the PR template.

Validation checks metadata shape, ordering, URLs, compatibility ranges, SHA-256, and size. Metadata validation is not a security audit of extension code, and listing is not a guarantee of safety, quality, compatibility, or continued availability. Review source, release provenance, license, and declared capabilities before installation.

### Local validation

```bash
npm ci
npm run validate
```

`schemas/extension-catalog-v1.schema.json` must remain a byte-for-byte copy of Asteria's canonical schema. Do not hand-edit this copy or add a parallel schema.
