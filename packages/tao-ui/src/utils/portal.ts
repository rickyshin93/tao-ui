/** A parent dialog may close only through its own mask, not a portaled child. */
export function preventParentOutsideDismiss(event: {
  preventDefault: () => void;
}): void {
  event.preventDefault();
}
