import { beforeAll, expect, rs, test } from '@rstest/core';
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

test('a false separator omits decorative layout items', () => {
  const { container } = render(
    <Breadcrumb
      separator={false}
      items={[{ title: 'Home', href: '/' }, { title: 'Data' }]}
    />,
  );

  expect(container.querySelector('[data-tao-breadcrumb-separator]')).toBeNull();
  expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
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

test('a fragment itemRender keeps the original breadcrumb link', () => {
  render(
    <Breadcrumb
      items={[{ title: 'Home', href: '/' }, { title: 'Data' }]}
      itemRender={(item) => (
        <>
          <span aria-hidden="true">→</span>
          <strong>{item.title}</strong>
        </>
      )}
    />,
  );

  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
    'href',
    '/',
  );
  expect(
    screen.getByText('Data').closest('[aria-current="page"]'),
  ).not.toBeNull();
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

test('disabled links cannot be reached or activated by keyboard', async () => {
  render(
    <Breadcrumb
      items={[
        { title: 'Archived', href: '#archived', disabled: true },
        { title: 'Available', href: '#available' },
        { title: 'Current' },
      ]}
    />,
  );
  expect(screen.getByText('Archived')).not.toHaveAttribute('href');
  await userEvent.tab();
  expect(screen.getByRole('link', { name: 'Available' })).toHaveFocus();
});

test('Enter activates the link inside a collapsed breadcrumb', async () => {
  const selected = rs.fn((event: React.MouseEvent) => event.preventDefault());
  render(
    <Breadcrumb
      maxItems={2}
      items={[
        { title: 'Home', href: '/' },
        { title: 'Settings', href: '/settings', onClick: selected },
        { title: 'Current' },
      ]}
    />,
  );
  const user = userEvent.setup();
  screen.getByRole('button', { name: 'Show more' }).focus();
  await user.keyboard('{Enter}');
  const item = await screen.findByRole('menuitem', { name: 'Settings' });
  item.focus();
  await user.keyboard('{Enter}');
  expect(selected).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('itemRender uses the original path index for entries after the ellipsis', () => {
  const items = ['Home', 'Account', 'Settings', 'Current'].map((title) => ({
    title,
  }));
  render(
    <Breadcrumb
      maxItems={2}
      items={items}
      itemRender={(item, { index }) => `${index} ${item.title}`}
    />,
  );
  expect(screen.getByText('3 Current')).toBeVisible();
});
