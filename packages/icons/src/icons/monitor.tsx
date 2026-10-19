// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MonitorIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MonitorIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="3.75" width="17.6" height="12.7" rx="1.85"/><path d="M12 16.65v3.6M7.7 20.55h8.6"/>
        {children}
      </svg>
    );
  },
);
