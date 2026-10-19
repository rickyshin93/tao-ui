// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceTaxIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceTaxIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="6.5" cy="6.5" r="2.7"/><circle cx="17.5" cy="17.5" r="2.7"/><path d="M4.5 19.5 19.5 4.5"/>
        {children}
      </svg>
    );
  },
);
