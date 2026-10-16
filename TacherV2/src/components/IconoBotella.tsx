import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
  size?: number
  color?: string
  strokeWidth?: number
}

/** Botella con el mismo estilo de trazo que los íconos de lucide (que no trae una). */
export function IconoBotella({ size = 24, color = '#000', strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M10 2h4" />
      <Path d="M10 2v3l-2 2.5V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7.5L14 5V2" />
      <Path d="M8 12h8" />
      <Path d="M8 16h8" />
    </Svg>
  )
}
