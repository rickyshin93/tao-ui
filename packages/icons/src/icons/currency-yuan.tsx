// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CurrencyYuanIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CurrencyYuanIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m5 4 7 8 7-8M12 12v8.6M6.6 12.3h10.8M6.6 16.6h10.8"/>
        {children}
      </svg>
    );
  },
);
