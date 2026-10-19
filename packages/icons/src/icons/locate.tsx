// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LocateIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LocateIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="5.4"/><path d="M12 2.9v3.7M12 17.4v3.7M2.9 12h3.7M17.4 12h3.7"/>
        {children}
      </svg>
    );
  },
);
