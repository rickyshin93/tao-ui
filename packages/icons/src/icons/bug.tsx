// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BugIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BugIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 8V6.9q0-3.3 4-3.3t4 3.3V8M6.6 8.1h10.8v7.1q0 5.3-5.4 5.3t-5.4-5.3ZM12 8.3v11.9M3.4 6.1l3.2 3.2m10.8 0 3.2-3.2M3 13.4h3.4m11.2 0H21M3.4 20l3.7-3m9.8 0 3.7 3"/>
        {children}
      </svg>
    );
  },
);
