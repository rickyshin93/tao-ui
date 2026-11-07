import { afterEach, expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import {
  Carousel,
  type CarouselRef,
} from '../../src/components/carousel/carousel';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';
import { restoreViewport, setViewportWidth } from '../utils/mock-viewport';

afterEach(restoreViewport);

const slides = [
  <div key="a">First</div>,
  <div key="b">Second</div>,
  <div key="c">Third</div>,
];

test('RTL initialSlide uses the responsive group size on mount', async () => {
  setViewportWidth(390);
  const { container } = render(
    <Carousel
      rtl
      speed={0}
      initialSlide={0}
      responsive={[{ breakpoint: 480, settings: { rows: 2 } }]}
    >
      {[...slides, <div key="d">Fourth</div>, <div key="e">Fifth</div>]}
    </Carousel>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  expect(container.querySelector('.slick-current')).toHaveTextContent(
    'FirstSecond',
  );
});

test.each([390, 480, 481])(
  'applies responsive settings on initial mount at %ipx',
  async (width) => {
    setViewportWidth(width);
    const { container } = render(
      <Carousel
        slidesToShow={2}
        responsive={[{ breakpoint: 480, settings: { slidesToShow: 1 } }]}
      >
        {slides}
      </Carousel>,
    );
    await waitFor(() =>
      expect(
        container.querySelectorAll('.slick-active[data-index]'),
      ).toHaveLength(width <= 480 ? 1 : 2),
    );
  },
);

test('updates responsive settings and restores the slider after unslick', async () => {
  setViewportWidth(390);
  const ref = createRef<CarouselRef>();
  const { container, rerender } = render(
    <Carousel ref={ref} responsive={[{ breakpoint: 480, settings: 'unslick' }]}>
      {slides}
    </Carousel>,
  );
  await waitFor(() =>
    expect(container.querySelector('.slick-slider')).toBeNull(),
  );
  expect(screen.getByText('First')).toBeVisible();
  expect(ref.current?.nativeElement).toBe(container.firstChild);
  expect(() => {
    ref.current?.goTo(1);
    ref.current?.next();
    ref.current?.prev();
    ref.current?.autoPlay('update');
  }).not.toThrow();
  expect(ref.current?.innerSlider).toBeUndefined();
  rerender(
    <Carousel ref={ref} speed={0}>
      {slides}
    </Carousel>,
  );
  await waitFor(() =>
    expect(container.querySelector('.slick-current')).not.toBeNull(),
  );
  act(() => ref.current!.next());
  await waitFor(() =>
    expect(container.querySelector('.slick-current')).toHaveAttribute(
      'data-index',
      '1',
    ),
  );
});
test('renders dots and native refs, then navigates with arrows and imperative methods', async () => {
  const ref = createRef<CarouselRef>();
  const afterChange = rstest.fn();
  const { container } = render(
    <Carousel ref={ref} arrows speed={0} afterChange={afterChange}>
      {slides}
    </Carousel>,
  );
  expect(ref.current?.nativeElement).toBe(container.firstChild);
  expect(ref.current?.innerSlider).toBeDefined();
  expect(container.querySelectorAll('.slick-cloned')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(afterChange).toHaveBeenCalledWith(1));
  act(() => ref.current!.goTo(2, true));
  await waitFor(() =>
    expect(container.querySelector('.slick-current')).toHaveAttribute(
      'data-index',
      '2',
    ),
  );
  act(() => ref.current!.prev());
  await waitFor(() =>
    expect(container.querySelector('.slick-current')).toHaveAttribute(
      'data-index',
      '1',
    ),
  );
  expect(container.querySelectorAll('.slick-dots li')).toHaveLength(3);
});

test('side dots enable vertical navigation, aliases and semantic styles work', () => {
  const { container } = render(
    <Carousel
      dotPosition="left"
      className="consumer"
      classNames={{ root: 'root', dots: 'dots' }}
      styles={{ root: { maxWidth: 320 }, dots: { gap: 10 } }}
    >
      {slides}
    </Carousel>,
  );
  expect(container.firstChild).toHaveAttribute('data-vertical', 'true');
  expect(container.firstChild).toHaveAttribute('data-dot-placement', 'start');
  expect(container.firstChild).toHaveClass('consumer', 'root');
  expect(container.querySelector('.dots')).toHaveStyle({ gap: '10px' });
});

test('fade, explicit vertical override, dot duration and hidden dots are honored', () => {
  const { container, rerender } = render(
    <Carousel
      effect="fade"
      dotPlacement="end"
      vertical={false}
      autoplay={{ dotDuration: true }}
      autoplaySpeed={5000}
    >
      {slides}
    </Carousel>,
  );
  expect(container.firstChild).not.toHaveAttribute('data-vertical');
  expect(container.firstChild).toHaveAttribute('data-dot-duration', 'true');
  expect(container.querySelector('.slick-slide')).toHaveStyle({
    position: 'relative',
  });
  rerender(<Carousel dots={false}>{slides}</Carousel>);
  expect(container.querySelector('.slick-dots')).toBeNull();
});

test('localized arrows and custom paging are rendered', () => {
  render(
    <TaoProvider locale={zhCN}>
      <Carousel
        arrows
        customPaging={(index) => (
          <button type="button">Page {index + 1}</button>
        )}
      >
        {slides}
      </Carousel>
    </TaoProvider>,
  );
  expect(
    screen.getByRole('button', { name: zhCN.previous }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
});

test('slickGoTo changes the current slide', async () => {
  const { container, rerender } = render(
    <Carousel speed={0} slickGoTo={0}>
      {slides}
    </Carousel>,
  );
  rerender(
    <Carousel speed={0} slickGoTo={2}>
      {slides}
    </Carousel>,
  );
  await waitFor(() =>
    expect(container.querySelector('.slick-current')).toHaveAttribute(
      'data-index',
      '2',
    ),
  );
});

test('appending slides keeps the current position instead of restoring initialSlide', async () => {
  const ref = createRef<CarouselRef>();
  const view = render(
    <Carousel ref={ref} speed={0}>
      {slides}
    </Carousel>,
  );
  act(() => ref.current?.goTo(2, true));
  await waitFor(() =>
    expect(view.container.querySelector('.slick-current')).toHaveTextContent(
      'Third',
    ),
  );
  view.rerender(
    <Carousel ref={ref} speed={0}>
      {[...slides, <div key="d">Fourth</div>]}
    </Carousel>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  expect(view.container.querySelector('.slick-current')).toHaveTextContent(
    'Third',
  );
});

test('honors a requested slide when asynchronous children first arrive', async () => {
  const view = render(<Carousel speed={0} slickGoTo={2} />);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  view.rerender(
    <Carousel speed={0} slickGoTo={2}>
      {slides}
    </Carousel>,
  );
  await waitFor(() =>
    expect(view.container.querySelector('.slick-current')).toHaveTextContent(
      'Third',
    ),
  );
});

test('conditional placeholders do not change the starting slide in RTL', async () => {
  const { container } = render(
    <Carousel rtl speed={0}>
      {null}
      {slides}
      {false}
    </Carousel>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  expect(container.querySelector('.slick-current')).toHaveTextContent('First');
});

test('RTL initialSlide indexes grouped slides rather than the raw records', async () => {
  const { container } = render(
    <Carousel rtl speed={0} rows={2} initialSlide={0}>
      {[...slides, <div key="d">Fourth</div>, <div key="e">Fifth</div>]}
    </Carousel>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  expect(container.querySelector('.slick-current')).toHaveTextContent('FirstSecond');
});

test('default dots navigate without submitting an enclosing form', async () => {
  const onSubmit = rstest.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const { container } = render(<form onSubmit={onSubmit}><Carousel speed={0}>{slides}</Carousel></form>);
  const dot = screen.getByRole('button', { name: '2' });
  expect(dot).toHaveAttribute('type', 'button');
  await userEvent.click(dot);
  expect(onSubmit).not.toHaveBeenCalled();
  await waitFor(() => expect(container.querySelector('.slick-current')).toHaveTextContent('Second'));
});

test('finite carousel arrows expose their disabled navigation boundaries', async () => {
  const { container } = render(
    <Carousel arrows infinite={false} speed={0}>
      {slides}
    </Carousel>,
  );
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  await waitFor(() => {
    expect(container.querySelector('.slick-current')).toHaveTextContent('Third');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });
});

test('inactive carousel slides and their clones are inert until visible', async () => {
  const { container } = render(
    <Carousel speed={0}>
      <div><button type="button">First action</button></div>
      <div><button type="button">Second action</button></div>
    </Carousel>,
  );
  const expectSlideInertness = () => {
    const inactive = container.querySelectorAll('.slick-slide[aria-hidden="true"]');
    const active = container.querySelectorAll('.slick-slide[aria-hidden="false"]');
    expect(inactive.length).toBeGreaterThan(0);
    expect(active.length).toBeGreaterThan(0);
    for (const slide of inactive) expect(slide).toHaveAttribute('inert');
    for (const slide of active) expect(slide).not.toHaveAttribute('inert');
  };
  expectSlideInertness();
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  await waitFor(() => {
    expect(container.querySelector('.slick-current')).toHaveTextContent('Second action');
    expectSlideInertness();
  });
});
