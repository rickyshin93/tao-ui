// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyRenewalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyRenewalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 4h9v13H8M4 7a9 9 0 1 0 17 9M2.5 4.5 4 7l3-1"/>
        {children}
      </svg>
    );
  },
);
