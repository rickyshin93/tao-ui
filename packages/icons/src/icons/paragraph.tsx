// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ParagraphIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ParagraphIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19.8 4.3H9.5a4.3 4.3 0 0 0 0 8.6h2.7M12.2 4.5v15.2M17.2 4.5v15.2"/>
        {children}
      </svg>
    );
  },
);
