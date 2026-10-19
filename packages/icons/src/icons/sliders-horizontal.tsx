// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SlidersHorizontalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SlidersHorizontalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 6h2M10.5 6h10M3.5 12h10M18.5 12h2M3.5 18h2M10.5 18h10M8 3.9v4.2M16 9.9v4.2M8 15.9v4.2"/>
        {children}
      </svg>
    );
  },
);
