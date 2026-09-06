import { describe, expect, it } from 'vitest';

import type { InterviewFollowup, InterviewQuestion } from '@/features/learning/data/learning-types';
import { buildInterviewAnswerDocument } from './interview-answer-document';

const question: InterviewQuestion = {
  questionId: 5,
  slug: 'js-const-guarantee',
  question: 'What does `const` actually prevent?',
  shortAnswer: 'Reassignment of the binding. It says nothing about the value, so objects and arrays it holds remain mutable.',
  explanation: 'Strong answers separate the binding from the value.',
  questionType: 'conceptual',
  level: 1,
  rnVersionVerified: '0.86',
};

const followups: InterviewFollowup[] = [
  { followupId: 9, questionId: 5, position: 1, question: 'How do you make the value itself immutable?', answer: '`Object.freeze` for a shallow guard.' },
  { followupId: 10, questionId: 5, position: 2, question: 'Why does that distinction matter in React?', answer: 'A mutated object is the same object.' },
];

describe('buildInterviewAnswerDocument', () => {
  it('renders the answer, not only the body note', () => {
    const document = buildInterviewAnswerDocument({ question, followups: [] });

    expect(document).toBe([
      '## What does `const` actually prevent?',
      'Reassignment of the binding. It says nothing about the value, so objects and arrays it holds remain mutable.',
      'Strong answers separate the binding from the value.',
    ].join('\n\n'));
  });

  it('appends the follow-up ladder in stored order', () => {
    const document = buildInterviewAnswerDocument({ question, followups });

    expect(document).toContain('### Follow-ups');
    expect(document.indexOf('**How do you make the value itself immutable?**')).toBeLessThan(document.indexOf('**Why does that distinction matter in React?**'));
    expect(document).toContain('`Object.freeze` for a shallow guard.');
  });

  it('drops an empty body rather than leaving a blank gap', () => {
    const document = buildInterviewAnswerDocument({ question: { ...question, explanation: '  ' }, followups: [] });

    expect(document).toBe(`## ${question.question}\n\n${question.shortAnswer}`);
  });
});
