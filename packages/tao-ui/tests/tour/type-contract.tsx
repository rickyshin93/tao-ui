import { Tour, type TourProps } from '../../src/components/tour/tour';

const props: TourProps = {
  steps: [
    {
      title: 'Step',
      target: () => document.body,
      type: 'primary',
      nextButtonProps: {
        children: 'Continue',
        onClick: (event) => event.currentTarget.focus(),
      },
      mask: { color: '#0008' },
      classNames: { title: 'title' },
    },
  ],
  actionsRender: (actions, info) => (
    <>
      {info.current}
      {actions}
    </>
  ),
  classNames: ({ props }) => ({ root: props.type }),
  styles: { mask: { opacity: 0.8 } },
};
<Tour {...props} />;
// @ts-expect-error Steps need a title.
<Tour steps={[{ description: 'Missing title' }]} />;
