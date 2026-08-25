# Asteria extension catalog listing / Asteria 拡張カタログ掲載申請

この Pull Request は、拡張機能の配布物そのものではなく、Asteria に表示するカタログメタデータを提案するものです。必須事項をすべて記入してください。空欄のままの申請や検証に失敗する申請は受理されません。

## Required submission / 必須記入

- [ ] **Source repository / ソースリポジトリ:** 公開リポジトリ URL と、確認に必要なブランチまたはタグを記入しました。
- [ ] **Release origin / リリース配布元:** 不変（immutable）の ZIP を公開している HTTPS の release asset URL を記入しました。配布物を同じ URL で差し替える運用にはしません。
- [ ] **License / ライセンス:** 配布物に適用されるライセンスと、その全文または公式説明への URL を記入しました。
- [ ] **Asteria compatibility / Asteria 互換性:** `asteria.minimum` と `asteria.maximum_exclusive` が、この ZIP を実際に動作確認した範囲を表しています。
- [ ] **Capabilities / capability の申告:** `network`、`filesystem`、`subprocess` のうち、拡張機能が要求するものを漏れなく `capabilities` に宣言しました。要求しない capability は追加していません。
- [ ] **Archive identity / 配布物の同一性:** この release asset から計算した lowercase の **SHA-256** と正確な **size_bytes** を記入しました。
- [ ] **One current entry / ID ごとに現行 entry は一つ:** 同じ ID の古い entry を追加せず、既存 entry がある場合はその現行情報を更新しました。
- [ ] **Local validation / ローカル検証:** `npm ci` と `npm run validate` を実行し、成功を確認しました。
- [ ] **Trust boundary / 信頼境界:** カタログ掲載と metadata validation は extension code の **security audit** ではなく、Asteria やカタログ管理者が安全性・品質・継続提供を保証するものではないことを理解しています。これは拡張機能コードの**セキュリティ監査ではありません**。

## Notes for reviewers / レビュー担当への補足

- 配布物の変更点、依存関係、既知の権限要求やネットワーク接続先があれば記載してください。
- `catalog-v1.json` のみを更新する場合でも、関連する URL、SHA-256、サイズ、互換性範囲を再確認してください。
- `main` へマージされるまで、提案内容は Asteria の公開カタログには反映されません。
