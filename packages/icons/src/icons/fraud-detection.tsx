// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FraudDetectionIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FraudDetectionIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 6q8.5 3 17 0v6c0 4-5 6-8.5 3-3.5 3-8.5 1-8.5-3V6ZM7 11l2 .5M15 11.5l2-.5"/>
        {children}
      </svg>
    );
  },
);
