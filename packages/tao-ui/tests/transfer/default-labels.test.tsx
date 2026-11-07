import { expect, test } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import { Transfer } from '../../src/components/transfer/transfer';

test.each([false, true])(
  'Transfer displays titles and key fallbacks without render (oneWay=%s)',
  (oneWay) => {
    render(
      <Transfer
        dataSource={[
          { key: 'a', title: 'Alpha' },
          { key: 'b', title: 'Beta' },
          { key: 0 },
        ]}
        targetKeys={['b']}
        oneWay={oneWay}
      />,
    );
    const source = within(screen.getByRole('region', { name: 'Source' }));
    const target = within(screen.getByRole('region', { name: 'Target' }));
    expect(source.getByText('Alpha')).toBeInTheDocument();
    expect(source.getByText('0')).toBeInTheDocument();
    expect(target.getByText('Beta')).toBeInTheDocument();
  },
);

test('explicit Transfer render output retains priority, including null', () => {
  const dataSource = [{ key: 'a', title: 'Alpha' }];
  const view = render(
    <Transfer
      dataSource={dataSource}
      render={() => ({ label: <strong>Custom</strong>, value: 'Search text' })}
    />,
  );
  expect(screen.getByText('Custom').tagName).toBe('STRONG');
  expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  view.rerender(<Transfer dataSource={dataSource} render={() => null} />);
  expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
});
