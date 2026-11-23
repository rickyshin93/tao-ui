import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { Modal } from '../../src/components/modal/modal';

function RefContainer({ open }: { open: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={host} data-testid="host" />
      <Modal open={open} title="Scoped" getContainer={() => host.current!}>
        Body
      </Modal>
    </>
  );
}

test('Modal getContainer may return a ref that attaches on commit', () => {
  const view = render(<RefContainer open={false} />);
  view.rerender(<RefContainer open />);
  expect(screen.getByTestId('host')).toContainElement(
    screen.getByRole('dialog', { name: 'Scoped' }),
  );
});

test('an initially open Modal renders into a ref container', () => {
  render(<RefContainer open />);
  expect(screen.getByTestId('host')).toContainElement(
    screen.getByRole('dialog', { name: 'Scoped' }),
  );
});
