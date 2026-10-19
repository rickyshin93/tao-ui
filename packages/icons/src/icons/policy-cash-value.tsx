// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyCashValueIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyCashValueIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 3h8l-2.5 4 4.8 5.5Q20 14.5 20 17q0 4-8 4t-8-4q0-2.5 1.7-4.5L10.5 7ZM9.5 7h5"/>
        {children}
      </svg>
    );
  },
);
