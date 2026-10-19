// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ProducerLicenseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ProducerLicenseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="5" width="16" height="14" rx="2"/><path d="m8 12 3 3 5-6"/>
        {children}
      </svg>
    );
  },
);
