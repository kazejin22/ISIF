// Indonesian translations of data copy, keyed by the exact English text.
// Inline UI strings don't need an entry here: they pass both languages to t().

import { STATS_ID } from "./stats";
import { LEARNING_ID } from "./learning";
import { CASES_ID } from "./cases";
import { DETECTOR_ID } from "./detector";

export const ID_DICTIONARY: Record<string, string> = {
  ...STATS_ID,
  ...LEARNING_ID,
  ...CASES_ID,
  ...DETECTOR_ID,
};
