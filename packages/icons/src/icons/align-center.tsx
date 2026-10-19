// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AlignCenterIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AlignCenterIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.2 5.4h15.6M7.1 9.8h9.8M4.2 14.2h15.6M7.1 18.6h9.8"/>
        {children}
      </svg>
    );
  },
);
