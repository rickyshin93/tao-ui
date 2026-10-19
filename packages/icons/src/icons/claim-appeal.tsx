// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimAppealIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimAppealIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.5c-5.2 0-8.5 3-8.5 7.5 0 2.1.8 3.9 2.3 5.2L4 20.5l5.4-2.2c.8.2 1.7.2 2.6.2 5.2 0 8.5-3 8.5-7.5S17.2 3.5 12 3.5Z"/>
        {children}
      </svg>
    );
  },
);
