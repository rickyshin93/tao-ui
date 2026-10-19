// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyReinstateIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyReinstateIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M13 3H4v18h10M16 10a5.5 5.5 0 1 1-3 10M16 10l3-2M16 10l2 3"/>
        {children}
      </svg>
    );
  },
);
