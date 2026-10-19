// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PaperclipIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PaperclipIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m8.4 13.4 7-7q2.15-2.15 4.3 0t0 4.3l-8.6 8.6q-3.25 3.25-6.5 0t0-6.5l8.2-8.2M8.4 13.4q-1.05 1.05 0 2.1t2.1 0l6.2-6.2"/>
        {children}
      </svg>
    );
  },
);
