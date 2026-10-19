// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SearchXIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SearchXIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M17.65 10.8C17.65 15.05 15.05 17.65 10.8 17.65S3.95 15.05 3.95 10.8 6.55 3.95 10.8 3.95 17.65 6.55 17.65 10.8Z"/><path d="m16 16 4.25 4.25"/><path d="m8 8 5.5 5.5M13.5 8 8 13.5"/>
        {children}
      </svg>
    );
  },
);
