import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

export interface LogoProps {
  size?: number;
  showBackground?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  showBackground = true,
  style,
}) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 1024 1024">
        {showBackground ? (
          <Rect width="1024" height="1024" rx="224" fill="#FFFFFF" />
        ) : null}
        {/* Retail bag body in official D&G green */}
        <Path d="M252 390h520l-36 370H288l-36-370Z" fill="#16834A" />

        {/* Bag handle */}
        <Path
          d="M398 405v-49c0-75 49-121 114-121s114 46 114 121v49"
          fill="none"
          stroke="#70C18A"
          strokeWidth="48"
          strokeLinecap="round"
        />

        {/* D&G typography letterforms */}
        <Path
          d="M365 493h61c57 0 94 31 94 82s-37 82-94 82h-61V493Zm52 44v76h10c26 0 41-13 41-38s-15-38-41-38h-10Zm200 27c-11-12-24-18-41-18-28 0-49 21-49 50s21 50 49 50c10 0 19-3 27-9v-20h-34v-42h84v84c-20 26-47 39-82 39-58 0-102-43-102-102s44-102 102-102c38 0 68 14 89 40l-43 34Z"
          fill="#FFFFFF"
        />

        {/* Customer satisfaction smile curve in D&G Orange accent */}
        <Path
          d="M397 684c58 43 172 43 230 0"
          fill="none"
          stroke="#F28C28"
          strokeWidth="28"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
