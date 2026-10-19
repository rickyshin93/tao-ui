// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MouseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MouseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="6.5" y="3.1" width="11" height="17.8" rx="5.5"/><path d="M12 6.3v3.4"/>
        {children}
      </svg>
    );
  },
);
