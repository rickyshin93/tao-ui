// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ShieldIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ShieldIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.1 19.2 5.8v5.1c0 4.65-2.9 7.9-7.2 10-4.3-2.1-7.2-5.35-7.2-10V5.8Z"/>
        {children}
      </svg>
    );
  },
);
