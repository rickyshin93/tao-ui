// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SmartwatchIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SmartwatchIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="6.5" y="7.1" width="11" height="10.3" rx="1.9"/><path d="M8.3 7.1v-4h7.4v4M8.3 17.4v3.5h7.4v-3.5M12 10v2.6l2 1.1"/>
        {children}
      </svg>
    );
  },
);
