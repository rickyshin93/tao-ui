// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PremiumAuditIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PremiumAuditIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 20v-7M9 20v-4"/><circle cx="13" cy="8" r="5"/><path d="m17 12 4 4"/>
        {children}
      </svg>
    );
  },
);
