// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AlignBottomIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AlignBottomIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 20.1h17"/><rect x="5.7" y="4" width="4.6" height="12" rx="1"/><rect x="13.7" y="8.6" width="4.6" height="7.4" rx="1"/>
        {children}
      </svg>
    );
  },
);
