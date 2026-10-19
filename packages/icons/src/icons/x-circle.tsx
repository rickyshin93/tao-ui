// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const XCircleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function XCircleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.7"/><path d="m8.8 8.8 6.4 6.4m0-6.4-6.4 6.4"/>
        {children}
      </svg>
    );
  },
);
