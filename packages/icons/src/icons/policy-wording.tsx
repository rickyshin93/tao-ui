// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyWordingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyWordingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 6q-4-3-9-2v15q5-1 9 2 4-3 9-2V4q-5-1-9 2ZM12 6v15"/>
        {children}
      </svg>
    );
  },
);
