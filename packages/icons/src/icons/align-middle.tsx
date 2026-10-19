// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AlignMiddleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AlignMiddleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5.4" y="4" width="4.6" height="16" rx="1"/><rect x="14" y="7.4" width="4.6" height="9.2" rx="1"/><path d="M3.2 12h2M10.2 12h3.6M18.8 12h2"/>
        {children}
      </svg>
    );
  },
);
