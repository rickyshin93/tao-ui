// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChartAreaIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChartAreaIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.75 3.4v15.4q0 1.45 1.45 1.45h15.4"/><path d="M7.4 16.1v-3.7l3.8-4 4.4 3.9 4.8-6.4v10.2Z"/>
        {children}
      </svg>
    );
  },
);
