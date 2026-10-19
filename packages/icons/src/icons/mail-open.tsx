// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MailOpenIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MailOpenIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.3 9.4 7.6-5.6q1.1-.8 2.2 0l7.6 5.6v9.4q0 1.8-1.8 1.8H5.1q-1.8 0-1.8-1.8Z"/><path d="m3.5 9.8 7.3 5.1q1.2.8 2.4 0l7.3-5.1"/>
        {children}
      </svg>
    );
  },
);
