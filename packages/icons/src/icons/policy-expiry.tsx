// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyExpiryIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyExpiryIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3H4v18h6M14 11h7M14 21h7M15 11v2l5 6v2M20 11v2l-5 6v2"/>
        {children}
      </svg>
    );
  },
);
