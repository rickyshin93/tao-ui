// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PinOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PinOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 3.5l17 17M10 3.5h5M14 3.5v5l3.5 5v2M8.3 10.2l-1.8 3.3v2h7.1M12 15.5v5"/>
        {children}
      </svg>
    );
  },
);
