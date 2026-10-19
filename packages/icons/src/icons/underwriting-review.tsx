// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UnderwritingReviewIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UnderwritingReviewIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 10a7 7 0 0 1 14 0H3"/><circle cx="15" cy="15" r="4"/><path d="m18 18 3 3"/>
        {children}
      </svg>
    );
  },
);
