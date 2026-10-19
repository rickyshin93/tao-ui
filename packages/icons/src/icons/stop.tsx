// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const StopIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function StopIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="1.8"/>
        {children}
      </svg>
    );
  },
);
