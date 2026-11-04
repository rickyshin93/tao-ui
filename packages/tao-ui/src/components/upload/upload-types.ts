import type RcUpload from '@rc-component/upload';
import type {
  AcceptConfig,
  RcFile as BaseRcFile,
  UploadProps as RcUploadProps,
  UploadRequestOption,
} from '@rc-component/upload';
import type {
  CSSProperties,
  DragEvent,
  FocusEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import type { ProgressProps } from '../progress/progress';

export interface RcFile extends BaseRcFile {
  readonly lastModifiedDate: Date;
}
export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'removed';
export interface UploadFile<T = unknown> {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  url?: string;
  thumbUrl?: string;
  preview?: string;
  status?: UploadFileStatus;
  percent?: number;
  originFileObj?: RcFile;
  response?: T;
  error?: Error;
  xhr?: XMLHttpRequest;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  linkProps?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
export interface UploadChangeParam<T = UploadFile> {
  file: T;
  fileList: T[];
  event?: { percent: number };
}
type RenderFile<T> = ReactNode | ((file: UploadFile<T>) => ReactNode);
type ShowFile<T> = boolean | ((file: UploadFile<T>) => boolean);
export interface ShowUploadListInterface<T = unknown> {
  extra?: RenderFile<T>;
  showRemoveIcon?: ShowFile<T>;
  showPreviewIcon?: ShowFile<T>;
  showDownloadIcon?: ShowFile<T>;
  removeIcon?: RenderFile<T>;
  downloadIcon?: RenderFile<T>;
  previewIcon?: RenderFile<T>;
}
export interface UploadLocale {
  uploading?: string;
  removeFile?: string;
  downloadFile?: string;
  uploadError?: string;
  previewFile?: string;
}
export type UploadListType =
  | 'text'
  | 'picture'
  | 'picture-card'
  | 'picture-circle';
export type UploadType = 'drag' | 'select';
export type UploadSemanticPart = 'root' | 'list' | 'item' | 'trigger';
export type UploadListProgressProps = Omit<ProgressProps, 'percent' | 'type'>;
export type PreviewFileHandler = (file: File | Blob) => PromiseLike<string>;
export type ItemRender<T = unknown> = (
  originNode: ReactElement,
  file: UploadFile<T>,
  fileList: UploadFile<T>[],
  actions: { download: () => void; preview: () => void; remove: () => void },
) => ReactNode;
export type UploadRequestResult = { abort: () => void };
type RequestReturn = ReturnType<NonNullable<RcUploadProps['customRequest']>>;
type BeforeUploadReturn = Awaited<
  ReturnType<NonNullable<RcUploadProps['beforeUpload']>>
>;
type RemoveReturn = ReturnType<() => void> | boolean;
export type UploadCustomRequest<T = unknown, R = RequestReturn> = (
  options: UploadRequestOption<T>,
  info: {
    defaultRequest: (options: UploadRequestOption<T>) => RequestReturn;
  },
) => R;
type SemanticValue<Value, Props> = Value | ((info: { props: Props }) => Value);
export interface UploadProps<T = unknown>
  extends Pick<RcUploadProps, 'capture' | 'hasControlInside' | 'pastable'> {
  type?: UploadType;
  name?: string;
  defaultFileList?: UploadFile<T>[];
  fileList?: UploadFile<T>[];
  action?: string | ((file: RcFile) => string | PromiseLike<string>);
  directory?: boolean;
  multiple?: boolean;
  accept?: string | AcceptConfig;
  data?:
    | Record<string, unknown>
    | ((
        file: UploadFile<T>,
      ) => Record<string, unknown> | Promise<Record<string, unknown>>);
  method?: 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';
  headers?: Record<string, string>;
  withCredentials?: boolean;
  beforeUpload?: (
    file: RcFile,
    files: RcFile[],
  ) => BeforeUploadReturn | Promise<BeforeUploadReturn>;
  onChange?: (info: UploadChangeParam<UploadFile<T>>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onFocus?: FocusEventHandler<HTMLSpanElement>;
  showUploadList?: boolean | ShowUploadListInterface<T>;
  listType?: UploadListType;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: SemanticValue<
    SemanticClassNames<UploadSemanticPart>,
    UploadProps<T>
  >;
  styles?: SemanticValue<SemanticStyles<UploadSemanticPart>, UploadProps<T>>;
  onPreview?: (file: UploadFile<T>) => void;
  onDownload?: (file: UploadFile<T>) => void;
  onRemove?: (file: UploadFile<T>) => RemoveReturn | Promise<RemoveReturn>;
  supportServerRender?: boolean;
  disabled?: boolean;
  prefixCls?: string;
  customRequest?: UploadCustomRequest<T>;
  openFileDialogOnClick?: boolean;
  locale?: UploadLocale;
  id?: string;
  previewFile?: PreviewFileHandler;
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => ReactNode;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  progress?: UploadListProgressProps;
  itemRender?: ItemRender<T>;
  maxCount?: number;
  children?: ReactNode;
}
export interface DraggerProps<T = unknown> extends UploadProps<T> {
  height?: number;
}
export interface UploadRef<T = unknown> {
  onBatchStart: RcUploadProps['onBatchStart'];
  onSuccess: (response: T, file: RcFile, xhr?: XMLHttpRequest) => void;
  onProgress: (event: { percent: number }, file: RcFile) => void;
  onError: (error: Error, response: T, file: RcFile) => void;
  fileList: UploadFile<T>[];
  upload: RcUpload | null;
  nativeElement: HTMLSpanElement | null;
}
