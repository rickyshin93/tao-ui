// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ShareIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ShareIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="5.4" cy="12" r="2.3"/><circle cx="18.1" cy="5.1" r="2.3"/><circle cx="18.1" cy="18.9" r="2.3"/><path d="m7.45 10.9 8.6-4.7m-8.6 6.9 8.6 4.7"/>
        {children}
      </svg>
    );
  },
);
