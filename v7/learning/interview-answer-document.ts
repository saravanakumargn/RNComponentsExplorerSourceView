import type { InterviewFollowup, InterviewQuestion } from '@/features/learning/data/learning-types';

type InterviewAnswerDocumentInput = { question: InterviewQuestion; followups: InterviewFollowup[] };

/**
 * The full markdown for one interview answer.
 *
 * An interview question carries three separate pieces of content, and the
 * reader shipped only the last of them: `short_answer` is the answer someone
 * would say out loud, the body is the one-line point behind it, and the
 * follow-ups are what an interviewer asks next. Rendering the body alone left
 * every question showing a bare "Strong answers …" note and no answer at all.
 *
 * Order follows how the question is used: answer first, the point it turns on
 * second, then the follow-up ladder.
 */
export function buildInterviewAnswerDocument({ question, followups }: InterviewAnswerDocumentInput): string {
  const sections = [`## ${question.question}`, question.shortAnswer.trim(), question.explanation.trim()];

  if (followups.length > 0) {
    sections.push('### Follow-ups');
    for (const followup of followups) sections.push(`**${followup.question.trim()}**`, followup.answer.trim());
  }

  return sections.filter(Boolean).join('\n\n');
}
