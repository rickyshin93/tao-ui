// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const VideoCallIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function VideoCallIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.1" y="6.3" width="12.2" height="11.4" rx="1.8"/><path d="m15.5 9.5 5.4-2.8v10.6l-5.4-2.8"/>
        {children}
      </svg>
    );
  },
);
