import { beforeAll, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Breadcrumb } from '../../src/components/breadcrumb/breadcrumb';

// Radix dropdown (used by the collapsed ellipsis) needs a few jsdom polyfills.
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
});

test('renders all item titles', () => {
  render(
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        { title: 'Library', href: '/lib' },
        { title: 'Data' },
      ]}
    />,
  );
  expect(screen.getByText('Home')).toBeTruthy();
  expect(screen.getByText('Library')).toBeTruthy();
  expect(screen.getByText('Data')).toBeTruthy();
});

test('last item renders as current page, not a link', () => {
  const { container } = render(
    <Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'Current' }]} />,
  );
  const page = container.querySelector(
    '[data-tao-breadcrumb-page]',
  ) as HTMLElement;
  expect(page).toBeTruthy();
  expect(page.getAttribute('aria-current')).toBe('page');
  expect(page.textContent).toBe('Current');
  // last item must not be an anchor
  expect(container.querySelectorAll('a').length).toBe(1);
});

test('href items render as anchors', () => {
  const { container } = render(
    <Breadcrumb items={[{ title: 'Home', href: '/home' }, { title: 'Now' }]} />,
  );
  const link = container.querySelector('a') as HTMLAnchorElement;
  expect(link.getAttribute('href')).toBe('/home');
  expect(link.dataset.taoBreadcrumbLink).toBe('');
});

test('renders a separator between each item but not after the last', () => {
  const { container } = render(
    <Breadcrumb
      items={[
        { title: 'A', href: '/a' },
        { title: 'B', href: '/b' },
        { title: 'C' },
      ]}
    />,
  );
  expect(
    container.querySelectorAll('[data-tao-breadcrumb-separator]').length,
  ).toBe(2);
});

test('onClick fires for interactive items', () => {
  let clicked = false;
  render(
    <Breadcrumb
      items={[
        {
          title: 'Click',
          onClick: () => {
            clicked = true;
          },
        },
        { title: 'End' },
      ]}
    />,
  );
  fireEvent.click(screen.getByText('Click'));
  expect(clicked).toBe(true);
});

test('disabled item does not fire onClick', () => {
  let clicked = false;
  render(
    <Breadcrumb
      items={[
        {
          title: 'Nope',
          disabled: true,
          onClick: () => {
            clicked = true;
          },
        },
        { title: 'End' },
      ]}
    />,
  );
  fireEvent.click(screen.getByText('Nope'));
  expect(clicked).toBe(false);
});

test('maxItems collapses the middle into an ellipsis', () => {
  const { container } = render(
    <Breadcrumb
      maxItems={3}
      items={[
        { title: 'A', href: '/a' },
        { title: 'B', href: '/b' },
        { title: 'C', href: '/c' },
        { title: 'D', href: '/d' },
        { title: 'E' },
      ]}
    />,
  );
  expect(
    container.querySelector('[data-tao-breadcrumb-ellipsis]'),
  ).toBeTruthy();
  // first + ellipsis + last 2 = A and E visible, B/C/D hidden
  expect(screen.getByText('A')).toBeTruthy();
  expect(screen.getByText('E')).toBeTruthy();
  expect(screen.queryByText('C')).toBeNull();
});

test('clicking the ellipsis reveals the collapsed items in a dropdown', async () => {
  render(
    <Breadcrumb
      maxItems={3}
      items={[
        { title: 'A', href: '/a' },
        { title: 'B', href: '/b' },
        { title: 'C', href: '/c' },
        { title: 'D', href: '/d' },
        { title: 'E' },
      ]}
    />,
  );
  // collapsed: B/C/D hidden until the ellipsis is opened
  expect(screen.queryByText('C')).toBeNull();
  await userEvent.click(screen.getByLabelText('Show more'));
  expect(await screen.findByText('B')).toBeTruthy();
  expect(screen.getByText('C')).toBeTruthy();
  expect(screen.getByText('D')).toBeTruthy();
});

test('custom separator is used', () => {
  const { container } = render(
    <Breadcrumb
      separator="/"
      items={[{ title: 'A', href: '/a' }, { title: 'B' }]}
    />,
  );
  const sep = container.querySelector(
    '[data-tao-breadcrumb-separator]',
  ) as HTMLElement;
  expect(sep.textContent).toBe('/');
});

test('itemRender custom element receives breadcrumb link props via Slot', () => {
  const { container } = render(
    <Breadcrumb
      items={[{ title: 'Home', key: 'home' }, { title: 'End' }]}
      itemRender={(item, { isLast }) =>
        isLast ? item.title : <button type="button">{item.title}</button>
      }
    />,
  );
  const btn = container.querySelector('button') as HTMLButtonElement;
  expect(btn).toBeTruthy();
  expect(btn.dataset.taoBreadcrumbLink).toBe('');
});

test('nav has accessible label', () => {
  render(<Breadcrumb items={[{ title: 'Only' }]} />);
  expect(screen.getByLabelText('breadcrumb')).toBeTruthy();
});
