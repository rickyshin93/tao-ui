// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChartStackedIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChartStackedIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5" y="8.4" width="5.3" height="11.8" rx="1"/><rect x="13.7" y="3.8" width="5.3" height="16.4" rx="1"/><path d="M5.2 14.3h4.9M13.9 11.6h4.9"/>
        {children}
      </svg>
    );
  },
);
