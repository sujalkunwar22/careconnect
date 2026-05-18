import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCcw } from 'lucide-react-native';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CareConnect Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 items-center justify-center bg-surface px-10">
                    <View className="w-20 h-20 bg-error/10 rounded-full items-center justify-center mb-6">
                        <AlertCircle size={40} color="#EF4444" />
                    </View>
                    <Text className="text-2xl font-poppins-700 text-text-primary mb-3 text-center">
                        Something went wrong
                    </Text>
                    <Text className="text-sm font-poppins-400 text-text-secondary text-center mb-10 leading-6">
                        An unexpected error occurred. Our team has been notified. Please try restarting the app.
                    </Text>

                    <TouchableOpacity
                        onPress={() => this.setState({ hasError: false })}
                        className="flex-row items-center bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/30"
                    >
                        <RefreshCcw size={18} color="white" />
                        <Text className="text-white font-poppins-600 ml-2">Reload Application</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
