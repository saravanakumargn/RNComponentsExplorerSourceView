export type FormikExampleSlug =
  | 'basic-form'
  | 'validation-rules'
  | 'field-arrays'
  | 'dependent-fields'
  | 'focus-error-handling'
  | 'submit-reset';

export type FormikExampleMeta = {
  description: string;
  slug: FormikExampleSlug;
  title: string;
};

export const FORMIK_EXAMPLES: FormikExampleMeta[] = [
  {
    description: '<Field>/useField-wrapped inputs with required and pattern validation.',
    slug: 'basic-form',
    title: 'Basic Form',
  },
  {
    description: 'A validate function covering min/maxLength, pattern, numeric range, and cross-field checks.',
    slug: 'validation-rules',
    title: 'Validation Rules',
  },
  {
    description: 'FieldArray: add, remove, and reorder a dynamic list of fields.',
    slug: 'field-arrays',
    title: 'Field Arrays',
  },
  {
    description: 'Reading values directly to conditionally show fields and compute a live summary.',
    slug: 'dependent-fields',
    title: 'Dependent Fields',
  },
  {
    description: 'Error summaries, touched state, and focusing the first invalid field on submit.',
    slug: 'focus-error-handling',
    title: 'Focus & Error Handling',
  },
  {
    description: 'Async submit flow with isSubmitting, success/failure paths, and resetForm().',
    slug: 'submit-reset',
    title: 'Submit & Reset Flow',
  },
];
