// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MinimizeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MinimizeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.8 8.6h3q1.8 0 1.8-1.8v-3M15.4 3.8v3q0 1.8 1.8 1.8h3M20.2 15.4h-3q-1.8 0-1.8 1.8v3M8.6 20.2v-3q0-1.8-1.8-1.8h-3"/>
        {children}
      </svg>
    );
  },
);
