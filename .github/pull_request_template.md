# Asteria extension catalog listing / Asteria 拡張カタログ掲載申請

この Pull Request は、拡張機能の配布物そのものではなく、Asteria に表示するカタログメタデータを提案するものです。必須事項をすべて記入してください。空欄のままの申請や検証に失敗する申請は受理されません。

## Required submission / 必須記入

- [ ] **Source repository / ソースリポジトリ:** 公開リポジトリ URL と、確認に必要なブランチまたはタグを記入しました。
- [ ] **Release origin / リリース配布元:** ZIPを直接ダウンロードできるHTTPS URLを記入しました。`github_release_zip`ではGitHub Releaseの配布ファイルURLを使い、Release画面のURLは使っていません。公開後に同じURLのファイルを差し替える運用にはしません。
- [ ] **License / ライセンス:** 配布物に適用されるライセンスと、その全文または公式説明への URL を記入しました。
- [ ] **Asteria compatibility / Asteria 互換性:** `asteria.minimum` と `asteria.maximum_exclusive` が、この ZIP を実際に動作確認した範囲を表しています。
- [ ] **Execution level / 実行方式:** `execution_level`に`standard`または`full_access`を明記しました。
- [ ] **Standard permissions / 標準拡張の権限:** 標準拡張では、必要な`prompt.read`、HTTPSオリジン、ローカル接続先だけを`permissions`に記載し、`capabilities`を空にしました。HTTPSオリジンのホスト名は小文字にし、既定のポート`443`は省略しました。フルアクセス拡張では`permissions`を空にしました。
- [ ] **Full-access capabilities / フルアクセス拡張の機能:** フルアクセス拡張では、`network`、`filesystem`、`subprocess`のうち必要なものを`capabilities`に記載しました。標準拡張では追加していません。
- [ ] **Archive identity / 配布物の同一性:** 公開したZIPから計算した英小文字表記の **SHA-256** と正確な **size_bytes** を記入しました。
- [ ] **One current entry / IDごとの掲載内容:** 同じIDの古い掲載内容を追加せず、既存の掲載内容がある場合は更新しました。
- [ ] **Review status / 掲載区分:** 外部から申請する場合は`community`または`unverified`を選びました。`official`は管理者が設定する区分であることを理解しています。
- [ ] **Text and screenshots / 文字列と画像:** 名前や説明の先頭・末尾に不要な空白がなく、スクリーンショットのパスも大文字・小文字を区別せず重複していません。
- [ ] **Local validation / ローカル検証:** `npm ci` と `npm run validate` を実行し、成功を確認しました。
- [ ] **Trust boundary / 信頼境界:** カタログへの掲載とメタデータの検証は、拡張機能コードのセキュリティ監査ではありません。Asteriaやカタログ管理者が安全性、品質、継続的な提供を保証するものでもないことを理解しています。

## Notes for reviewers / レビュー担当への補足

- 配布物の変更点、依存関係、既知の権限要求やネットワーク接続先があれば記載してください。
- `catalog-v1.json` のみを更新する場合でも、関連する URL、SHA-256、サイズ、互換性範囲を再確認してください。
- `main` へマージされるまで、提案内容は Asteria の公開カタログには反映されません。
