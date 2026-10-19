// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PlugIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PlugIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.25 3.1v4.75M15.75 3.1v4.75M6 8.05h12v3.8a6 6 0 0 1-12 0ZM12 17.85v3.05"/>
        {children}
      </svg>
    );
  },
);
