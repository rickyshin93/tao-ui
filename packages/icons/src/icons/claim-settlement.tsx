// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimSettlementIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimSettlementIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.5v17M4.5 8h15M5.5 8l-3 8h6l-3-8ZM18.5 8l-3 8h6l-3-8Z"/>
        {children}
      </svg>
    );
  },
);
