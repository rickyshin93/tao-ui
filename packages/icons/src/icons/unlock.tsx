// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UnlockIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UnlockIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5.4" y="10.1" width="13.2" height="10.5" rx="1.8"/><path d="M8 9.9V7.3q0-4 4-4 3.7 0 4 3.5M12 14.1v2.7"/>
        {children}
      </svg>
    );
  },
);
