import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
  size?: number
  color?: string
  strokeWidth?: number
}

/** Lata con el mismo estilo de trazo que los íconos de lucide (que no trae una). */
export function IconoLata({ size = 24, color = '#000', strokeWidth = 2 }: Props) {
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
      {/* Cuerpo */}
      <Path d="M7 5.5C7 4.1 8.1 3 9.5 3h5C15.9 3 17 4.1 17 5.5v13c0 1.4-1.1 2.5-2.5 2.5h-5C8.1 21 7 19.9 7 18.5z" />
      {/* Bordes de arriba y abajo */}
      <Path d="M7 7h10" />
      <Path d="M7 17h10" />
      {/* Anillita para abrir */}
      <Path d="M11 3V2h2" />
    </Svg>
  )
}
