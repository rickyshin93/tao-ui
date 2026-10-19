// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceMarineIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceMarineIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 13h18l-3 7H7ZM8 13V6h8v7M12 6V3"/>
        {children}
      </svg>
    );
  },
);
