// src/components/Logo.tsx
import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ThemeContext, themeStyles } from '../context/ThemeContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  type?: 'emoji' | 'image';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true,
  type = 'emoji'
}) => {
  const { theme } = useContext(ThemeContext);
  const colors = themeStyles[theme];

  const sizeMap = {
    small: { logo: 30, text: 20 },
    medium: { logo: 50, text: 32 },
    large: { logo: 80, text: 48 }
  };

  const currentSize = sizeMap[size];

  return (
    <View style={styles.container}>
      {type === 'emoji' ? (
        <Text style={[styles.emojiLogo, { fontSize: currentSize.logo }]}>
          🦓
        </Text>
      ) : (
        <Image
          source={require('../../assets/images/logo.png')}
          style={[styles.imageLogo, { 
            width: currentSize.logo, 
            height: currentSize.logo 
          }]}
          resizeMode="contain"
        />
      )}
      
      {showText && (
        <Text style={[
          styles.text, 
          { 
            color: colors.text,
            fontSize: currentSize.text
          }
        ]}>
          Zoo-Tiles
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiLogo: {
    marginRight: 10,
  },
  imageLogo: {
    marginRight: 10,
  },
  text: {
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default Logo;