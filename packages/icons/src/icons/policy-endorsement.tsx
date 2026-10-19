// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyEndorsementIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyEndorsementIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M13 3H4v18h10M12 17l1-4 6-6 3 3-6 6-4 1Z"/>
        {children}
      </svg>
    );
  },
);
