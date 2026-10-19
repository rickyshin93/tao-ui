// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MicIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MicIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="8.6" y="3.2" width="6.8" height="11.1" rx="3.4"/><path d="M5.5 10.7v.9a6.5 6.5 0 0 0 13 0v-.9M12 18.1v3M8.7 21.1h6.6"/>
        {children}
      </svg>
    );
  },
);
