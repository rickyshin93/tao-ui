// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FileArchiveIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FileArchiveIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M14 3.3H6q-1.8 0-1.8 1.8v13.8q0 1.8 1.8 1.8h12q1.8 0 1.8-1.8V9.1L14 3.3Z"/><path d="M14 3.5v4.3q0 1.3 1.3 1.3h4.3"/><path d="M10.6 6.5v6.4M8.8 7.5h3.6M8.8 10.6h3.6"/><rect x="8.5" y="13.5" width="4.8" height="4.8" rx="1"/>
        {children}
      </svg>
    );
  },
);
