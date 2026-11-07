import { expect, rstest, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { TimePanel } from '../../src/components/date-picker/calendar/time-panel';

test('centering selected time values scrolls only their columns', () => {
  const ancestorScroll = rstest.spyOn(HTMLElement.prototype, 'scrollIntoView');
  const columnScroll = rstest.spyOn(HTMLElement.prototype, 'scrollTo');
  try {
    const { rerender } = render(
      <TimePanel hour={9} minute={15} second={0} onChange={() => {}} />,
    );
    rerender(
      <TimePanel hour={18} minute={30} second={0} onChange={() => {}} />,
    );
    expect(ancestorScroll).not.toHaveBeenCalled();
    expect(columnScroll).toHaveBeenCalled();
    expect(
      columnScroll.mock.contexts.every((element) =>
        element.hasAttribute('data-tao-time-column-list'),
      ),
    ).toBe(true);
  } finally {
    ancestorScroll.mockRestore();
    columnScroll.mockRestore();
  }
});
