export function countAnchored(
  display: string,
  upTo: number,
  thousandsSeparator: string,
): number {
  const limit = Math.min(upTo, display.length);
  if (!thousandsSeparator) return Math.max(0, limit);
  let count = 0;
  for (let i = 0; i < limit; i++) {
    if (display[i] !== thousandsSeparator) count++;
  }
  return count;
}

export function findCursorAt(
  display: string,
  anchorCount: number,
  thousandsSeparator: string,
): number {
  if (anchorCount <= 0) return 0;
  if (!thousandsSeparator) return Math.min(anchorCount, display.length);
  let count = 0;
  for (let i = 0; i < display.length; i++) {
    if (display[i] !== thousandsSeparator) count++;
    if (count === anchorCount) return i + 1;
  }
  return display.length;
}

// Count from end is the stable side when user is typing — chars after the cursor
// rarely change shape, so we anchor the cursor to "how many tokens are after me".
function countAnchoredFromEnd(
  display: string,
  fromPos: number,
  thousandsSeparator: string,
): number {
  if (fromPos >= display.length) return 0;
  if (!thousandsSeparator) return display.length - Math.max(0, fromPos);
  let count = 0;
  for (let i = Math.max(0, fromPos); i < display.length; i++) {
    if (display[i] !== thousandsSeparator) count++;
  }
  return count;
}

function findCursorFromEnd(
  display: string,
  anchoredFromEnd: number,
  thousandsSeparator: string,
): number {
  if (anchoredFromEnd <= 0) return display.length;
  if (!thousandsSeparator) return Math.max(0, display.length - anchoredFromEnd);
  let count = 0;
  for (let i = display.length - 1; i >= 0; i--) {
    if (display[i] !== thousandsSeparator) count++;
    if (count === anchoredFromEnd) return i;
  }
  return 0;
}

export function reposition(args: {
  before: string;
  beforeCursor: number;
  after: string;
  thousandsSeparator: string;
}): number {
  const { before, beforeCursor, after, thousandsSeparator } = args;
  const fromEnd = countAnchoredFromEnd(
    before,
    beforeCursor,
    thousandsSeparator,
  );
  return findCursorFromEnd(after, fromEnd, thousandsSeparator);
}

export function isThousandSepBeforeCursor(
  display: string,
  cursor: number,
  thousandsSeparator: string,
): boolean {
  if (!thousandsSeparator || cursor <= 0) return false;
  return display[cursor - 1] === thousandsSeparator;
}
