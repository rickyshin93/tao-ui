// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const NavigationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function NavigationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m20.3 3.65-6 16.1q-.35.95-.85.05l-3.25-6-6-3.25q-.9-.5.05-.85l16.1-6q.85-.35.5.5Z"/>
        {children}
      </svg>
    );
  },
);
