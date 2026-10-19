// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BadgeCheckIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BadgeCheckIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m12 2.8 3 2.1 3.6.3 1 3.5 1.6 3.3-1.6 3.3-1 3.5-3.6.3-3 2.1-3-2.1-3.6-.3-1-3.5L2.8 12l1.6-3.3 1-3.5 3.6-.3Z"/><path d="m8 12 2.7 2.7 5.3-5.4"/>
        {children}
      </svg>
    );
  },
);
