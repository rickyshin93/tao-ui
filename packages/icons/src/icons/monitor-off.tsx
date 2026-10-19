// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MonitorOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MonitorOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M9.1 3.75h9.85q1.85 0 1.85 1.85v8.1M3.2 9.3v5.3q0 1.85 1.85 1.85h9.45M12 16.65v3.6M7.7 20.55h8.6"/>
        {children}
      </svg>
    );
  },
);
