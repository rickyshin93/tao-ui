import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tour } from '../../src/components/tour/tour';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test.each([undefined, { block: 'start', behavior: 'smooth' }] as const)(
  'an uncontrolled open Tour scrolls an offscreen step target with options %j',
  async (scrollIntoViewOptions) => {
    const scroll = rstest.fn();
    let target: HTMLButtonElement | null = null;
    render(
      <>
        <button
          type="button"
          ref={(node) => {
            target = node;
            if (node) {
              node.getBoundingClientRect = () => new DOMRect(0, 9000, 80, 40);
              node.scrollIntoView = scroll;
            }
          }}
        >
          Offscreen target
        </button>
        <Tour
          defaultOpen
          scrollIntoViewOptions={scrollIntoViewOptions}
          steps={[{ title: 'Target', target: () => target }]}
        />
      </>,
    );

    expect(
      await screen.findByRole('dialog', { name: 'Target' }),
    ).toBeInTheDocument();
    expect(scroll).toHaveBeenCalled();
    if (scrollIntoViewOptions)
      expect(scroll).toHaveBeenCalledWith(scrollIntoViewOptions);
  },
);

test('renders accessible steps, moves next/previous and finishes', async () => {
  const onChange = rstest.fn();
  const onFinish = rstest.fn();
  const onClose = rstest.fn();
  render(
    <Tour
      defaultOpen
      steps={[
        { title: 'Welcome', description: 'First step' },
        { title: 'Review', description: 'Second step' },
      ]}
      onChange={onChange}
      onFinish={onFinish}
      onClose={onClose}
    />,
  );
  const dialog = await screen.findByRole('dialog', { name: 'Welcome' });
  expect(dialog).toHaveAccessibleDescription('First step');
  await waitFor(() => expect(dialog).toHaveFocus());
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(
    await screen.findByRole('dialog', { name: 'Review' }),
  ).toBeInTheDocument();
  expect(onChange).toHaveBeenLastCalledWith(1);
  fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(
    await screen.findByRole('dialog', { name: 'Welcome' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Done' }));
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledWith(1);
});

test('controlled current is not changed until the owner accepts it', async () => {
  const onChange = rstest.fn();
  const steps = [{ title: 'One' }, { title: 'Two' }];
  const { rerender } = render(
    <Tour open current={0} steps={steps} onChange={onChange} />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
  expect(onChange).toHaveBeenCalledWith(1);
  expect(screen.getByRole('dialog')).toHaveAccessibleName('One');
  rerender(<Tour open current={1} steps={steps} />);
  expect(
    await screen.findByRole('dialog', { name: 'Two' }),
  ).toBeInTheDocument();
});

test('step-level content, buttons, type and semantic overrides are merged', async () => {
  const onNext = rstest.fn();
  render(
    <Tour
      open
      type="primary"
      classNames={{ section: 'global-section', title: 'global-title' }}
      styles={{ description: { marginTop: 4 } }}
      indicatorsRender={(current, total) => `${current + 1} of ${total}`}
      actionsRender={(actions) => <div data-testid="actions">{actions}</div>}
      steps={[
        {
          title: 'Custom',
          description: 'Details',
          cover: <img alt="Cover" src="cover.png" />,
          classNames: { title: 'step-title' },
          nextButtonProps: { children: 'Continue', onClick: onNext },
        },
        { title: 'Finish' },
      ]}
    />,
  );
  const dialog = await screen.findByRole('dialog', { name: 'Custom' });
  expect(dialog).toHaveAttribute('data-type', 'primary');
  expect(screen.getByText('Custom')).toHaveClass('step-title');
  expect(screen.getByText('Details')).toHaveStyle({ marginTop: '4px' });
  expect(screen.getByText('1 of 2')).toBeInTheDocument();
  expect(screen.getByAltText('Cover')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('keyboard Escape, closable and localized portal theme work', async () => {
  const onClose = rstest.fn();
  const { rerender } = render(
    <TaoProvider locale={zhCN} theme={{ mode: 'dark' }}>
      <Tour open onClose={onClose} steps={[{ title: '中文向导' }]} />
    </TaoProvider>,
  );
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveAttribute('data-tao-theme', 'dark');
  expect(screen.getByRole('button', { name: zhCN.done })).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape', keyCode: 27 });
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(0));
  rerender(
    <Tour open closable={false} mask={false} steps={[{ title: 'No close' }]} />,
  );
  expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-modal');
  expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
});

test('modal steps contain Tab and Shift+Tab and restore the launch control', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<button type="button">Launch tour</button>);
  const launcher = screen.getByRole('button', { name: 'Launch tour' });
  launcher.focus();
  rerender(
    <>
      <button type="button">Launch tour</button>
      <Tour open steps={[{ title: 'Modal step' }]} />
    </>,
  );
  const dialog = await screen.findByRole('dialog', { name: 'Modal step' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  await waitFor(() => expect(dialog).toHaveFocus());
  await user.tab();
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();
  rerender(<button type="button">Launch tour</button>);
  await waitFor(() => expect(launcher).toHaveFocus());
});

test('interactive target steps stay nonmodal unless target interaction is disabled', async () => {
  const steps = [
    {
      title: 'Target step',
      target: () => document.getElementById('tour-target')!,
    },
  ];
  const { rerender } = render(
    <>
      <button type="button" id="tour-target">
        Target action
      </button>
      <Tour open steps={steps} />
    </>,
  );
  expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-modal');
  const target = screen.getByRole('button', { name: 'Target action' });
  target.focus();
  expect(target).toHaveFocus();
  rerender(
    <>
      <button type="button" id="tour-target">
        Target action
      </button>
      <Tour open disabledInteraction steps={steps} />
    </>,
  );
  expect(await screen.findByRole('dialog')).toHaveAttribute(
    'aria-modal',
    'true',
  );
});

test('a masked step is modal while its target getter has no element', async () => {
  const steps = [
    {
      title: 'Conditional target',
      target: () => document.getElementById('conditional-tour-target')!,
    },
  ];
  const view = (showTarget: boolean) => (
    <>
      {showTarget && (
        <button type="button" id="conditional-tour-target">
          Target action
        </button>
      )}
      <Tour open steps={steps} />
    </>
  );
  const { rerender } = render(view(false));
  expect(await screen.findByRole('dialog')).toHaveAttribute(
    'aria-modal',
    'true',
  );

  rerender(view(true));
  await waitFor(() =>
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal'),
  );
  rerender(view(false));
  await waitFor(() =>
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true'),
  );
});

test('step callbacks run alongside tour navigation and completion', async () => {
  const onNext = rstest.fn();
  const onPrev = rstest.fn();
  const onStepFinish = rstest.fn();
  const onFinish = rstest.fn();
  render(
    <Tour
      defaultOpen
      onFinish={onFinish}
      steps={[
        { title: 'First', onNext },
        { title: 'Second', onPrev, onFinish: onStepFinish },
      ]}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Previous' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Done' }));
  expect(onNext).toHaveBeenCalledTimes(2);
  expect(onPrev).toHaveBeenCalledTimes(1);
  expect(onStepFinish).toHaveBeenCalledTimes(1);
  expect(onFinish).toHaveBeenCalledTimes(1);
});

test('a step close callback does not replace tour dismissal', async () => {
  const onStepClose = rstest.fn();
  const onClose = rstest.fn();
  render(
    <Tour
      defaultOpen
      onClose={onClose}
      steps={[{ title: 'Intro', onClose: onStepClose }]}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
  expect(onStepClose).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledWith(0);
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
});

test('preventDefault in a custom tour action keeps the current step', async () => {
  const onChange = rstest.fn();
  render(
    <Tour
      defaultOpen
      onChange={onChange}
      steps={[
        {
          title: 'First',
          nextButtonProps: { onClick: (event) => event.preventDefault() },
        },
        { title: 'Second' },
      ]}
    />,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'First' })).toBeInTheDocument();
});
