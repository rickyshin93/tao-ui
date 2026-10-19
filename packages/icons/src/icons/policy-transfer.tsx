// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyTransferIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyTransferIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="7" y="3" width="10" height="12" rx="1.5"/><path d="M3 20h18m-4-4 4 4-4 2"/>
        {children}
      </svg>
    );
  },
);
