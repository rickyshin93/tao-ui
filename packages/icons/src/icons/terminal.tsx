// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TerminalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TerminalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="4.4" width="17.6" height="15.2" rx="1.8"/><path d="m6.7 8.5 3.5 3.5-3.5 3.5M13.5 15.5h3.8"/>
        {children}
      </svg>
    );
  },
);
