// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LockKeyholeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LockKeyholeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4.5" y="10" width="15" height="11" rx="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="14.5" r="1.5"/><path d="M12 16v2"/>
        {children}
      </svg>
    );
  },
);
