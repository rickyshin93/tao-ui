// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SmileIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SmileIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.9"/><circle cx="8.7" cy="9.3" r="1.05" fill="currentColor" stroke="none"/><circle cx="15.3" cy="9.3" r="1.05" fill="currentColor" stroke="none"/><path d="M7.9 14.3q4.1 5 8.2 0"/>
        {children}
      </svg>
    );
  },
);
