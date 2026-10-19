// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SalesLeadIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SalesLeadIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6 21V4h12l-3 5 3 5H6"/>
        {children}
      </svg>
    );
  },
);
