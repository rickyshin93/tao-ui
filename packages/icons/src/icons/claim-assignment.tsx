// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimAssignmentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimAssignmentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 12H8q4 0 4-4V6h8M8 12q4 0 4 4v2h8M17 3l3 3-3 3M17 15l3 3-3 3"/>
        {children}
      </svg>
    );
  },
);
