// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const GaugeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function GaugeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.4 18.4v-2.8a8.6 8.6 0 0 1 17.2 0v2.8ZM12 15.2l4.4-4.4"/>
        {children}
      </svg>
    );
  },
);
