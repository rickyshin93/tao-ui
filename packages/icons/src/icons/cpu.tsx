// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CpuIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CpuIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="6" y="6" width="12" height="12" rx="1.7"/><rect x="9.5" y="9.5" width="5" height="5" rx=".55"/><path d="M9.4 3v2.8m5.2-2.8v2.8M9.4 18.2V21m5.2-2.8V21M3 9.4h2.8M3 14.6h2.8m12.4-5.2H21m-2.8 5.2H21"/>
        {children}
      </svg>
    );
  },
);
