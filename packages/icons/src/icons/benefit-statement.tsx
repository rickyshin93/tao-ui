// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BenefitStatementIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BenefitStatementIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 3.5h14v17l-7-3-7 3v-17ZM8.5 8.5h7M8.5 12.5h5"/>
        {children}
      </svg>
    );
  },
);
