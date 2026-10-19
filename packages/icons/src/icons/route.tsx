// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RouteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RouteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="5.5" cy="18.4" r="2.2"/><circle cx="18.5" cy="5.6" r="2.2"/><path d="M5.5 16.2V9.3q0-2 2-2h3.8q2 0 2 2v5.4q0 2 2 2h1.2q2 0 2-2V7.8"/>
        {children}
      </svg>
    );
  },
);
