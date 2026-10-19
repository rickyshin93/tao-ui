// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimCoverageCheckIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimCoverageCheckIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 12a8.5 8.5 0 0 1 17 0h-17ZM12 12v6a3 3 0 0 0 6 0"/>
        {children}
      </svg>
    );
  },
);
