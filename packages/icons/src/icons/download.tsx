// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const DownloadIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function DownloadIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.3v12.2M7.4 11.1l4.2 4.2q.4.4.8 0l4.2-4.2"/><path d="M4 15.75v3q0 1.75 1.75 1.75h12.5q1.75 0 1.75-1.75v-3"/>
        {children}
      </svg>
    );
  },
);
