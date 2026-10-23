import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ImageStyle,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { colors, borderRadius } from '../../theme';

// In-memory registry to avoid redundant Image.prefetch calls
const prefetchedUrls = new Set<string>();

export interface CachedImageProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fallbackText?: string;
  showLoader?: boolean;
}

/**
 * CachedImage component
 * Compatible with React Native 0.88.0 and React 19.3.0.
 *
 * Performance features:
 * - Employs native `cache: 'force-cache'` to store decoded image data in local disk cache.
 * - Proactively invokes native `Image.prefetch(uri)` for instant background warming.
 * - Memory tracking to prevent duplicate prefetch tasks across list items.
 * - Smooth opacity transition on initial decode.
 * - Clean fallback placeholder with initials or branding for missing or failed images.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  style,
  containerStyle,
  resizeMode = 'cover',
  fallbackText = 'D&G',
  showLoader = true,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!uri) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setIsLoading(true);
    fadeAnim.setValue(0);

    // Warm native disk cache if not already done
    if (!prefetchedUrls.has(uri)) {
      Image.prefetch(uri)
        .then(() => {
          prefetchedUrls.add(uri);
        })
        .catch(() => {
          // Soft ignore prefetch errors; main Image component will attempt standard load
        });
    }
  }, [uri, fadeAnim]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!uri || hasError) {
    return (
      <View style={[styles.placeholderContainer, containerStyle, style as StyleProp<ViewStyle>]}>
        <Text style={styles.placeholderText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {isLoading && showLoader && (
        <View style={[styles.loaderContainer, style as StyleProp<ViewStyle>]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      <Animated.Image
        source={{
          uri,
          cache: 'force-cache',
        }}
        style={[
          style,
          {
            opacity: fadeAnim,
          },
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
});
