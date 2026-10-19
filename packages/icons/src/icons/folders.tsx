// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FoldersIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FoldersIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7 3.5h3.3q.65 0 1.1.5l1.2 1.3q.45.5 1.1.5h5.7q1.6 0 1.6 1.6v8.2"/><path d="M3.1 9.3q0-1.7 1.7-1.7H8q.7 0 1.15.5l1.2 1.3q.45.5 1.15.5h5.4q1.7 0 1.7 1.7V19q0 1.7-1.7 1.7H4.8q-1.7 0-1.7-1.7Z"/>
        {children}
      </svg>
    );
  },
);
