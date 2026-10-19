// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const VideoIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function VideoIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="4.2" width="17.6" height="16.3" rx="1.8"/><path d="M3.4 8.8h17.2M7.3 4.4l2.5 4.2m3.7-4.2L16 8.6"/>
        {children}
      </svg>
    );
  },
);
