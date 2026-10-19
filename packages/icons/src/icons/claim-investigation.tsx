// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimInvestigationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimInvestigationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="14" cy="9.5" r="6"/><path d="m9.5 14-6 6"/>
        {children}
      </svg>
    );
  },
);
