// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FileUploadIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FileUploadIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M13.1 3.3H6q-1.8 0-1.8 1.8v13.8q0 1.8 1.8 1.8h12q1.8 0 1.8-1.8V10l-6.7-6.7Z"/><path d="M13.1 3.5v5.2q0 1.3 1.3 1.3h5.2"/><path d="M12 17.9v-5.7m-2.7 2.6 2.7-2.6 2.7 2.6"/>
        {children}
      </svg>
    );
  },
);
