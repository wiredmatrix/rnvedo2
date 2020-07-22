import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CameraComponent from './src/cameraComponent';
import VideoGallery from './src/VideoGallery';

const Stack = createStackNavigator();
export default class App extends React.Component {
    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name='Camera'
                        component={CameraComponent} 
                    />

                    <Stack.Screen
                        name='VideoGallery'
                        component={VideoGallery} 
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    };
};