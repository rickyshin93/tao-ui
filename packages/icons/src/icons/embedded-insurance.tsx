// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const EmbeddedInsuranceIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function EmbeddedInsuranceIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.5" y="3.5" width="17" height="17" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/>
        {children}
      </svg>
    );
  },
);
