// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BracesIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BracesIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9.2 3.6H7.9q-1.7 0-1.7 1.7v3.9q0 1.9-2.6 2.8 2.6.9 2.6 2.8v3.9q0 1.7 1.7 1.7h1.3M14.8 3.6h1.3q1.7 0 1.7 1.7v3.9q0 1.9 2.6 2.8-2.6.9-2.6 2.8v3.9q0 1.7-1.7 1.7h-1.3"/>
        {children}
      </svg>
    );
  },
);
