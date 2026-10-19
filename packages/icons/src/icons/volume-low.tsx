// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const VolumeLowIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function VolumeLowIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.15 8.25 12.6 4.7q.7-.55.7.35v13.9q0 .9-.7.35l-4.45-3.55H4.6q-1.2 0-1.2-1.2v-5.1q0-1.2 1.2-1.2Z"/><path d="M17 8.6a5 5 0 0 1 0 6.8"/>
        {children}
      </svg>
    );
  },
);
