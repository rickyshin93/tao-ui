// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const GiftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function GiftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.1" y="7.8" width="17.8" height="4.55" rx="1.2"/><path d="M4.75 12.55v6.55q0 1.65 1.65 1.65h11.2q1.65 0 1.65-1.65v-6.55M12 8v12.55M12 7.75H8.1a2.25 2.25 0 1 1 2.2-2.65ZM12 7.75h3.9a2.25 2.25 0 1 0-2.2-2.65Z"/>
        {children}
      </svg>
    );
  },
);
