// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const GalleryHorizontalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function GalleryHorizontalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="7.1" y="4.1" width="9.8" height="15.8" rx="1.8"/><path d="M3.2 6.8v10.4M20.8 6.8v10.4"/>
        {children}
      </svg>
    );
  },
);
