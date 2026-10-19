// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TrainIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TrainIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5.3" y="3.2" width="13.4" height="15.2" rx="1.9"/><rect x="8.3" y="6.5" width="7.4" height="5.4" rx="0.8"/><circle cx="8.6" cy="15.2" r="0.85" fill="currentColor" stroke="none"/><circle cx="15.4" cy="15.2" r="0.85" fill="currentColor" stroke="none"/><path d="m8.3 18.6-2 2.6m9.4-2.6 2 2.6"/>
        {children}
      </svg>
    );
  },
);
