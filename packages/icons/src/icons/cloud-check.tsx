// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CloudCheckIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CloudCheckIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.8 18.5c-2.6 0-4-1.7-4-4.3s1.5-4.3 4-4.5q.7-5.2 5.5-5.2c3.2 0 5.2 2.1 5.5 5.2 2.3.25 3.4 1.9 3.4 4.4 0 2.7-1.5 4.4-4.1 4.4Z"/><path d="m8 13 3 3 5-5"/>
        {children}
      </svg>
    );
  },
);
