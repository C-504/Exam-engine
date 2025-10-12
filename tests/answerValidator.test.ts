import { describe, expect, it } from 'vitest';
import { validateAnswer } from '@/lib/quiz/answerValidator';

describe('validateAnswer', () => {
  it('returns correct when chosen index matches the correct index', () => {
    const result = validateAnswer({
      correctIndex: 2,
      chosenIndex: 2,
      optionsCount: 4
    });

    expect(result).toEqual({
      isCorrect: true,
      isValid: true
    });
  });

  it('returns incorrect when chosen index differs', () => {
    const result = validateAnswer({
      correctIndex: 1,
      chosenIndex: 3,
      optionsCount: 4
    });

    expect(result).toEqual({
      isCorrect: false,
      isValid: true
    });
  });

  it('marks answer invalid when chosen index is negative', () => {
    const result = validateAnswer({
      correctIndex: 0,
      chosenIndex: -1,
      optionsCount: 4
    });

    expect(result).toEqual({
      isCorrect: false,
      isValid: false
    });
  });

  it('marks answer invalid when chosen index exceeds options', () => {
    const result = validateAnswer({
      correctIndex: 2,
      chosenIndex: 4,
      optionsCount: 4
    });

    expect(result).toEqual({
      isCorrect: false,
      isValid: false
    });
  });

  it('marks answer invalid when options count is zero', () => {
    const result = validateAnswer({
      correctIndex: 0,
      chosenIndex: 0,
      optionsCount: 0
    });

    expect(result).toEqual({
      isCorrect: false,
      isValid: false
    });
  });
});
