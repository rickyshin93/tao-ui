// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WifiOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WifiOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M9.7 5.6q6.25-.85 11.2 2.65M14.7 10.2q1.65.5 3 1.55M6.3 11.75q.55-.45 1.2-.8M9.45 15.25q.75-.6 1.65-.75"/><circle cx="12" cy="18.7" r="0.9" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
