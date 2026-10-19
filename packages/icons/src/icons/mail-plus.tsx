// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MailPlusIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MailPlusIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M20.9 10.3V6.9q0-1.8-1.8-1.8H4.9q-1.8 0-1.8 1.8v10.2q0 1.8 1.8 1.8h6.3"/><path d="m3.8 6.1 7.1 6q1.1.9 2.2 0l7.1-6"/><path d="M17.3 13.2v7M13.8 16.7h7"/>
        {children}
      </svg>
    );
  },
);
