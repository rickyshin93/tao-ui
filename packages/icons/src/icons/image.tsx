// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ImageIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ImageIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.4" y="3.5" width="17.2" height="17" rx="1.9"/><circle cx="8.8" cy="8.9" r="1.9"/><path d="m3.65 18.2 4.65-3.7q.4-.3.8.1l2.7 2.8 3.7-4.8q.45-.6.9 0l3.75 5.1"/>
        {children}
      </svg>
    );
  },
);
