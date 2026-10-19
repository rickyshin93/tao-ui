// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AutomaticPaymentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AutomaticPaymentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.5 9a8 8 0 0 1 13.2-3l2.8 3M20.5 4.5V9H16M19.5 15a8 8 0 0 1-13.2 3l-2.8-3M3.5 19.5V15H8"/>
        {children}
      </svg>
    );
  },
);
