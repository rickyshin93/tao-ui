// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TrendingDownIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TrendingDownIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.9 6.5 5.6 5.6 3.8-3.8 6.8 9.7m-4.4 0h4.4v-4.4"/>
        {children}
      </svg>
    );
  },
);
