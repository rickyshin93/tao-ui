// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ReinsuranceTreatyIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ReinsuranceTreatyIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="7" width="12" height="14" rx="1.5"/><path d="M8 7V3.5h12V17h-4"/>
        {children}
      </svg>
    );
  },
);
