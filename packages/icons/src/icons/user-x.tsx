// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UserXIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UserXIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="10" cy="6.7" r="3.2"/><path d="M3.4 20v-2.2c0-3 2.3-5 6.6-5 2 0 3.6.4 4.8 1.3"/><path d="m16 16 4.5 4.5M20.5 16 16 20.5"/>
        {children}
      </svg>
    );
  },
);
