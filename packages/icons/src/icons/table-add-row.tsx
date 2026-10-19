// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TableAddRowIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TableAddRowIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.4" y="3.4" width="17.2" height="10.2" rx="1.8"/><path d="M3.6 8.5h16.8M9.2 3.6v9.8"/><path d="M12 16.9v4.2M9.9 19h4.2"/>
        {children}
      </svg>
    );
  },
);
