// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceHealthIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceHealthIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>
        {children}
      </svg>
    );
  },
);
