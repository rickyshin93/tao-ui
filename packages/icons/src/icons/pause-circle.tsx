// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PauseCircleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PauseCircleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.9"/><path d="M9.2 8v8m5.6-8v8"/>
        {children}
      </svg>
    );
  },
);
