// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BotIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BotIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="7" width="16" height="13" rx="1.8"/><path d="M12 3v4M3 12v4M21 12v4M8.5 12v1M15.5 12v1M9 17h6"/>
        {children}
      </svg>
    );
  },
);
