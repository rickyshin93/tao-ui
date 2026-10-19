// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CoveragePeriodIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CoveragePeriodIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 7a9 4 0 0 1 18 0M5 12h14v9H5ZM9 17h6"/>
        {children}
      </svg>
    );
  },
);
