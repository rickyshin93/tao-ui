// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AudioWaveformIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AudioWaveformIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 10v4M7.75 6v12M12 3.5v17M16.25 8v8M20.5 5.2v13.6"/>
        {children}
      </svg>
    );
  },
);
