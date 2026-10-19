// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceSuretyIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceSuretyIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 7h4l3 3 4-3h3l4 4-7 9-8-6H3ZM10 10l3 3 3-2"/>
        {children}
      </svg>
    );
  },
);
