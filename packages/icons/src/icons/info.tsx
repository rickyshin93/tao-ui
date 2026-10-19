// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InfoIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InfoIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.7"/><path d="M10.6 11.4H12v5.3m-1.75 0h3.5"/><circle cx="12" cy="7.45" r=".85" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
