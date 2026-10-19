// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BatteryChargingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BatteryChargingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7.7 7.05H4.9q-1.8 0-1.8 1.8v6.3q0 1.8 1.8 1.8h2.7M15.2 7.05H17q1.8 0 1.8 1.8v6.3q0 1.8-1.8 1.8h-2.3M21.1 10.35v3.3M12.9 3.8l-5 8.1H12l-1.1 8.3 5.2-9.2H12Z"/>
        {children}
      </svg>
    );
  },
);
