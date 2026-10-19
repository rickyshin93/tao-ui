// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CreditCardIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CreditCardIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3" y="5.3" width="18" height="13.4" rx="1.85"/><path d="M3.2 9.65h17.6M6.7 14.8h4.1"/>
        {children}
      </svg>
    );
  },
);
