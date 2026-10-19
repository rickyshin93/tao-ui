// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SalvageIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SalvageIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="15" cy="5.5" r="2.5"/><path d="M15 8v7.5a5 5 0 0 1-10 0V13"/>
        {children}
      </svg>
    );
  },
);
