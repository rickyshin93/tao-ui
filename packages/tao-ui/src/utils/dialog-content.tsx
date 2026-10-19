import * as Dialog from '@radix-ui/react-dialog';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  memo,
  type Ref,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from 'react';

type ContentProps = ComponentPropsWithoutRef<typeof Dialog.Content>;
type HostProps = ComponentPropsWithoutRef<'div'>;

interface DialogContentProps extends ContentProps {
  open: boolean;
  keepAlive: boolean;
  contentRef?: Ref<HTMLDivElement>;
}

export function DialogContent({
  open,
  keepAlive,
  contentRef,
  ...props
}: DialogContentProps) {
  return keepAlive ? (
    <KeptDialogContent
      open={open}
      contentRef={contentRef}
      contentProps={props}
    />
  ) : (
    <Dialog.Content {...props} ref={contentRef} />
  );
}

function KeptDialogContent({
  open,
  contentRef,
  contentProps,
}: {
  open: boolean;
  contentRef?: Ref<HTMLDivElement>;
  contentProps: ContentProps;
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [layerProps, setLayerProps] = useState<HostProps>({});
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    contentRef,
    () => node,
    [node],
  );

  // These props configure Radix effects, not the retained DOM element.
  const {
    children,
    forceMount: _forceMount,
    asChild: _asChild,
    onOpenAutoFocus: _onOpenAutoFocus,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown: _onEscapeKeyDown,
    onPointerDownOutside: _onPointerDownOutside,
    onFocusOutside: _onFocusOutside,
    onInteractOutside: _onInteractOutside,
    ...hostProps
  } = contentProps;

  return (
    <>
      {open && node && (
        <ModalLayer
          node={node}
          contentProps={contentProps}
          onPropsChange={setLayerProps}
        />
      )}
      <div
        role="dialog"
        id={layerProps.id}
        aria-labelledby={layerProps['aria-labelledby']}
        aria-describedby={layerProps['aria-describedby']}
        {...hostProps}
        {...(open ? layerProps : undefined)}
        ref={setNode}
        data-state={open ? 'open' : 'closed'}
        style={{
          ...hostProps.style,
          ...(open ? layerProps.style : { display: 'none' }),
        }}
      >
        {children}
      </div>
    </>
  );
}

// Keep Radix's effects and generated DOM handlers together. Applying those handlers
// to the retained host preserves React keyboard/focus bubbling without a child portal.
// Memo keeps applying generated props from triggering another layer render.
const ModalLayer = memo(function ModalLayer({
  node,
  contentProps,
  onPropsChange,
}: {
  node: HTMLDivElement;
  contentProps: ContentProps;
  onPropsChange: (props: HostProps) => void;
}) {
  return (
    <Dialog.Content {...contentProps} asChild>
      <HostBridge node={node} onPropsChange={onPropsChange} />
    </Dialog.Content>
  );
});

const HostBridge = forwardRef<
  HTMLDivElement,
  HostProps & {
    node: HTMLDivElement;
    onPropsChange: (props: HostProps) => void;
  }
>(function HostBridge({ node, onPropsChange, ...props }, ref) {
  useImperativeHandle(ref, () => node, [node]);
  useLayoutEffect(() => {
    onPropsChange(props);
  });
  return null;
});
