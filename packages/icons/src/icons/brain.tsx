// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BrainIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BrainIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 5.5c-2-4-6.8-1.8-6.2 1.3-4.4 1-4.4 6.2-1 7.7-1.3 4 3.7 7.6 7.2 4.5 3.5 3.1 8.5-.5 7.2-4.5 3.4-1.5 3.4-6.7-1-7.7.6-3.1-4.2-5.3-6.2-1.3ZM12 5.5V19M6 7q3 .5 3 3M18 7q-3 .5-3 3M5 14.5q3-1 4 1M19 14.5q-3-1-4 1"/>
        {children}
      </svg>
    );
  },
);
