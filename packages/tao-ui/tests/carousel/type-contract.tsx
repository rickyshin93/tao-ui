import { createRef } from 'react';
import {
  Carousel,
  type CarouselProps,
  type CarouselRef,
} from '../../src/components/carousel/carousel';

const ref = createRef<CarouselRef>();
const props: CarouselProps = {
  dotPlacement: 'end',
  autoplay: { dotDuration: true },
  responsive: [{ breakpoint: 480, settings: { slidesToShow: 1 } }],
  afterChange: (current) => {
    const index: number = current;
    void index;
  },
};
<Carousel {...props} ref={ref}>
  <div>Slide</div>
</Carousel>;
ref.current?.goTo(2, true);
ref.current?.next();
ref.current?.prev();
ref.current?.autoPlay('update');
// @ts-expect-error Dot placement uses logical start/end.
<Carousel dotPlacement="left" />;
