// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyLoanIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyLoanIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 4a8 8 0 1 0 8 8M12 12l8-8M14 4h6v6"/>
        {children}
      </svg>
    );
  },
);
