export const getPercentageOfMatchingWords = (a: string, b: string): number => {
  const wordsA = a.toLowerCase().trim().split(' ');
  const wordsB = b.toLowerCase().trim().split(' ');

  const matchingWords = wordsA.filter((w) => wordsB.includes(w));

  return matchingWords.length / Math.min(wordsA.length, wordsB.length);
};
