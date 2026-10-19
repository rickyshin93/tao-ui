// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChartLineIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChartLineIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.75 3.4v15.4q0 1.45 1.45 1.45h15.4M7.45 14.85l3.55-4.6q.3-.4.65-.05l3.25 3.15q.35.35.65-.05l5.05-6.55"/>
        {children}
      </svg>
    );
  },
);
