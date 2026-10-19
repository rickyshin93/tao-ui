// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CameraIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CameraIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7.1 7.1 8.65 4.8q.35-.5.95-.5h4.8q.6 0 .95.5l1.55 2.3h2.35q1.85 0 1.85 1.85v9.15q0 1.85-1.85 1.85H4.75q-1.85 0-1.85-1.85V8.95q0-1.85 1.85-1.85Z"/><circle cx="12" cy="13.4" r="3.35"/>
        {children}
      </svg>
    );
  },
);
