// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ApplicantIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ApplicantIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="9" cy="7" r="3.5"/><path d="M3 21v-2q0-5 6-5h3M17 13h4v8h-4Z"/>
        {children}
      </svg>
    );
  },
);
