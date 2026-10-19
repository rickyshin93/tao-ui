// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PipetteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PipetteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m13.8 7.6-8.2 8.2-.9 3.5 3.5-.9 8.2-8.2M12.4 6.2l5.4 5.4M14.3 6.6l1.9-1.9a2.7 2.7 0 0 1 3.8 3.8l-1.9 1.9"/>
        {children}
      </svg>
    );
  },
);
