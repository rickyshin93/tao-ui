// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClipboardListIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClipboardListIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4.5" y="4.8" width="15" height="16.2" rx="1.8"/><rect x="8.5" y="2.7" width="7" height="4.2" rx="1.3"/><path d="M9 11h6M9 15h6"/>
        {children}
      </svg>
    );
  },
);
