// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceLiabilityIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceLiabilityIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 8h16M12 3v18M7 21h10M4 8l-2 8h4ZM20 8l-2 8h4Z"/>
        {children}
      </svg>
    );
  },
);
