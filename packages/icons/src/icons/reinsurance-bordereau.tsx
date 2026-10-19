// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ReinsuranceBordereauIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ReinsuranceBordereauIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M8 9h8M8 15h8"/>
        {children}
      </svg>
    );
  },
);
