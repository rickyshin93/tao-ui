// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BriefcaseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BriefcaseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.1" y="7.25" width="17.8" height="13.1" rx="1.8"/><path d="M8.2 7.05V4.85q0-1.2 1.2-1.2h5.2q1.2 0 1.2 1.2v2.2M3.35 12.3q8.65 4.05 17.3 0M12 12.1v3.8"/>
        {children}
      </svg>
    );
  },
);
