export type AnswerValidationInput = {
  correctIndex: number;
  chosenIndex: number;
  optionsCount: number;
};

export type AnswerValidationResult = {
  isCorrect: boolean;
  isValid: boolean;
};

export function validateAnswer({
  correctIndex,
  chosenIndex,
  optionsCount
}: AnswerValidationInput): AnswerValidationResult {
  const isValid =
    Number.isInteger(chosenIndex) &&
    chosenIndex >= 0 &&
    Number.isInteger(optionsCount) &&
    optionsCount > 0 &&
    chosenIndex < optionsCount;

  if (!isValid) {
    return {
      isCorrect: false,
      isValid: false
    };
  }

  return {
    isCorrect: chosenIndex === correctIndex,
    isValid: true
  };
}
