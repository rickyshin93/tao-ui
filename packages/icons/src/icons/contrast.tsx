// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ContrastIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ContrastIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.9"/><path d="M12 3.1v17.8M12 8h7.7M12 12h8.9M12 16h7.7"/>
        {children}
      </svg>
    );
  },
);
