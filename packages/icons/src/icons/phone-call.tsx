// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PhoneCallIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PhoneCallIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.6 4.1H4.7q-1.4 0-1.4 1.4c0 8.4 6.9 15.2 15.2 15.2q1.4 0 1.4-1.4v-1.9q0-.65-.65-.85l-3-.95q-.6-.2-1 .25l-1.4 1.45a13 13 0 0 1-7.15-7.15l1.45-1.4q.45-.4.25-1l-.95-3q-.2-.65-.85-.65Z"/><path d="M13.1 3.4a7.5 7.5 0 0 1 7.5 7.5M13.1 7a3.9 3.9 0 0 1 3.9 3.9"/>
        {children}
      </svg>
    );
  },
);
