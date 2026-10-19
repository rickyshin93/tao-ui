// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FileImageIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FileImageIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M14 3.3H6q-1.8 0-1.8 1.8v13.8q0 1.8 1.8 1.8h12q1.8 0 1.8-1.8V9.1L14 3.3Z"/><path d="M14 3.5v4.3q0 1.3 1.3 1.3h4.3"/><circle cx="10" cy="11.7" r="1.9"/><path d="m7.3 19 7.4-3.85q.5-.25.9.1l4 3.15"/>
        {children}
      </svg>
    );
  },
);
