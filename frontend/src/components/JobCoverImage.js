import React, { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, G, Path, Circle } from 'react-native-svg';
import { Briefcase, Heart, BookOpen, Brain, Stethoscope, Settings, FlaskConical, HelpCircle } from 'lucide-react-native';
import { View } from 'react-native';

const categoryConfig = {
  nursing: { colors: ['#6366F1', '#C1121F'], label: 'Nursing' },
  public_health: { colors: ['#2D6A4F', '#1B4332'], label: 'Public Health' },
  community_health: { colors: ['#F4A261', '#E76F51'], label: 'Community Health' },
  mental_health: { colors: ['#7B2CBF', '#5A189A'], label: 'Mental Health' },
  clinical: { colors: ['#0077B6', '#023E8A'], label: 'Clinical' },
  administrative: { colors: ['#0F172A', '#0D1B2A'], label: 'Administrative' },
  research: { colors: ['#2D6A4F', '#40916C'], label: 'Research' },
  other: { colors: ['#6C757D', '#495057'], label: 'Other' },
};

const CategoryIcon = ({ category, size = 28, color = '#ffffff' }) => {
  const icons = {
    nursing: Stethoscope,
    public_health: Heart,
    community_health: Heart,
    mental_health: Brain,
    clinical: Stethoscope,
    administrative: Settings,
    research: FlaskConical,
    other: Briefcase,
  };
  const Icon = icons[category] || Briefcase;
  return <Icon size={size} color={color} />;
};

export default function JobCoverImage({ category = 'other', width = 300, height = 120, style }) {
  const config = categoryConfig[category] || categoryConfig.other;

  return (
    <View style={[{ width, height, borderRadius: 12, overflow: 'hidden', position: 'relative' }, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={`jcg-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={config.colors[0]} />
            <Stop offset="100%" stopColor={config.colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#jcg-${category})`} />
        {/* Decorative circles */}
        <Circle cx={width * 0.85} cy={height * 0.3} r={height * 0.4} fill="#ffffff" opacity={0.08} />
        <Circle cx={width * 0.75} cy={height * 0.7} r={height * 0.25} fill="#ffffff" opacity={0.06} />
        {/* Decorative wave */}
        <Path
          d={`M0 ${height * 0.7} Q${width * 0.25} ${height * 0.5} ${width * 0.5} ${height * 0.7} Q${width * 0.75} ${height * 0.9} ${width} ${height * 0.65} L${width} ${height} L0 ${height} Z`}
          fill="#ffffff"
          opacity={0.06}
        />
      </Svg>
      <View style={{
        position: 'absolute', right: 16, top: '50%',
        transform: [{ translateY: -14 }], opacity: 0.3,
      }}>
        <CategoryIcon category={category} size={28} color="#ffffff" />
      </View>
    </View>
  );
}

export { categoryConfig, CategoryIcon };
