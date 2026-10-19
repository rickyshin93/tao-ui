// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimNotificationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimNotificationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m13.5 3-8 10h6l-1 8 8-11h-6l1-7Z"/>
        {children}
      </svg>
    );
  },
);
