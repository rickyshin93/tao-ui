/** Physical offset from the left edge; native RTL scrollLeft runs from -max to 0. */
export function getScrollLeft(
  element: HTMLElement,
  direction = getComputedStyle(element).direction,
): number {
  return direction === 'rtl'
    ? element.scrollWidth - element.clientWidth + element.scrollLeft
    : element.scrollLeft;
}

export function setScrollLeft(element: HTMLElement, left: number): void {
  element.scrollLeft =
    getComputedStyle(element).direction === 'rtl'
      ? left - (element.scrollWidth - element.clientWidth)
      : left;
}
