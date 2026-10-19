// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AccessibilityIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AccessibilityIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="5.2" r="2.1"/><path d="m4 9.3 8 1.5 8-1.5M12 10.8v3.7m-4 6.4 4-6.4 4 6.4"/>
        {children}
      </svg>
    );
  },
);
