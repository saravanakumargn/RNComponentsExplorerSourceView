import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { afterEach, describe, expect, it } from 'vitest';

import { buildLearningContent, CONTENT_SCHEMA_VERSION, loadContent } from '../../../tools/learning-content/build-learning-content.mjs';
import { extractTypeScriptSamples, typecheckSamples } from '../../../tools/learning-content/typecheck-samples.mjs';

const roots = [];

function fixture() {
  const root = join(tmpdir(), `learning-content-test-${process.pid}-${roots.length}`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, 'content', 'tracks'), { recursive: true });
  mkdirSync(join(root, 'content', 'lessons', '09-new-architecture'), { recursive: true });
  mkdirSync(join(root, 'assets'), { recursive: true });
  roots.push(root);
  writeFileSync(join(root, 'libraries.ts'), "export const libraries = [{\n  id: 'react-native',\n}];\n");
  writeFileSync(join(root, 'content', 'tracks', '09-new-architecture.md'), `---
id: 9
position: 9
slug: new-architecture
title: The New Architecture
description: Architecture
status: draft
rn_version_verified: "0.86"
updated_at: 2026-08-07
---
`);
  return root;
}

function lesson({ demo = 'react-native', fence = 'tsx', code = 'const value: number = 1;' } = {}) {
  return `---
id: 901
track: 9
position: 1
slug: architecture-overview
title: Architecture overview
level: 1
estimated_minutes: 5
status: published
rn_version_verified: "0.86"
updated_at: 2026-08-07
tags: [new-architecture]
demos:
  - id: ${demo}
    label: Open RNTester
---
This lesson explains the architecture.

## Example

\`\`\`${fence}
${code}
\`\`\`

## Takeaways

- The architecture is version-specific.
`;
}

/**
 * A Good to know entry. Its prose lives entirely in frontmatter fields, so the
 * Phase E editorial gate bounds those fields rather than a Markdown body.
 */
function libraryTool({ whatItIs = 'A cross-platform UI toolkit that draws its own pixels.' } = {}) {
  return `---
id: 9001
slug: flutter
name: Flutter
status: published
rn_version_verified: "0.86"
updated_at: 2026-08-14
tags: [cross-platform, ecosystem]
what_it_is: ${whatItIs}
when_to_use: When identical pixels matter more than platform-native feel.
avoid_when: When the team's existing skill and hiring pool is React.
alternatives: React Native when the team already writes React.
maintenance_signal: Very active and Google-funded. Checked August 2026.
---
`;
}

/** A decision guide whose scores reference options and criteria by position. */
function decisionGuide({ option = 1, npmPackage = null } = {}) {
  return `---
id: 9101
slug: mobile-stack
title: Which mobile stack?
question: React Native, or something else?
summary: React Native fits teams who already write React.
status: published
rn_version_verified: "0.86"
updated_at: 2026-08-14
criteria:
  - label: Team already writes React
  - label: Identical pixels everywhere
options:
  - name: React Native
${npmPackage ? `    npm_package: "${npmPackage}"\n` : ''}    verdict: The default for a JavaScript team.
    best_for: Teams who write React.
    avoid_when: You need pixel-identical output.
  - name: Flutter
    verdict: Strongest when pixels must match.
    best_for: Branded interfaces.
    avoid_when: Your hiring pool is React-shaped.
scores:
  - { option: ${option}, criterion: 1, value: 3, note: "It is React." }
  - { option: 2, criterion: 2, value: 3 }
---
`;
}

/** A snippet: prose plus exactly one fenced block, which becomes its code. */
function snippet({ fence = '```tsx', code = 'export const gap = 8 as const;' } = {}) {
  return `---
id: 9201
slug: safe-area-padding
title: Pad for the safe area
description: Keep the last row clear of the home indicator.
status: published
rn_version_verified: "0.86"
updated_at: 2026-08-14
---
Reach for this when a list ends underneath the tab bar.

${fence}
${code}
\`\`\`
`;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('learning content v2 build', () => {
  it('builds schema 2 with source Markdown, takeaways, tags, demos, and valid foreign keys', () => {
    const root = fixture();
    writeFileSync(join(root, 'content', 'lessons', '09-new-architecture', '01-overview.md'), lesson());
    const outputPath = join(root, 'assets', 'learning-content.db');

    const result = buildLearningContent({
      contentRoot: join(root, 'content'),
      outputPath,
      schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'),
      librariesPath: join(root, 'libraries.ts'),
      createdAt: '2026-08-07T00:00:00.000Z',
    });

    expect(result.items).toBe(2);
    const database = new DatabaseSync(outputPath, { readOnly: true });
    expect(database.prepare('SELECT schema_version, content_version FROM content_metadata').get()).toEqual({ schema_version: CONTENT_SCHEMA_VERSION, content_version: '2.0.0' });
    expect(database.prepare('SELECT summary, body FROM lessons').get()).toMatchObject({
      summary: 'This lesson explains the architecture.',
      body: expect.stringContaining('```tsx'),
    });
    expect(database.prepare('SELECT text FROM lesson_takeaways').get()).toEqual({ text: 'The architecture is version-specific.' });
    expect(database.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map(({ name }) => name);
    expect(tables).toEqual([
      'cheat_sheet_sections', 'cheat_sheets', 'checklist_items', 'checklists', 'code_challenge_hints', 'code_challenges',
      'content_demos', 'content_metadata', 'content_tags', 'decision_guide_criteria', 'decision_guide_options',
      'decision_guide_scores', 'decision_guides', 'design_scenario_rubric', 'design_scenario_stages', 'design_scenarios',
      'faqs', 'flashcards', 'glossary_term_links', 'glossary_terms', 'interview_followups', 'interview_questions',
      'learning_path_items', 'learning_paths', 'lesson_takeaways', 'lessons', 'library_tools', 'migration_breaking_changes',
      'migration_guide_steps', 'migration_guides', 'project_steps', 'projects', 'quiz_options', 'quiz_questions', 'quizzes',
      'snippets', 'tags', 'tracks',
    ]);
    database.close();
  });

it('accepts the ecosystem tags and stores a Good to know entry from its frontmatter fields', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'libraries'), { recursive: true });
    writeFileSync(join(root, 'content', 'libraries', '01-flutter.md'), libraryTool());
    buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'tools.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') });

    const database = new DatabaseSync(join(root, 'assets', 'tools.db'));
    expect(database.prepare('SELECT name, what_it_is FROM library_tools').get()).toMatchObject({ name: 'Flutter' });
    expect(database.prepare("SELECT COUNT(*) AS count FROM content_tags WHERE item_type = 'library_tool'").get().count).toBe(2);
    database.close();
  });

  it('rejects Good to know prose that drifts into blog length or grows headings', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'libraries'), { recursive: true });
    const path = join(root, 'content', 'libraries', '01-flutter.md');
    const build = (name) => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', name), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') });

    writeFileSync(path, libraryTool({ whatItIs: `"${'word '.repeat(61).trim()}"` }));
    expect(() => build('long.db')).toThrow(/at most 60 words/);

    writeFileSync(path, libraryTool({ whatItIs: '"## What is Flutter? A toolkit."' }));
    expect(() => build('heading.db')).toThrow(/must not contain Markdown headings/);
  });

it('resolves decision-guide scores by position, since row ids are assigned at insert time', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'decision-guides'), { recursive: true });
    writeFileSync(join(root, 'content', 'decision-guides', '01-stack.md'), decisionGuide());
    buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'guides.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') });

    const database = new DatabaseSync(join(root, 'assets', 'guides.db'));
    const scored = database.prepare(`
      SELECT options.name AS option_name, criteria.label AS criterion_label, scores.value
      FROM decision_guide_scores scores
      JOIN decision_guide_options options USING (option_id)
      JOIN decision_guide_criteria criteria USING (criterion_id)
      ORDER BY options.position
    `).all();
    expect(scored).toEqual([
      { option_name: 'React Native', criterion_label: 'Team already writes React', value: 3 },
      { option_name: 'Flutter', criterion_label: 'Identical pixels everywhere', value: 3 },
    ]);
    database.close();
  });

  /*
   * The demo deep-link on a recommendation is derived from the option's npm
   * package, so a stale name costs the link without failing anything. These
   * two keep that from happening silently.
   */
  it('rejects a decision-guide option naming a package the project has never verified', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'decision-guides'), { recursive: true });
    writeFileSync(join(root, 'content', 'decision-guides', '01-stack.md'), decisionGuide({ npmPackage: '@gluestack-ui/themed' }));
    expect(() => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'bad.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') }))
      .toThrow(/names npm package "@gluestack-ui\/themed"/);
  });

  it('accepts a package a catalogue demo is built on, even when it is not installed', () => {
    const root = fixture();
    writeFileSync(join(root, 'libraries.ts'), "export const libraries = [{\n  id: 'gifted',\n  npmPackage: 'react-native-gifted-charts',\n}];\n");
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: {} }));
    mkdirSync(join(root, 'content', 'decision-guides'), { recursive: true });
    writeFileSync(join(root, 'content', 'decision-guides', '01-stack.md'), decisionGuide({ npmPackage: 'react-native-gifted-charts' }));
    buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'packages.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts'), packageJsonPath: join(root, 'package.json') });

    const database = new DatabaseSync(join(root, 'assets', 'packages.db'));
    expect(database.prepare('SELECT npm_package FROM decision_guide_options ORDER BY position').get()).toMatchObject({ npm_package: 'react-native-gifted-charts' });
    database.close();
  });

  it('rejects a decision-guide score pointing past the options it has', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'decision-guides'), { recursive: true });
    writeFileSync(join(root, 'content', 'decision-guides', '01-stack.md'), decisionGuide({ option: 7 }));
    expect(() => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'bad.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') }))
      .toThrow(/references option 7, but this guide has 2 options/);
  });

it('takes snippet code from the body fence so the sample typechecker covers it', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'snippets'), { recursive: true });
    writeFileSync(join(root, 'content', 'snippets', '01-safe-area.md'), snippet());
    buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'snippets.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') });

    const database = new DatabaseSync(join(root, 'assets', 'snippets.db'));
    const row = database.prepare('SELECT code, language, explanation FROM snippets').get();
    expect(row).toMatchObject({ code: 'export const gap = 8 as const;', language: 'tsx' });
    // The prose survives, and the fence is not repeated inside it.
    expect(row.explanation).toContain('Reach for this');
    expect(row.explanation).not.toContain('export const gap');
    database.close();

    // The same fence is what the typechecker picks up.
    expect(extractTypeScriptSamples(join(root, 'content')).some((sample) => sample.code.includes('export const gap'))).toBe(true);
  });

  it('rejects a snippet with no code, and one with no explanation', () => {
    const root = fixture();
    mkdirSync(join(root, 'content', 'snippets'), { recursive: true });
    const path = join(root, 'content', 'snippets', '01-safe-area.md');
    const build = (name) => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', name), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') });

    writeFileSync(path, snippet().replace(/```tsx[\s\S]*?```/, ''));
    expect(() => build('nocode.db')).toThrow(/must contain one fenced code block/);

    writeFileSync(path, snippet().replace('Reach for this when a list ends underneath the tab bar.', ''));
    expect(() => build('noprose.db')).toThrow(/needs prose explaining it, not only code/);
  });

  it('rejects missing fence languages, unknown tags, and unknown demo IDs', () => {
    const root = fixture();
    const path = join(root, 'content', 'lessons', '09-new-architecture', '01-overview.md');
    writeFileSync(path, lesson({ fence: '' }));
    expect(() => loadContent(join(root, 'content'))).toThrow(/requires an explicit language/);

    writeFileSync(path, lesson().replace('tags: [new-architecture]', 'tags: [new-architecture, unknown-tag]'));
    expect(() => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'one.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') })).toThrow(/unknown tag/);

    writeFileSync(path, lesson({ demo: 'missing-demo' }));
    expect(() => buildLearningContent({ contentRoot: join(root, 'content'), outputPath: join(root, 'assets', 'two.db'), schemaPath: join(process.cwd(), 'tools/learning-content/schema.sql'), librariesPath: join(root, 'libraries.ts') })).toThrow(/unknown demo id/);
  });
});

describe('learning sample typecheck', () => {
  it('extracts ts and tsx fences with source locations and accepts valid installed React Native types', () => {
    const root = fixture();
    writeFileSync(join(root, 'content', 'lessons', '09-new-architecture', '01-overview.md'), lesson({ code: "import type { ViewProps } from 'react-native';\nconst props: ViewProps = {};" }));

    expect(extractTypeScriptSamples(join(root, 'content'))).toEqual([
      expect.objectContaining({ extension: 'tsx', source: 'lessons/09-new-architecture/01-overview.md' }),
    ]);
    expect(typecheckSamples({ contentRoot: join(root, 'content'), projectRoot: process.cwd() })).toEqual({ samples: 1 });
  });

  it('fails on a non-compiling sample', () => {
    const root = fixture();
    writeFileSync(join(root, 'content', 'lessons', '09-new-architecture', '01-overview.md'), lesson({ code: "const count: number = 'wrong';" }));
    expect(() => typecheckSamples({ contentRoot: join(root, 'content'), projectRoot: process.cwd() })).toThrow(/failed TypeScript validation/);
  });
});
