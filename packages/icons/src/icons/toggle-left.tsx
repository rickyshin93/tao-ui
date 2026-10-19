// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ToggleLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ToggleLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="2.8" y="6.8" width="18.4" height="10.4" rx="5.2"/><circle cx="8" cy="12" r="2.2"/>
        {children}
      </svg>
    );
  },
);
