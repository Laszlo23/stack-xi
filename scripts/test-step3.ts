/**
 * Step 3 smoke tests — distribution status + PNG filename helpers.
 * Run: bun run scripts/test-step3.ts
 */

import {
  isDistributionComplete,
  type DistributionStatus,
} from "../src/lib/growth/distribution-status";
import { shareCardFilename } from "../src/lib/share/download-png";
import { getCalendarDayProgress, VIRAL_CALENDAR_WEEKS } from "../src/lib/growth/viral-calendar";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

console.log("Step 3 tests\n");

// shareCardFilename
const filename = shareCardFilename("prediction-France");
assert(filename.startsWith("stack-xi-prediction-france-"), "shareCardFilename slugifies prefix");
assert(filename.endsWith(".png"), "shareCardFilename adds .png extension");

// distribution complete logic
const incomplete: DistributionStatus = {
  farcasterPosted: true,
  xPosted: false,
  pngDownloaded: true,
  updatedAt: "",
};
const complete: DistributionStatus = {
  farcasterPosted: true,
  xPosted: true,
  pngDownloaded: true,
  updatedAt: "",
};
assert(!isDistributionComplete(incomplete), "incomplete when X not posted");
assert(isDistributionComplete(complete), "complete when FC + X posted");

// calendar structure
assert(VIRAL_CALENDAR_WEEKS.length === 2, "two calendar weeks defined");
const totalDays = VIRAL_CALENDAR_WEEKS.reduce((n, w) => n + w.days.length, 0);
assert(totalDays === 14, "14 calendar days total");

const progress = getCalendarDayProgress();
assert(progress.totalDays === 14, "getCalendarDayProgress totalDays");
assert(progress.dayIndex >= 1 && progress.dayIndex <= 14, "dayIndex in range 1–14");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
