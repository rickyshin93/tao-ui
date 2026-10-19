// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MenuIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MenuIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.1 6.5h15.8M4.1 12h15.8M4.1 17.5h15.8"/>
        {children}
      </svg>
    );
  },
);
