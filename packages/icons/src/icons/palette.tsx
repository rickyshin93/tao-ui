// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PaletteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PaletteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.3a8.7 8.7 0 1 0 0 17.4h1.1q1.7 0 1.7-1.7 0-.8-.8-1.6-.9-.8-.9-1.7 0-1.7 1.9-1.7h2.7q3 0 3-3.1c0-4.3-3.9-7.6-8.7-7.6Z"/><circle cx="7.4" cy="10.1" r="1.2" fill="currentColor" stroke="none"/><circle cx="11.5" cy="7.2" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.3" cy="9" r="1.2" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
