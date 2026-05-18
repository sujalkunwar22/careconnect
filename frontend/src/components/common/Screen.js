import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

const Screen = ({
  children,
  scrollable = false,
  safeArea = true,
  className = '',
  contentContainerClassName = '',
  keyboardAvoiding = true,
  refreshControl,
  maxContentWidth = 1120,
  fullWidth = false,
  noPadding = false,
}) => {
  const Container = safeArea ? SafeAreaView : View;
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 1280 ? 36 : width >= 1024 ? 28 : width >= 768 ? 24 : 16;

  const contentWrapperStyle = {
    width: '100%',
    maxWidth: fullWidth ? '100%' : maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: noPadding ? 0 : horizontalPadding,
    paddingVertical: noPadding ? 0 : 16,
  };

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="always"
      refreshControl={refreshControl}
    >
      <View style={contentWrapperStyle} className={twMerge('flex-1', contentContainerClassName)}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View style={contentWrapperStyle} className={twMerge('flex-1', contentContainerClassName)}>
      {children}
    </View>
  );

  const wrapper = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <Container 
      style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF' // Default surface color
      }}
    >
      {wrapper}
    </Container>
  );
};

export default Screen;
