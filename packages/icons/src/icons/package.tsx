// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PackageIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PackageIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m12 3.2 8.5 4.9v7.8q0 1-.85 1.5L12 21l-7.65-3.6q-.85-.5-.85-1.5V8.1ZM3.7 8.2 12 13l8.3-4.8M12 13v7.8M7.9 5.7l8.2 4.7v3"/>
        {children}
      </svg>
    );
  },
);
