// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const StoreIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function StoreIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.2 8.4l1.4-4.8h14.8l1.4 4.8q0 2.5-2.9 2.5T15 8.4q0 2.5-3 2.5T9 8.4q0 2.5-2.9 2.5T3.2 8.4ZM4.2 10.8v9.8h15.6v-9.8M9.5 20.6V14h5v6.6"/>
        {children}
      </svg>
    );
  },
);
