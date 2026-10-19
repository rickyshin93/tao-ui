// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HomeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HomeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M2.75 10.8 11.45 3.8Q12 3.35 12.55 3.8L21.25 10.8"/><path d="M4.3 9.55V18.5q0 1.75 1.75 1.75h2.8v-6q0-1.4 1.4-1.4h3.5q1.4 0 1.4 1.4v6h2.8q1.75 0 1.75-1.75V9.55"/>
        {children}
      </svg>
    );
  },
);
