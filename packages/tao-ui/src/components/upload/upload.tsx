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
import { Spinner } from '../spinner/spinner';
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

function isImageFile(file: UploadFile) {
  if (file.type && !file.thumbUrl) return file.type.startsWith('image/');
  const url = file.thumbUrl || file.url || '';
  const name = (url || file.name).split(/[?#]/)[0].split('/').pop() ?? '';
  const extension = /\.[^./\\]*$/.exec(name)?.[0];
  if (/^data:image\//i.test(url)) return true;
  if (/^data:/i.test(url)) return false;
  return (
    !extension ||
    /^\.(avif|bmp|dpg|gif|heic|heif|ico|jfif|jpe?g|png|svg|tiff?|webp)$/i.test(
      extension,
    )
  );
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
    <FileIcon />
  );
}
function FileIcon({
  kind = 'file',
}: {
  kind?: 'file' | 'remove' | 'preview' | 'download' | 'plus' | 'upload';
}) {
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
      {kind === 'file' && (
        <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M10 12h5M10 16h5" />
      )}
      {kind === 'remove' && (
        <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
      )}
      {kind === 'preview' && (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {kind === 'download' && <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />}
      {kind === 'plus' && <path d="M12 4v16M4 12h16" />}
      {kind === 'upload' && <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />}
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
  const isCard = listType === 'picture-card' || listType === 'picture-circle';
  const names =
    typeof props.classNames === 'function'
      ? props.classNames({ props: { ...props, listType, type, disabled } })
      : props.classNames;
  const styles =
    typeof props.styles === 'function'
      ? props.styles({ props: { ...props, listType, type, disabled } })
      : props.styles;
  const locale = {
    uploading: config.locale.messages.loading,
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
  const trigger = (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drag events bubble from the accessible file trigger.
    <span
      data-tao-upload-trigger=""
      hidden={props.children === null || props.children === false}
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
        hasControlInside={
          props.hasControlInside ??
          (!!props.children || (!isCard && type !== 'drag'))
        }
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
        {props.children === undefined ? (
          type === 'drag' ? (
            <>
              <span data-tao-upload-drag-icon="">
                <FileIcon kind="upload" />
              </span>
              <span>{config.locale.messages.uploadDrop}</span>
            </>
          ) : isCard ? (
            <>
              <FileIcon kind="plus" />
              <span>{config.locale.messages.uploadFile}</span>
            </>
          ) : (
            <Button disabled={disabled}>
              <FileIcon kind="upload" />
              {config.locale.messages.uploadFile}
            </Button>
          )
        ) : (
          props.children
        )}
      </RcUploaderComponent>
    </span>
  );
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
      {(!isCard || props.showUploadList === false) && trigger}
      {props.showUploadList !== false && (
        <span
          data-tao-upload-list=""
          className={names?.list}
          style={styles?.list}
        >
          {files.map((file) => {
            const image = (props.isImageUrl ?? isImageFile)(file);
            const uploading = file.status === 'uploading';
            const hasThumbnail =
              image &&
              !!(file.thumbUrl || file.url || file.originFileObj) &&
              !uploading;
            const icon =
              props.iconRender?.(file, listType) ??
              (uploading ? (
                isCard ? (
                  locale.uploading
                ) : (
                  <Spinner size="small" />
                )
              ) : (
                <FileIcon />
              ));
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
                data-thumbnail={hasThumbnail || undefined}
                title={
                  file.status === 'error'
                    ? (file.error?.message ?? locale.uploadError)
                    : file.name
                }
                className={names?.item}
                style={styles?.item}
              >
                {listType !== 'text' ? (
                  hasThumbnail ? (
                    <button
                      type="button"
                      data-tao-upload-thumbnail=""
                      aria-label={file.name}
                      onClick={actions.preview}
                    >
                      <FilePreview
                        file={file}
                        previewFile={props.previewFile}
                      />
                    </button>
                  ) : (
                    <span data-tao-upload-thumbnail="">{icon}</span>
                  )
                ) : (
                  <span data-tao-upload-icon="">{icon}</span>
                )}
                <span data-tao-upload-details="">
                  {file.url ? (
                    <a
                      data-tao-upload-name=""
                      title={file.name}
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
                  ) : props.onPreview ? (
                    <button
                      type="button"
                      data-tao-upload-name=""
                      title={file.name}
                      onClick={actions.preview}
                    >
                      {file.name}
                    </button>
                  ) : (
                    <span data-tao-upload-name="" title={file.name}>
                      {file.name}
                    </span>
                  )}
                  {file.status === 'error' && (
                    <span data-tao-upload-error="" role="status">
                      {file.error?.message ?? locale.uploadError}
                    </span>
                  )}
                  {file.status === 'uploading' && (
                    <Progress
                      size="small"
                      strokeWidth={2}
                      showInfo={false}
                      {...props.progress}
                      percent={file.percent ?? 0}
                      aria-label={file['aria-label'] ?? file.name}
                      aria-labelledby={file['aria-labelledby']}
                    />
                  )}
                  {listConfig.extra != null && (
                    <span data-tao-upload-extra="">
                      {renderOption(listConfig.extra, file)}
                    </span>
                  )}
                </span>
                {(!isCard || !uploading) && (
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
                        {renderOption(listConfig.previewIcon, file) ?? (
                          <FileIcon kind="preview" />
                        )}
                      </Button>
                    )}
                    {file.status === 'done' &&
                      visible(listConfig.showDownloadIcon, file, false) && (
                        <Button
                          variant="ghost"
                          size="small"
                          disabled={!props.onDownload && !file.url}
                          type="button"
                          aria-label={`${locale.downloadFile} ${file.name}`}
                          onClick={actions.download}
                        >
                          {renderOption(listConfig.downloadIcon, file) ?? (
                            <FileIcon kind="download" />
                          )}
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
                            <FileIcon kind="remove" />
                          )}
                        </Button>
                      )}
                  </span>
                )}
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
          {isCard && trigger}
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
  ({ height, style, styles, ...props }, ref) => (
    <UploadRoot
      {...props}
      ref={ref}
      type="drag"
      styles={(info) => {
        const resolved = typeof styles === 'function' ? styles(info) : styles;
        return {
          ...resolved,
          trigger: { height, ...style, ...resolved?.trigger },
        };
      }}
    />
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
