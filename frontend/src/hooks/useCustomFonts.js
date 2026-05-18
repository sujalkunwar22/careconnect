import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
    MaterialSymbolsOutlined_400Regular
} from '@expo-google-fonts/material-symbols-outlined';

export const useCustomFonts = () => {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        'Material Symbols Outlined': MaterialSymbolsOutlined_400Regular,
    });

    return fontsLoaded;
};
