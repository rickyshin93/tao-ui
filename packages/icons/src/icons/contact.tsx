// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ContactIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ContactIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="3" width="16" height="18" rx="1.8"/><circle cx="12" cy="9" r="2.5"/><path d="M8 17c0-2.2 1.4-3.5 4-3.5s4 1.3 4 3.5M2.5 7H5M2.5 12H5M2.5 17H5"/>
        {children}
      </svg>
    );
  },
);
