// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BeneficiaryIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BeneficiaryIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="9" cy="6.8" r="3"/><path d="M3.5 20v-1.8q0-5 5.5-5h1.5M17 13c-1.9-2.3-5-.8-4.2 1.8.4 1.5 2.5 3.6 4.2 5 1.7-1.4 3.8-3.5 4.2-5 .8-2.6-2.3-4.1-4.2-1.8Z"/>
        {children}
      </svg>
    );
  },
);
