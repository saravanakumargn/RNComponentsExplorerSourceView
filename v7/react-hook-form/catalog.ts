export type ReactHookFormExampleSlug =
  | 'basic-form'
  | 'validation-rules'
  | 'field-arrays'
  | 'watch-dependent-fields'
  | 'focus-error-handling'
  | 'submit-reset';

export type ReactHookFormExampleMeta = {
  description: string;
  slug: ReactHookFormExampleSlug;
  title: string;
};

export const REACT_HOOK_FORM_EXAMPLES: ReactHookFormExampleMeta[] = [
  {
    description: 'Controller-wrapped inputs with required and pattern validation.',
    slug: 'basic-form',
    title: 'Basic Form',
  },
  {
    description: 'Built-in validation rules: min/maxLength, pattern, numeric range, and cross-field validate.',
    slug: 'validation-rules',
    title: 'Validation Rules',
  },
  {
    description: 'useFieldArray: add, remove, and reorder a dynamic list of fields.',
    slug: 'field-arrays',
    title: 'Field Arrays',
  },
  {
    description: 'watch() to conditionally show fields and compute a live summary.',
    slug: 'watch-dependent-fields',
    title: 'Watch & Dependent Fields',
  },
  {
    description: 'Error summaries, touched/dirty state, and auto-focusing the first invalid field.',
    slug: 'focus-error-handling',
    title: 'Focus & Error Handling',
  },
  {
    description: 'Async submit flow with loading state, success/failure paths, and reset().',
    slug: 'submit-reset',
    title: 'Submit & Reset Flow',
  },
];
