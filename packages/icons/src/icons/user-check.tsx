// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UserCheckIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UserCheckIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="8.7" cy="7.7" r="3.6"/><path d="M2.9 20v-1.1c0-3 2.1-4.6 5.8-4.6q2.4 0 3.9 1M15 15.4l2.2 2.2 4.1-4.4"/>
        {children}
      </svg>
    );
  },
);
