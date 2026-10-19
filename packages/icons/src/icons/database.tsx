// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const DatabaseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function DatabaseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <ellipse cx="12" cy="6.2" rx="7.5" ry="3"/><path d="M4.5 6.2v11.6c0 1.7 3.35 3 7.5 3s7.5-1.3 7.5-3V6.2M4.7 12c0 1.6 3.25 2.9 7.3 2.9s7.3-1.3 7.3-2.9"/>
        {children}
      </svg>
    );
  },
);
