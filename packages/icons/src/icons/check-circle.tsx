// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CheckCircleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CheckCircleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.7"/><path d="m7.5 12.05 3 2.95 6-6"/>
        {children}
      </svg>
    );
  },
);
