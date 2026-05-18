import React, { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Polygon, G } from 'react-native-svg';

// Hash a string to a number
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// 8 geometric pattern generators
const patterns = [
  // 0: Mountain silhouette
  (size, color) => (
    <G opacity={0.3}>
      <Path d={`M0 ${size} L${size * 0.3} ${size * 0.3} L${size * 0.5} ${size * 0.55} L${size * 0.7} ${size * 0.2} L${size} ${size} Z`} fill={color} />
      <Path d={`M${size * 0.1} ${size} L${size * 0.4} ${size * 0.5} L${size * 0.6} ${size * 0.65} L${size * 0.85} ${size * 0.35} L${size} ${size * 0.7} L${size} ${size} Z`} fill={color} opacity={0.5} />
    </G>
  ),
  // 1: Mandala rings
  (size, color) => (
    <G opacity={0.3}>
      {[0.4, 0.3, 0.2, 0.12].map((r, i) => (
        <Circle key={i} cx={size / 2} cy={size / 2} r={size * r} fill="none" stroke={color} strokeWidth={1.5} />
      ))}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = size / 2 + Math.cos(rad) * size * 0.25;
        const y = size / 2 + Math.sin(rad) * size * 0.25;
        return <Circle key={`d${i}`} cx={x} cy={y} r={size * 0.03} fill={color} />;
      })}
    </G>
  ),
  // 2: Wave lines
  (size, color) => (
    <G opacity={0.3}>
      {[0.25, 0.4, 0.55, 0.7, 0.85].map((y, i) => (
        <Path key={i} d={`M0 ${size * y} Q${size * 0.25} ${size * (y - 0.08)} ${size * 0.5} ${size * y} Q${size * 0.75} ${size * (y + 0.08)} ${size} ${size * y}`} fill="none" stroke={color} strokeWidth={2} />
      ))}
    </G>
  ),
  // 3: Hexagon grid
  (size, color) => {
    const hexSize = size * 0.12;
    const hexes = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * hexSize * 1.8 + (row % 2 === 0 ? hexSize : hexSize * 1.9) + size * 0.1;
        const y = row * hexSize * 1.6 + size * 0.15;
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          points.push(`${x + hexSize * Math.cos(angle)},${y + hexSize * Math.sin(angle)}`);
        }
        hexes.push(<Polygon key={`${row}-${col}`} points={points.join(' ')} fill="none" stroke={color} strokeWidth={1.2} />);
      }
    }
    return <G opacity={0.3}>{hexes}</G>;
  },
  // 4: Concentric circles
  (size, color) => (
    <G opacity={0.3}>
      {[0.42, 0.34, 0.26, 0.18, 0.1].map((r, i) => (
        <Circle key={i} cx={size / 2} cy={size / 2} r={size * r} fill="none" stroke={color} strokeWidth={i === 2 ? 2.5 : 1.2} />
      ))}
    </G>
  ),
  // 5: Diamond lattice
  (size, color) => {
    const diamonds = [];
    const step = size * 0.18;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const cx = col * step + step;
        const cy = row * step + step;
        const s = step * 0.35;
        diamonds.push(
          <Polygon key={`${row}-${col}`} points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`} fill="none" stroke={color} strokeWidth={1} />
        );
      }
    }
    return <G opacity={0.3}>{diamonds}</G>;
  },
  // 6: Prayer flag triangles
  (size, color) => (
    <G opacity={0.3}>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = i * size * 0.2;
        const colors = ['#6366F1', '#F4A261', '#2D6A4F', '#0F172A', '#6366F1'];
        return (
          <G key={i}>
            <Rect x={x} y={size * 0.2} width={size * 0.2} height={size * 0.15} fill={colors[i]} opacity={0.4} />
            <Polygon points={`${x + size * 0.1},${size * 0.35} ${x},${size * 0.55} ${x + size * 0.2},${size * 0.55}`} fill={colors[i]} opacity={0.3} />
          </G>
        );
      })}
      <Path d={`M0 ${size * 0.2} L${size} ${size * 0.2}`} stroke={color} strokeWidth={2} />
    </G>
  ),
  // 7: Lotus petals
  (size, color) => (
    <G opacity={0.3}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.22;
        const px = cx + Math.cos(rad) * r;
        const py = cy + Math.sin(rad) * r;
        return (
          <Path key={i} d={`M${cx} ${cy} Q${cx + Math.cos(rad - 0.4) * r * 0.7} ${cy + Math.sin(rad - 0.4) * r * 0.7} ${px} ${py} Q${cx + Math.cos(rad + 0.4) * r * 0.7} ${cy + Math.sin(rad + 0.4) * r * 0.7} ${cx} ${cy}`} fill={color} opacity={0.5} />
        );
      })}
      <Circle cx={size / 2} cy={size / 2} r={size * 0.06} fill={color} />
    </G>
  ),
];

export default function AvatarGenerator({ userId = '', size = 64, style }) {
  const { hue, patternIndex, gradientColors } = useMemo(() => {
    const hash = hashString(String(userId));
    const h = hash % 360;
    const pIdx = hash % 8;

    // Generate harmonious gradient from hue
    const c1 = `hsl(${h}, 70%, 55%)`;
    const c2 = `hsl(${(h + 40) % 360}, 65%, 40%)`;

    return { hue: h, patternIndex: pIdx, gradientColors: [c1, c2] };
  }, [userId]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
      <Defs>
        <LinearGradient id={`grad-${userId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gradientColors[0]} />
          <Stop offset="100%" stopColor={gradientColors[1]} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={size} height={size} rx={size * 0.15} fill={`url(#grad-${userId})`} />
      {patterns[patternIndex](size, '#ffffff')}
    </Svg>
  );
}
