// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FlipHorizontalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FlipHorizontalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.2v3.1m0 4.2v3m0 4.2v3.1M3.5 6.4l5.3 3.4v7.8H3.5ZM20.5 6.4l-5.3 3.4v7.8h5.3Z"/>
        {children}
      </svg>
    );
  },
);
