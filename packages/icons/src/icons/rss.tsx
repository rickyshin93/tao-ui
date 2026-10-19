// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RssIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RssIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.1 3.9c8.8 0 16 7.2 16 16M4.1 9.8c5.6 0 10.1 4.5 10.1 10.1"/><circle cx="5.5" cy="18.5" r="1.65" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
