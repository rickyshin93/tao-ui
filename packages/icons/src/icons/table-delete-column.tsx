// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TableDeleteColumnIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TableDeleteColumnIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.4" y="3.4" width="10.2" height="17.2" rx="1.8"/><path d="M8.5 3.6v16.8M3.6 9.2h9.8"/><path d="M16.9 12h4.2"/>
        {children}
      </svg>
    );
  },
);
