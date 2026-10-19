// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChevronLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChevronLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m14.65 5.7-6.05 5.8q-.5.5 0 1l6.05 5.8"/>
        {children}
      </svg>
    );
  },
);
