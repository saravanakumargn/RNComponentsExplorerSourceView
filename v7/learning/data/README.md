# Learning SQLite data layer v2

`learning-content.db` and `learning-progress-v2.db` are intentionally separate.

- The content database is generated from `content/`, validated, and bundled read-only. The provider force-copies the asset and rejects anything other than schema 2 / content 2.0.0 before descendants can query it.
- The progress database is greenfield and local. No code opens, inspects, or migrates the legacy progress filename. Its tables are created with idempotent `CREATE TABLE IF NOT EXISTS` statements and deliberately have no `user_version` migration framework.
- `learning-content-repository.ts` maps the v2 `tracks`/`lessons` names into the current learning screens while exposing v2 metadata, takeaways, follow-ups, tags, and demo links. Phase A can add screens for the remaining locked content tables without changing their schema.
