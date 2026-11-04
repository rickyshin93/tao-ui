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
function readPreview(file: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read file preview'));
    reader.readAsDataURL(file);
  });
}
function FilePreview({
  file,
  previewFile,
}: {
  file: UploadFile;
  previewFile?: UploadProps['previewFile'];
}) {
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (file.thumbUrl || file.url || !file.originFileObj) return;
    let active = true;
    Promise.resolve((previewFile ?? readPreview)(file.originFileObj)).then(
      (value) => {
        if (active) setPreview(value);
      },
      (reason) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : 'Preview unavailable',
          );
      },
    );
    return () => {
      active = false;
    };
  }, [file.originFileObj, file.thumbUrl, file.url, previewFile]);
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
  const files = props.fileList ?? localFiles;
  const filesRef = useRef(files);
  filesRef.current = files;
  const propsRef = useRef(props);
  propsRef.current = props;
  const root = useRef<HTMLSpanElement>(null),
    uploader = useRef<RcUploader>(null);
  const ignored = useRef(new Set<string>());
  const [dragging, setDragging] = useState(false),
    [removeError, setRemoveError] = useState<string>();
  const disabled = props.disabled ?? config.disabled;
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
  const chinese = config.locale.locale === 'zh_CN';
  const locale = {
    removeFile: chinese ? '删除文件' : 'Remove file',
    previewFile: chinese ? '预览文件' : 'Preview file',
    downloadFile: chinese ? '下载文件' : 'Download file',
    uploadError: chinese ? '上传失败' : 'Upload failed',
    ...props.locale,
  };
  const current = () => propsRef.current.fileList ?? filesRef.current;
  const emit = (
    file: UploadFile,
    next: UploadFile[],
    event?: { percent: number },
  ) => {
    const max = propsRef.current.maxCount;
    const limited =
      max === 1 ? next.slice(-1) : max ? next.slice(0, max) : next;
    flushSync(() => {
      if (propsRef.current.fileList === undefined) {
        filesRef.current = limited;
        setFiles(limited);
      }
      if (
        file.status === 'removed' ||
        limited.some((item) => item.uid === file.uid)
      )
        propsRef.current.onChange?.({
          file,
          fileList: limited,
          ...(event ? { event } : {}),
        });
    });
  };
  const update = (
    file: BaseRcFile,
    patch: Partial<UploadFile>,
    event?: { percent: number },
  ) => {
    const items = current(),
      found = items.find((item) => item.uid === file.uid);
    if (!found) return;
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
  const onBatchStart: NonNullable<RcUploadProps['onBatchStart']> = (batch) => {
    const allowed = batch.filter(
      ({ file }) => !ignored.current.delete(file.uid),
    );
    let next = [...current()];
    const additions = allowed.map(({ file, parsedFile }) => ({
      ...toFile(file),
      ...(parsedFile ? { status: 'uploading' as const } : {}),
    }));
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
    try {
      if ((await propsRef.current.onRemove?.(file)) === false) return;
      const items = current();
      if (!items.some((item) => item.uid === file.uid)) return;
      uploader.current?.abort(file as RcFile);
      emit(
        { ...file, status: 'removed' },
        items.filter((item) => item.uid !== file.uid),
      );
      setRemoveError(undefined);
    } catch (error) {
      setRemoveError(
        error instanceof Error ? error.message : 'Unable to remove file',
      );
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
      <span
        data-tao-upload-trigger=""
        className={names?.trigger}
        style={triggerStyle}
      >
        <RcUploaderComponent
          onFocus={props.onFocus}
          ref={uploader}
          prefixCls={props.prefixCls ?? 'tao-upload-input'}
          component="span"
          action={(props.action as RcUploadProps['action']) ?? ''}
          name={props.name}
          method={props.method}
          headers={props.headers}
          data={
            (typeof props.data === 'function'
              ? (file: BaseRcFile) =>
                  (props.data as (value: UploadFile) => unknown)(toFile(file))
              : props.data) as RcUploadProps['data']
          }
          customRequest={props.customRequest as RcUploadProps['customRequest']}
          withCredentials={props.withCredentials}
          disabled={disabled}
          multiple={props.multiple}
          accept={props.accept}
          directory={props.directory}
          capture={props.capture}
          pastable={props.pastable}
          id={props.id}
          openFileDialogOnClick={props.openFileDialogOnClick}
          hasControlInside={props.hasControlInside ?? !!props.children}
          beforeUpload={async (file, list) => {
            const result = await props.beforeUpload?.(
              file as RcFile,
              list as RcFile[],
            );
            if (result === LIST_IGNORE) {
              ignored.current.add(file.uid);
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
          onDragOver={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            setDragging(false);
            props.onDrop?.(event as unknown as React.DragEvent<HTMLDivElement>);
          }}
        >
          {props.children ??
            (type === 'drag'
              ? chinese
                ? '点击或拖动文件到此区域上传'
                : 'Click or drop files here to upload'
              : chinese
                ? '上传文件'
                : 'Upload files')}
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
            const actions = {
              preview: () => props.onPreview?.(file),
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
                        if (props.onPreview) {
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
                    <button
                      type="button"
                      aria-label={`${locale.previewFile} ${file.name}`}
                      onClick={actions.preview}
                    >
                      {renderOption(listConfig.previewIcon, file) ?? '↗'}
                    </button>
                  )}
                  {visible(listConfig.showDownloadIcon, file, false) && (
                    <button
                      type="button"
                      aria-label={`${locale.downloadFile} ${file.name}`}
                      onClick={actions.download}
                    >
                      {renderOption(listConfig.downloadIcon, file) ?? '↓'}
                    </button>
                  )}
                  {visible(listConfig.showRemoveIcon, file, true) &&
                    !disabled && (
                      <button
                        type="button"
                        aria-label={`${locale.removeFile} ${file.name}`}
                        onClick={actions.remove}
                      >
                        {renderOption(listConfig.removeIcon, file) ?? (
                          <FileIcon remove />
                        )}
                      </button>
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
