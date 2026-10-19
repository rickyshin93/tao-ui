// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PictureInPictureIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PictureInPictureIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="1.8"/><rect x="11.3" y="11" width="6.2" height="5.4" rx="0.8"/>
        {children}
      </svg>
    );
  },
);
