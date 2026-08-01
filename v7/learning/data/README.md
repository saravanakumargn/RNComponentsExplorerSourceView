# Learning SQLite data layer

`learning-content.db` and `learning-progress.db` are intentionally separate.

- The content database is a validated release asset and is read through an
  injected `SQLiteDatabase`. The repository never opens it itself, so an absent
  asset cannot accidentally become an empty persistent database.
- The progress database is created locally by
  `initializeLearningProgressDatabase`. It contains only completion state and
  the last-read lesson. It does not inspect or migrate legacy Realm progress.

When the validated asset is exported, the next increment will add a
`SQLiteProvider` with the asset source and a metadata/version assertion. The
provider must import the asset before content repository queries run.
