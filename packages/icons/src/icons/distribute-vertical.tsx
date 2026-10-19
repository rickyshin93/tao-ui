// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const DistributeVerticalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function DistributeVerticalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.2 3.2h15.6M4.2 20.8h15.6"/><rect x="8" y="6.3" width="8" height="2.6" rx="0.5" fill="currentColor" stroke="none"/><rect x="5.4" y="10.7" width="13.2" height="2.6" rx="0.5" fill="currentColor" stroke="none"/><rect x="8" y="15.1" width="8" height="2.6" rx="0.5" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
