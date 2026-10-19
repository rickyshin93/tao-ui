// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceCyberIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceCyberIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="7" y="7" width="10" height="10" rx="1.8"/><path d="M3 12h4M17 12h4M12 3v4M12 17v4"/>
        {children}
      </svg>
    );
  },
);
