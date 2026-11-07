import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { Modal, type ModalProps } from '../../src/components/modal/modal';

test.each([false, true])(
  'declarative Modal preserves footer focus and identity across updates (custom=%s)',
  (custom) => {
    const footer: ModalProps['footer'] = custom
      ? (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )
      : undefined;
    const firstAction = rs.fn();
    const nextAction = rs.fn();
    const view = render(
      <Modal open title="Save" footer={footer} onOk={firstAction}>
        Before
      </Modal>,
    );
    const ok = screen.getByRole('button', { name: 'OK', exact: true });
    const cancel = screen.getByRole('button', { name: 'Cancel', exact: true });
    act(() => ok.focus());
    view.rerender(
      <Modal open title="Save" footer={footer} okText="Retry" onOk={nextAction}>
        After
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBe(ok);
    expect(screen.getByRole('button', { name: 'Cancel', exact: true })).toBe(
      cancel,
    );
    expect(ok).toHaveFocus();
    fireEvent.click(ok);
    expect(firstAction).not.toHaveBeenCalled();
    expect(nextAction).toHaveBeenCalledTimes(1);
  },
);

test.each(['OK', 'Cancel'] as const)(
  'declarative %s composes custom click with its action',
  (name) => {
    const events: string[] = [];
    const props =
      name === 'OK'
        ? {
            onOk: () => events.push('action'),
            okButtonProps: { onClick: () => events.push('click') },
          }
        : {
            onClose: () => events.push('action'),
            cancelButtonProps: { onClick: () => events.push('click') },
          };
    render(<Modal open title="Save" {...props} />);
    fireEvent.click(screen.getByRole('button', { name, exact: true }));
    expect(events).toEqual(['click', 'action']);
  },
);

test.each(['OK', 'Cancel'] as const)(
  'declarative %s respects custom preventDefault',
  (name) => {
    const action = rs.fn();
    const onClick = (event: MouseEvent<HTMLButtonElement>) =>
      event.preventDefault();
    const props =
      name === 'OK'
        ? { onOk: action, okButtonProps: { onClick } }
        : { onClose: action, cancelButtonProps: { onClick } };
    render(<Modal open title="Save" {...props} />);
    fireEvent.click(screen.getByRole('button', { name, exact: true }));
    expect(action).not.toHaveBeenCalled();
  },
);

test('confirmLoading cannot be disabled by okButtonProps.loading=false', () => {
  const onOk = rs.fn();
  render(
    <Modal
      open
      title="Save"
      confirmLoading
      okButtonProps={{ loading: false }}
      onOk={onOk}
    />,
  );
  const ok = screen.getByRole('button', { name: 'OK', exact: true });
  expect(ok).toBeDisabled();
  expect(ok).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(ok);
  expect(onOk).not.toHaveBeenCalled();
});
