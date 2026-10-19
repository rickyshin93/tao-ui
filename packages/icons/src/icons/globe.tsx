// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const GlobeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function GlobeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.9"/><path d="M3.3 12h17.4M12 3.1c-5.5 5.1-5.5 12.7 0 17.8 5.5-5.1 5.5-12.7 0-17.8Z"/>
        {children}
      </svg>
    );
  },
);
