// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RefreshIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RefreshIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19.75 9.3a8.2 8.2 0 0 0-14-3.1M19.85 4.8v4.05q0 .6-.6.6H15.2M4.25 14.7a8.2 8.2 0 0 0 14 3.1M4.15 19.2v-4.05q0-.6.6-.6H8.8"/>
        {children}
      </svg>
    );
  },
);
