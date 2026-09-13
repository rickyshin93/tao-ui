import { afterEach, expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type StepItem, Steps } from '../../src/components/steps/steps';
import { TaoProvider } from '../../src/provider/tao-provider';
import { restoreViewport, setViewportWidth } from '../utils/mock-viewport';

afterEach(() => {
  restoreViewport();
});

const items: StepItem[] = [
  { title: 'First', content: 'First content' },
  { title: 'Second', content: 'Second content' },
  { title: 'Third', content: 'Third content' },
];

function root(container: HTMLElement): HTMLElement {
  const node = container.querySelector<HTMLElement>('[data-tao-steps]');
  if (!node) throw new Error('Steps root not found');
  return node;
}

function statuses(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-tao-step]')).map((step) =>
    step.getAttribute('data-tao-status'),
  );
}

// ---- Rendering ----

test('renders every step title and content', () => {
  render(<Steps items={items} />);
  expect(screen.getByText('First')).toBeTruthy();
  expect(screen.getByText('Second content')).toBeTruthy();
  expect(screen.getByText('Third')).toBeTruthy();
});

test('numbers steps from 1', () => {
  const { container } = render(<Steps items={items} />);
  const numbers = Array.from(
    container.querySelectorAll('[data-tao-steps-icon-number]'),
  ).map((node) => node.textContent);
  expect(numbers).toEqual(['1', '2', '3']);
});

test('renders subtitles', () => {
  render(
    <Steps items={[{ title: 'A', subTitle: 'optional' }, { title: 'B' }]} />,
  );
  expect(screen.getByText('optional')).toBeTruthy();
});

// ---- Status derivation ----

test('derives finish / process / wait from current', () => {
  const { container } = render(<Steps items={items} current={1} />);
  expect(statuses(container)).toEqual(['finish', 'process', 'wait']);
});

test('applies the Steps status to the current step', () => {
  const { container } = render(
    <Steps items={items} current={1} status="error" />,
  );
  expect(statuses(container)).toEqual(['finish', 'error', 'wait']);
});

test('lets an explicit item status win over the derived one', () => {
  const { container } = render(
    <Steps
      items={[{ title: 'A' }, { title: 'B', status: 'error' }, { title: 'C' }]}
      current={0}
    />,
  );
  expect(statuses(container)).toEqual(['process', 'error', 'wait']);
});

test('marks the current step with aria-current', () => {
  const { container } = render(<Steps items={items} current={2} />);
  expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  expect(
    container
      .querySelector('[data-tao-step][data-tao-active]')
      ?.getAttribute('aria-current'),
  ).toBe('step');
});

test('renders a check glyph for finished steps and a number otherwise', () => {
  const { container } = render(<Steps items={items} current={1} />);
  const icons = container.querySelectorAll('[data-tao-step-icon]');

  expect(icons[0].querySelector('svg')).toBeTruthy();
  expect(icons[0].querySelector('[data-tao-steps-icon-number]')).toBeNull();

  expect(icons[2].querySelector('svg')).toBeNull();
  expect(
    icons[2].querySelector('[data-tao-steps-icon-number]')?.textContent,
  ).toBe('3');
});

test('renders an error glyph for failed steps', () => {
  const { container } = render(
    <Steps items={items} current={1} status="error" />,
  );
  expect(
    container
      .querySelectorAll('[data-tao-step-icon]')[1]
      .querySelector('svg'),
  ).toBeTruthy();
});

// ---- initial ----

test('initial offsets both numbering and status comparison', () => {
  const { container } = render(
    <Steps items={items} initial={2} current={2} />,
  );
  const numbers = Array.from(
    container.querySelectorAll('[data-tao-steps-icon-number]'),
  ).map((node) => node.textContent);

  expect(numbers).toEqual(['3', '4', '5']);
  expect(statuses(container)).toEqual(['process', 'wait', 'wait']);
});

// ---- Interaction ----

test('is not interactive without onChange', () => {
  render(<Steps items={items} />);
  expect(screen.queryAllByRole('button')).toHaveLength(0);
});

test('onChange reports the absolute index of the clicked step', () => {
  let next: number | undefined;
  render(
    <Steps
      items={items}
      current={0}
      onChange={(index) => {
        next = index;
      }}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /Second/ }));
  expect(next).toBe(1);
});

test('does not fire onChange for the already-current step', () => {
  let calls = 0;
  render(
    <Steps
      items={items}
      current={0}
      onChange={() => {
        calls += 1;
      }}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /First/ }));
  expect(calls).toBe(0);
});

test('onChange reports original indexes when maxCount collapses steps', () => {
  const many: StepItem[] = Array.from({ length: 8 }, (_, index) => ({
    title: `Step ${index + 1}`,
  }));
  let next: number | undefined;
  render(
    <Steps
      items={many}
      current={0}
      maxCount={5}
      onChange={(index) => {
        next = index;
      }}
    />,
  );

  // The last visible step is original index 7.
  fireEvent.click(screen.getByRole('button', { name: /Step 8/ }));
  expect(next).toBe(7);
});

test('disabled steps are not interactive', () => {
  let calls = 0;
  render(
    <Steps
      items={[{ title: 'A' }, { title: 'B', disabled: true }]}
      current={0}
      onChange={() => {
        calls += 1;
      }}
    />,
  );

  expect(screen.queryByRole('button', { name: /B/ })).toBeNull();
  fireEvent.click(screen.getByText('B'));
  expect(calls).toBe(0);
});

test('activates a step with Enter and Space', () => {
  const pressed: number[] = [];
  render(
    <Steps
      items={items}
      current={0}
      onChange={(index) => {
        pressed.push(index);
      }}
    />,
  );

  const second = screen.getByRole('button', { name: /Second/ });
  fireEvent.keyDown(second, { key: 'Enter' });
  fireEvent.keyDown(second, { key: ' ' });

  expect(pressed).toEqual([1, 1]);
});

test('item onClick runs alongside the Steps onChange', () => {
  const calls: string[] = [];
  render(
    <Steps
      items={[
        { title: 'A' },
        { title: 'B', onClick: () => calls.push('item') },
      ]}
      current={0}
      onChange={() => calls.push('steps')}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /B/ }));
  expect(calls).toEqual(['item', 'steps']);
});

// ---- Layout ----

test('vertical steps place the title beside the icon', () => {
  const { container } = render(<Steps items={items} orientation="vertical" />);
  expect(root(container).getAttribute('data-tao-orientation')).toBe('vertical');
  expect(root(container).getAttribute('data-tao-title-placement')).toBe(
    'horizontal',
  );
});

test('honours an explicit titlePlacement on horizontal steps', () => {
  const { container } = render(
    <Steps items={items} titlePlacement="vertical" />,
  );
  expect(root(container).getAttribute('data-tao-title-placement')).toBe(
    'vertical',
  );
});

test('dot steps place the title under the dot', () => {
  const { container } = render(<Steps items={items} type="dot" />);
  expect(root(container).getAttribute('data-tao-type')).toBe('dot');
  expect(root(container).getAttribute('data-tao-title-placement')).toBe(
    'vertical',
  );
});

test('collapses to vertical on a narrow viewport', async () => {
  setViewportWidth(400);
  const { container } = render(<Steps items={items} />);
  await waitFor(() =>
    expect(root(container).getAttribute('data-tao-orientation')).toBe(
      'vertical',
    ),
  );
});

test('responsive={false} keeps the horizontal layout on a narrow viewport', () => {
  setViewportWidth(400);
  const { container } = render(<Steps items={items} responsive={false} />);
  expect(root(container).getAttribute('data-tao-orientation')).toBe(
    'horizontal',
  );
});

test('the rail carries the status of the following step and is omitted last', () => {
  const { container } = render(<Steps items={items} current={1} />);
  const rails = container.querySelectorAll('[data-tao-step-rail]');

  expect(rails).toHaveLength(2);
  expect(rails[0].getAttribute('data-tao-status')).toBe('process');
  expect(rails[1].getAttribute('data-tao-status')).toBe('wait');
});

// ---- Types ----

test('navigation and panel types render their own structure', () => {
  const navigation = render(<Steps items={items} type="navigation" />);
  expect(root(navigation.container).getAttribute('data-tao-type')).toBe(
    'navigation',
  );
  navigation.unmount();

  const panel = render(<Steps items={items} type="panel" />);
  expect(root(panel.container).getAttribute('data-tao-type')).toBe('panel');
  // One notch per step; CSS hides the trailing one.
  expect(
    panel.container.querySelectorAll('[data-tao-steps-panel-arrow]'),
  ).toHaveLength(items.length);
});

test('inline type renders a dot layout and exposes its offset', () => {
  const { container } = render(
    <Steps items={items} type="inline" offset={2} />,
  );
  expect(root(container).getAttribute('data-tao-type')).toBe('inline');
  expect(root(container).style.getPropertyValue('--tao-steps-items-offset')).toBe(
    '2',
  );
});

// ---- Percent ----

test('renders a progress ring for the current step when percent is set', () => {
  render(<Steps items={items} current={1} percent={40} />);
  const bar = screen.getByRole('progressbar');
  expect(bar.getAttribute('aria-valuenow')).toBe('40');
  expect(
    screen.getAllByRole('progressbar'),
    'only the process step gets a ring',
  ).toHaveLength(1);
});

test('ignores percent for inline steps', () => {
  const { container } = render(
    <Steps items={items} current={1} percent={40} type="inline" />,
  );
  expect(container.querySelector('[data-tao-steps-progress]')).toBeNull();
  expect(root(container).hasAttribute('data-tao-with-progress')).toBe(false);
});

// ---- maxCount ----

test('maxCount collapses hidden ranges into an ellipsis step', () => {
  const many: StepItem[] = Array.from({ length: 7 }, (_, index) => ({
    title: `Step ${index + 1}`,
  }));

  // Same expectations as antd's maxCount test.
  const cases: Array<Array<number | null>> = [
    [0, 1, 2, null, 5, 6],
    [0, 1, 2, null, 5, 6],
    [0, 1, 2, 3, null, 6],
    [0, null, 2, 3, 4, null, 6],
    [0, null, 3, 4, 5, 6],
    [0, 1, null, 4, 5, 6],
    [0, 1, null, 4, 5, 6],
  ];

  cases.forEach((expected, current) => {
    const { container, unmount } = render(
      <Steps items={many} current={current} maxCount={5} />,
    );

    const rendered = Array.from(
      container.querySelectorAll('[data-tao-step]'),
    ).map((step) => {
      const title = step.querySelector(
        '[data-tao-step-title]',
      )?.textContent;
      if (title) return Number(title.replace('Step ', '')) - 1;
      expect(step.hasAttribute('data-tao-ellipsis')).toBe(true);
      return null;
    });

    expect(rendered, `current=${current}`).toEqual(expected);
    unmount();
  });
});

test('does not collapse when maxCount is below 3 or not exceeded', () => {
  const many: StepItem[] = Array.from({ length: 7 }, (_, index) => ({
    title: `Step ${index + 1}`,
  }));

  const tooSmall = render(<Steps items={many} maxCount={2} />);
  expect(tooSmall.container.querySelectorAll('[data-tao-step]')).toHaveLength(7);
  tooSmall.unmount();

  const notExceeded = render(<Steps items={many} maxCount={7} />);
  expect(
    notExceeded.container.querySelectorAll('[data-tao-step]'),
  ).toHaveLength(7);
  expect(
    notExceeded.container.querySelector('[data-tao-ellipsis]'),
  ).toBeNull();
});

// ---- Custom rendering ----

test('iconRender replaces the icon and receives step info', () => {
  const seen: Array<{ index: number; active: boolean }> = [];
  render(
    <Steps
      items={items}
      current={1}
      iconRender={(_node, info) => {
        seen.push({ index: info.index, active: info.active });
        return <span data-testid={`icon-${info.index}`} />;
      }}
    />,
  );

  expect(seen).toEqual([
    { index: 0, active: false },
    { index: 1, active: true },
    { index: 2, active: false },
  ]);
  expect(screen.getByTestId('icon-1')).toBeTruthy();
});

test('iconRender exposes the semantic icon component', () => {
  render(
    <Steps
      items={items}
      iconRender={(_node, { components: { Icon } }) => (
        <Icon>
          <span data-testid="inside-icon">*</span>
        </Icon>
      )}
    />,
  );

  const hosts = screen.getAllByTestId('inside-icon');
  expect(hosts).toHaveLength(items.length);
  expect(hosts[0].parentElement?.hasAttribute('data-tao-step-icon')).toBe(
    true,
  );
});

test('custom icons replace the generated glyph', () => {
  const { container } = render(
    <Steps
      items={[
        { title: 'A', icon: <span data-testid="custom-icon">*</span> },
        { title: 'B' },
      ]}
    />,
  );

  expect(screen.getByTestId('custom-icon')).toBeTruthy();
  expect(
    container.querySelectorAll('[data-tao-step][data-tao-custom]'),
  ).toHaveLength(1);
});

// ---- Semantic DOM ----

test('applies semantic classNames and styles to inner parts', () => {
  const { container } = render(
    <Steps
      items={items}
      className="custom-steps"
      classNames={{
        root: 'root-cls',
        item: 'item-cls',
        itemTitle: 'title-cls',
        itemRail: 'rail-cls',
      }}
      styles={{ root: { margin: '4px' }, itemTitle: { color: 'red' } }}
    />,
  );

  const node = root(container);
  expect(node.className).toContain('custom-steps');
  expect(node.className).toContain('root-cls');
  expect(node.style.margin).toBe('4px');

  expect(container.querySelectorAll('[data-tao-step].item-cls')).toHaveLength(3);
  expect(
    container.querySelector('[data-tao-step-title].title-cls'),
  ).toBeTruthy();
  expect(container.querySelector('[data-tao-step-rail].rail-cls')).toBeTruthy();

  const title = container.querySelector<HTMLElement>(
    '[data-tao-step-title].title-cls',
  );
  expect(title?.style.color).toBe('red');
});

test('per-item classNames and styles affect only that step', () => {
  const { container } = render(
    <Steps
      items={[
        {
          title: 'A',
          classNames: { item: 'per-item' },
          styles: { itemTitle: { opacity: '0.5' } },
        },
        { title: 'B' },
      ]}
    />,
  );

  const marked = container.querySelectorAll<HTMLElement>(
    '[data-tao-step].per-item',
  );
  expect(marked).toHaveLength(1);
  expect(
    marked[0].querySelector<HTMLElement>('[data-tao-step-title]')?.style
      .opacity,
  ).toBe('0.5');
  // The sibling keeps the base class list.
  expect(container.querySelectorAll('[data-tao-step]')).toHaveLength(2);
});

// ---- Provider ----

test('inherits size from TaoProvider and clamps large to medium', () => {
  const { container } = render(
    <TaoProvider size="large">
      <Steps items={items} />
    </TaoProvider>,
  );
  expect(root(container).getAttribute('data-tao-size')).toBe('medium');
});

test('a local size wins over the provider', () => {
  const { container } = render(
    <TaoProvider size="medium">
      <Steps items={items} size="small" />
    </TaoProvider>,
  );
  expect(root(container).getAttribute('data-tao-size')).toBe('small');
});

// ---- Accessibility ----

test('clickable steps are focusable buttons', () => {
  render(<Steps items={items} current={0} onChange={() => {}} />);
  const buttons = screen.getAllByRole('button');
  expect(buttons).toHaveLength(3);
  buttons.forEach((button) => {
    expect(button.getAttribute('tabindex')).toBe('0');
  });
});
