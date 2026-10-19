// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimPaymentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimPaymentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 11.5H7l2-3h5q2.5 0 2.5 3H11M3.5 11.5V17H14l6.5-6"/>
        {children}
      </svg>
    );
  },
);
