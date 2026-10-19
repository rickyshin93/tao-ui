// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ContainerIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ContainerIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="2.5" y="6" width="19" height="13" rx="1.8"/><path d="M7 10v5M12 10v5M17 10v5M6 3v3M18 3v3"/>
        {children}
      </svg>
    );
  },
);
