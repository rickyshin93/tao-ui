// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SigmaIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SigmaIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M18.4 4.5H5.6l7 7.5-7 7.5h12.8"/>
        {children}
      </svg>
    );
  },
);
