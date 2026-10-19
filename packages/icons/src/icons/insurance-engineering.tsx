// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceEngineeringIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceEngineeringIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7 21V3h5l8 5H3M17 8v9M14 17h7"/>
        {children}
      </svg>
    );
  },
);
