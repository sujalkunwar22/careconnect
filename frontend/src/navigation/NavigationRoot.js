import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './RootNavigator';

const NavigationRoot = () => {
  console.log('[NavigationRoot] Rendering NavigationContainer');
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default React.memo(NavigationRoot);
