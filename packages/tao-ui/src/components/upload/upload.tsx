import RcUploader, {
  type RcFile as BaseRcFile,
  type UploadProps as RcUploadProps,
} from '@rc-component/upload';
import {
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';
import { Progress } from '../progress/progress';
import type {
  DraggerProps,
  RcFile,
  ShowUploadListInterface,
  UploadFile,
  UploadProps,
  UploadRef,
} from './upload-types';
import './upload.css';
import { interopDefault } from '../../utils/interop-default';

const RcUploaderComponent = /*#__PURE__*/ interopDefault(RcUploader);

export type * from './upload-types';

const LIST_IGNORE = '__TAO_UPLOAD_LIST_IGNORE__';
type UploadPreparation = {
  action?: string;
  data?: Record<string, unknown>;
  error?: Error;
};

function asError(reason: unknown) {
  return reason instanceof Error ? reason : new Error(String(reason));
}

function toFile(file: BaseRcFile): UploadFile {
  return {
    uid: file.uid,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    originFileObj: file as RcFile,
    percent: 0,
  };
}
function readPreview(file: File | Blob, failureMessage: string) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error(failureMessage));
    reader.readAsDataURL(file);
  });
}
function sameUploadFile(file: UploadFile, candidate?: UploadFile) {
  if (!candidate) return false;
  if (file.originFileObj || candidate.originFileObj) {
    return file.originFileObj === candidate.originFileObj;
  }
  return file.name === candidate.name && file.url === candidate.url;
}

function FilePreview({
  file,
  previewFile,
}: {
  file: UploadFile;
  previewFile?: UploadProps['previewFile'];
}) {
  const { locale } = useTaoConfig();
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    setPreview(undefined);
    setError(undefined);
    if (file.thumbUrl || file.url || !file.originFileObj) return;
    let active = true;
    const load = async (source: File) =>
      previewFile
        ? previewFile(source)
        : readPreview(source, locale.messages.readFileError);
    load(file.originFileObj).then(
      (value) => {
        if (active) setPreview(value);
      },
      (reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : locale.messages.previewUnavailable,
          );
      },
    );
    return () => {
      active = false;
    };
  }, [
    file.originFileObj,
    file.thumbUrl,
    file.url,
    previewFile,
    locale.messages.readFileError,
    locale.messages.previewUnavailable,
  ]);
  const src = file.thumbUrl ?? file.url ?? preview;
  return error ? (
    <span role="status">{error}</span>
  ) : src ? (
    <img src={src} alt={file.name} crossOrigin={file.crossOrigin} />
  ) : (
    <span aria-hidden="true">▧</span>
  );
}
function FileIcon({ remove = false }: { remove?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {remove ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M10 12h5M10 16h5" />
      )}
    </svg>
  );
}
const UploadRoot = forwardRef<UploadRef, UploadProps>((props, ref) => {
  const config = useTaoConfig();
  const [localFiles, setFiles] = useState(props.defaultFileList ?? []);
  const files = 'fileList' in props ? (props.fileList ?? []) : localFiles;
  const filesRef = useRef(files);
  filesRef.current = files;
  const propsRef = useRef(props);
  propsRef.current = props;
  const root = useRef<HTMLSpanElement>(null),
    uploader = useRef<RcUploader>(null);
  const ignored = useRef(new Set<string>());
  const preparations = useRef(new WeakMap<object, UploadPreparation>());
  const requestOrigins = useRef(new WeakMap<object, BaseRcFile>());
  const settledRequests = useRef(new WeakSet<object>());
  const pendingRemovals = useRef(new Map<string, UploadFile>());
  const [dragging, setDragging] = useState(false),
    [removeError, setRemoveError] = useState<string>();
  const [previewFile, setPreviewFile] = useState<UploadFile>();
  const disabled = props.disabled ?? config.disabled;
  if (disabled && dragging) setDragging(false);
  const listType = props.listType ?? 'text',
    type = props.type ?? 'select';
  const names =
    typeof props.classNames === 'function'
      ? props.classNames({ props: { ...props, listType, type, disabled } })
      : props.classNames;
  const styles =
    typeof props.styles === 'function'
      ? props.styles({ props: { ...props, listType, type, disabled } })
      : props.styles;
  const locale = {
    removeFile: config.locale.messages.removeFile,
    previewFile: config.locale.messages.previewFile,
    downloadFile: config.locale.messages.downloadFile,
    uploadError: config.locale.messages.uploadError,
    ...props.locale,
  };
  const current = () =>
    'fileList' in propsRef.current
      ? (propsRef.current.fileList ?? [])
      : filesRef.current;
  const emit = (
    file: UploadFile,
    next: UploadFile[],
    event?: { percent: number },
  ) => {
    if (!root.current) return;
    const max = propsRef.current.maxCount;
    const limited =
      max === 1 ? next.slice(-1) : max ? next.slice(0, max) : next;
    flushSync(() => {
      if (!('fileList' in propsRef.current)) {
        filesRef.current = limited;
        setFiles(limited);
      }
      if (
        file.status === 'removed' ||
        limited.some((item) => item.uid === file.uid)
      )
        propsRef.current.onChange?.({
          file,
          fileList: [...limited],
          ...(event ? { event } : {}),
        });
    });
  };
  const update = (
    file: BaseRcFile,
    patch: Partial<UploadFile>,
    event?: { percent: number },
  ) => {
    if (settledRequests.current.has(file)) return;
    const items = current(),
      found = items.find((item) => item.uid === file.uid);
    if (!found) return;
    const origin = requestOrigins.current.get(file);
    if (origin && found.originFileObj && found.originFileObj !== origin) {
      return;
    }
    if (patch.status === 'done' || patch.status === 'error')
      settledRequests.current.add(file);
    const changed = { ...found, ...patch };
    emit(
      changed,
      items.map((item) => (item.uid === file.uid ? changed : item)),
      event,
    );
  };
  const onSuccess = (
    response: unknown,
    file: BaseRcFile,
    xhr?: XMLHttpRequest,
  ) => update(file, { status: 'done', percent: 100, response, xhr });
  const onProgress = (event: { percent: number }, file: BaseRcFile) =>
    update(file, { status: 'uploading', percent: event.percent }, event);
  const onError = (error: Error, response: unknown, file: BaseRcFile) =>
    update(file, { status: 'error', error, response });
  const customRequest = props.customRequest as RcUploadProps['customRequest'];
  const request: RcUploadProps['customRequest'] = customRequest
    ? (options, info) => {
        try {
          return customRequest(options, info);
        } catch (reason) {
          if (
            typeof options.file === 'object' &&
            settledRequests.current.has(options.file)
          ) {
            throw reason;
          }
          options.onError?.(asError(reason));
        }
      }
    : undefined;
  const onBatchStart: NonNullable<RcUploadProps['onBatchStart']> = (batch) => {
    const allowed = batch.filter(
      ({ file }) => !ignored.current.delete(file.uid),
    );
    for (const { file, parsedFile } of allowed) {
      if (parsedFile && typeof parsedFile === 'object') {
        requestOrigins.current.set(parsedFile, file);
        settledRequests.current.delete(parsedFile);
      }
    }
    let next = [...current()];
    const additions = allowed.map(({ file, parsedFile }) => {
      const error = preparations.current.get(file)?.error;
      return {
        ...toFile(file),
        ...(error
          ? { status: 'error' as const, error }
          : parsedFile
            ? { status: 'uploading' as const }
            : {}),
      };
    });
    for (const item of additions)
      next = [...next.filter((old) => old.uid !== item.uid), item];
    for (const item of additions) emit(item, next);
  };
  useImperativeHandle(ref, () => ({
    onBatchStart,
    onSuccess,
    onProgress,
    onError,
    fileList: files,
    upload: uploader.current,
    nativeElement: root.current,
  }));
  const remove = async (file: UploadFile) => {
    if (disabled) return;
    const pending = pendingRemovals.current;
    if (sameUploadFile(file, pending.get(file.uid))) return;
    pending.set(file.uid, file);
    const isCurrent = (candidate?: UploadFile) =>
      root.current &&
      pending.get(file.uid) === file &&
      sameUploadFile(file, candidate);
    try {
      if ((await propsRef.current.onRemove?.(file)) === false) return;
      const items = current();
      const latest = items.find((item) => item.uid === file.uid);
      if (!latest || !isCurrent(latest)) return;
      uploader.current?.abort(file as RcFile);
      emit(
        { ...latest, status: 'removed' },
        items.filter((item) => item.uid !== file.uid),
      );
      setRemoveError(undefined);
    } catch (error) {
      if (!isCurrent(current().find((item) => item.uid === file.uid))) return;
      setRemoveError(
        error instanceof Error
          ? error.message
          : config.locale.messages.removeFileError,
      );
    } finally {
      if (pending.get(file.uid) === file) pending.delete(file.uid);
    }
  };
  const download = (file: UploadFile) => {
    if (props.onDownload) props.onDownload(file);
    else if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer');
  };
  const listConfig: ShowUploadListInterface =
    typeof props.showUploadList === 'object' ? props.showUploadList : {};
  const visible = (
    option: boolean | ((file: UploadFile) => boolean) | undefined,
    file: UploadFile,
    fallback: boolean,
  ) => (typeof option === 'function' ? option(file) : (option ?? fallback));
  const renderOption = (
    option: ShowUploadListInterface['extra'],
    file: UploadFile,
  ) => (typeof option === 'function' ? option(file) : option);
  const triggerStyle: CSSProperties = { ...styles?.trigger };
  return (
    <span
      ref={root}
      data-tao-upload=""
      data-type={type}
      data-list-type={listType}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      className={cx(names?.root, props.className, props.rootClassName)}
      style={{ ...styles?.root, ...props.style }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: This wrapper listens to drag events from the keyboard-accessible file trigger. */}
      <span
        data-tao-upload-trigger=""
        className={names?.trigger}
        style={triggerStyle}
        onDragOver={disabled ? undefined : () => setDragging(true)}
        onDragLeave={disabled ? undefined : () => setDragging(false)}
        onDrop={
          disabled
            ? undefined
            : (event) => {
                setDragging(false);
                props.onDrop?.(
                  event as unknown as React.DragEvent<HTMLDivElement>,
                );
              }
        }
      >
        <RcUploaderComponent
          onFocus={props.onFocus}
          ref={uploader}
          prefixCls={props.prefixCls ?? 'tao-upload-input'}
          component="span"
          action={(file) =>
            preparations.current.get(file as BaseRcFile)?.action ?? ''
          }
          name={props.name}
          method={props.method}
          headers={props.headers}
          data={(file) =>
            preparations.current.get(file as BaseRcFile)?.data ?? {}
          }
          customRequest={request}
          withCredentials={props.withCredentials}
          disabled={disabled}
          multiple={props.multiple}
          accept={props.accept}
          directory={props.directory}
          capture={props.capture}
          pastable={props.pastable && !disabled}
          id={props.id}
          openFileDialogOnClick={props.openFileDialogOnClick}
          hasControlInside={props.hasControlInside ?? !!props.children}
          beforeUpload={async (file, list) => {
            preparations.current.delete(file);
            const result = await props.beforeUpload?.(
              file as RcFile,
              list as RcFile[],
            );
            if (result === LIST_IGNORE) {
              ignored.current.add(file.uid);
              return false;
            }
            if (result === false) return false;
            const { action, data } = propsRef.current;
            try {
              preparations.current.set(file, {
                action:
                  typeof action === 'function'
                    ? await action(file as RcFile)
                    : action,
                data:
                  typeof data === 'function' ? await data(toFile(file)) : data,
              });
            } catch (reason) {
              preparations.current.set(file, {
                error: asError(reason),
              });
              return false;
            }
            return result;
          }}
          onBatchStart={onBatchStart}
          onProgress={(event, file) =>
            onProgress({ percent: event.percent ?? 0 }, file)
          }
          onSuccess={onSuccess}
          onError={onError}
        >
          {props.children ??
            (type === 'drag'
              ? config.locale.messages.uploadDrop
              : config.locale.messages.uploadFile)}
        </RcUploaderComponent>
      </span>
      {props.showUploadList !== false && (
        <span
          data-tao-upload-list=""
          className={names?.list}
          style={styles?.list}
        >
          {files.map((file) => {
            const image = props.isImageUrl
              ? props.isImageUrl(file)
              : !!(
                  file.type?.startsWith('image/') ||
                  /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(
                    file.url ?? file.name,
                  )
                );
            const localPreview = image && !!file.originFileObj;
            const previewUrl = file.url ?? file.thumbUrl;
            const actions = {
              preview: () => {
                if (props.onPreview) props.onPreview(file);
                else if (previewUrl)
                  window.open(previewUrl, '_blank', 'noopener,noreferrer');
                else if (localPreview) setPreviewFile(file);
              },
              download: () => download(file),
              remove: () => {
                void remove(file);
              },
            };
            const node = (
              <span
                data-tao-upload-item=""
                data-status={file.status}
                className={names?.item}
                style={styles?.item}
              >
                {listType !== 'text' && image ? (
                  <span data-tao-upload-thumbnail="">
                    <FilePreview file={file} previewFile={props.previewFile} />
                  </span>
                ) : (
                  (props.iconRender?.(file, listType) ?? <FileIcon />)
                )}
                <span data-tao-upload-details="">
                  {file.url ? (
                    <a
                      {...file.linkProps}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        const linkClick = file.linkProps?.onClick;
                        if (typeof linkClick === 'function') linkClick(event);
                        if (!event.defaultPrevented && props.onPreview) {
                          event.preventDefault();
                          actions.preview();
                        }
                      }}
                    >
                      {file.name}
                    </a>
                  ) : (
                    <span>{file.name}</span>
                  )}
                  {file.status === 'error' && (
                    <span data-tao-upload-error="" role="status">
                      {file.error?.message ?? locale.uploadError}
                    </span>
                  )}
                  {file.status === 'uploading' && (
                    <Progress
                      size="small"
                      showInfo={false}
                      {...props.progress}
                      percent={file.percent ?? 0}
                      aria-label={file['aria-label'] ?? file.name}
                      aria-labelledby={file['aria-labelledby']}
                    />
                  )}
                  {renderOption(listConfig.extra, file)}
                </span>
                <span data-tao-upload-actions="">
                  {visible(
                    listConfig.showPreviewIcon,
                    file,
                    listType === 'picture-card' ||
                      listType === 'picture-circle',
                  ) && (
                    <Button
                      variant="ghost"
                      size="small"
                      disabled={
                        !props.onPreview && !previewUrl && !localPreview
                      }
                      type="button"
                      aria-label={`${locale.previewFile} ${file.name}`}
                      onClick={actions.preview}
                    >
                      {renderOption(listConfig.previewIcon, file) ?? '↗'}
                    </Button>
                  )}
                  {visible(listConfig.showDownloadIcon, file, false) && (
                    <Button
                      variant="ghost"
                      size="small"
                      disabled={!props.onDownload && !file.url}
                      type="button"
                      aria-label={`${locale.downloadFile} ${file.name}`}
                      onClick={actions.download}
                    >
                      {renderOption(listConfig.downloadIcon, file) ?? '↓'}
                    </Button>
                  )}
                  {visible(listConfig.showRemoveIcon, file, true) &&
                    !disabled && (
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={false}
                        type="button"
                        aria-label={`${locale.removeFile} ${file.name}`}
                        onClick={actions.remove}
                      >
                        {renderOption(listConfig.removeIcon, file) ?? (
                          <FileIcon remove />
                        )}
                      </Button>
                    )}
                </span>
              </span>
            );
            return (
              <span key={file.uid} data-tao-upload-row="">
                {props.itemRender
                  ? props.itemRender(node, file, files, actions)
                  : node}
              </span>
            );
          })}
        </span>
      )}
      {previewFile && (
        <Modal
          open
          title={previewFile.name}
          footer={null}
          onClose={() => setPreviewFile(undefined)}
        >
          <div data-tao-upload-preview="">
            <FilePreview file={previewFile} previewFile={props.previewFile} />
          </div>
        </Modal>
      )}
      {removeError && <span role="alert">{removeError}</span>}
    </span>
  );
});
UploadRoot.displayName = 'Upload';
const Dragger = forwardRef<UploadRef, DraggerProps>(
  ({ height, style, ...props }, ref) => (
    <UploadRoot {...props} ref={ref} type="drag" style={{ height, ...style }} />
  ),
);
Dragger.displayName = 'Upload.Dragger';
export const Upload = Object.assign(
  UploadRoot as <T = unknown>(
    props: UploadProps<T> & { ref?: Ref<UploadRef<T>> },
  ) => ReactElement,
  {
    Dragger: Dragger as <T = unknown>(
      props: DraggerProps<T> & { ref?: Ref<UploadRef<T>> },
    ) => ReactElement,
    LIST_IGNORE,
  },
);
