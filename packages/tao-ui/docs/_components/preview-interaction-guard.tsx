import { useEffect } from 'react';

export default function PreviewInteractionGuard() {
  useEffect(() => {
    const preservePickerInteraction = (event: FocusEvent) => {
      const input = event.target;
      const nextTarget = event.relatedTarget;

      if (!(input instanceof HTMLInputElement)) return;
      if (!input.matches('[data-tao-picker-input]')) return;
      if (!(nextTarget instanceof Node)) return;

      const popup = input.ownerDocument.querySelector(
        '[data-tao-picker-dropdown]',
      );
      if (popup?.contains(nextTarget)) event.stopPropagation();
    };

    document.addEventListener('focusout', preservePickerInteraction, true);
    return () =>
      document.removeEventListener('focusout', preservePickerInteraction, true);
  }, []);

  return null;
}
