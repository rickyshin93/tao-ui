// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChartDonutIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChartDonutIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><path d="M12 3.8v3.8M16.4 12h3.8"/>
        {children}
      </svg>
    );
  },
);
