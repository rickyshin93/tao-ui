// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PercentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PercentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="7.1" cy="7.1" r="2.7"/><circle cx="16.9" cy="16.9" r="2.7"/><path d="M5.1 18.9 18.9 5.1"/>
        {children}
      </svg>
    );
  },
);
