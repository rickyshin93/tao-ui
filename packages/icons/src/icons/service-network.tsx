// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ServiceNetworkIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ServiceNetworkIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M15.5 3.5a5.5 5.5 0 0 0-6.7 7.2l-5.3 5.5a2.8 2.8 0 0 0 4 4l5.5-5.3a5.5 5.5 0 0 0 7.5-6.4l-4 2-4-4 3-3Z"/>
        {children}
      </svg>
    );
  },
);
