/** A parent dialog may close only through its own mask, not a portaled child. */
export function preventParentOutsideDismiss(event: {
  preventDefault: () => void;
}): void {
  event.preventDefault();
}

/**
 * Dialogs see Escape first (document capture). An expanded combobox inside
 * them owns that key: it closes its popup and leaves the dialog open.
 */
export function isEscapeForOpenCombobox(event: KeyboardEvent): boolean {
  const target = event.target;
  if (
    !(target instanceof Element) ||
    target.getAttribute('aria-expanded') !== 'true'
  )
    return false;
  const popup = target.getAttribute('aria-haspopup');
  return (
    target.getAttribute('role') === 'combobox' ||
    (popup != null && popup !== 'false')
  );
}
