// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WebhookIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WebhookIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.9 8.1a3.5 3.5 0 1 1 6.2 0M14.3 16.5a3.5 3.5 0 1 1 3 4.2M6.7 20.7a3.5 3.5 0 1 1 3-4.2M12 6.5l5.3 10.7M6.7 17.2h10.6M6.7 17.2l3-6"/>
        {children}
      </svg>
    );
  },
);
