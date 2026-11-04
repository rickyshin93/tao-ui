import {
  Image,
  type ImageProps,
  type PreviewGroupProps,
} from '../../src/components/image/image';

const props: ImageProps = {
  src: 'photo.png',
  preview: {
    onTransform: ({ action, transform }) => {
      const scale: number = transform.scale;
      const name: string = action;
      void scale;
      void name;
    },
    actionsRender: (node, info) => {
      info.actions.onReset();
      return node;
    },
    mask: { blur: true, closable: false },
  },
  placeholder: {
    progress: {
      percent: 50,
      render: (node, percent) => (
        <>
          {node}
          {percent}
        </>
      ),
    },
  },
};
<Image
  {...props}
  classNames={({ props }) => ({
    root: props.alt,
    popup: { actions: 'actions' },
  })}
/>;
const group: PreviewGroupProps = {
  items: [{ src: 'photo.png', alt: 'Photo' }],
  preview: {
    onOpenChange: (_open, info) => {
      const current: number = info.current;
      void current;
    },
    current: 1,
    actionsRender: (node, info) => {
      const count: number = info.total;
      void count;
      return node;
    },
  },
};
<Image.PreviewGroup {...group} />;
// @ts-expect-error Preview state uses a boolean.
<Image preview={{ open: 'yes' }} />;
