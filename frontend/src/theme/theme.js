export const COLORS = {
    // Primary: Modern Indigo (Trust, Premium)
    primary: "#6366F1",
    primary_container: "#818CF8",
    on_primary: "#ffffff",
    on_primary_fixed: "#1e1b4b",
    primary_fixed: "#E0E7FF",
    primary_fixed_dim: "#A5B4FC",
    inverse_primary: "#A5B4FC",
    
    // Secondary: Teal (Care, Growth)
    secondary: "#14B8A6",
    secondary_container: "#5EEAD4",
    on_secondary: "#ffffff",
    on_secondary_fixed: "#042f2e",
    secondary_fixed: "#CCFBF1",
    secondary_fixed_dim: "#99F6E4",
    
    // Tertiary: Amber (Warmth, Action)
    tertiary: "#F59E0B",
    tertiary_container: "#FCD34D",
    on_tertiary: "#ffffff",
    on_tertiary_fixed: "#451a03",
    tertiary_fixed: "#FEF3C7",
    tertiary_fixed_dim: "#FDE68A",
    
    // Status colors
    error: "#EF4444",
    on_error: "#ffffff",
    error_container: "#FEE2E2",
    success: "#10B981",
    warning: "#F59E0B",
    
    // Surface colors
    background: "#F8FAFC",
    surface: "#F8FAFC",
    surface_bright: "#FFFFFF",
    surface_dim: "#E2E8F0",
    surface_container_lowest: "#ffffff",
    surface_container_low: "#F1F5F9",
    surface_container: "#E2E8F0",
    surface_container_high: "#CBD5E1",
    surface_container_highest: "#94A3B8",
    inverse_surface: "#1E293B",
    surface_tint: "#6366F1",
    surface_variant: "#F1F5F9",
    
    // Text/On colors
    on_background: "#0F172A",
    on_surface: "#0F172A",
    on_surface_variant: "#475569",
    inverse_on_surface: "#F8FAFC",
    
    // Outline
    outline: "#94A3B8",
    outline_variant: "#E2E8F0",
    
    neutral: {
        background: "#F8FAFC",
        surface: "#ffffff",
        surface_secondary: "#F1F5F9",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        textTertiary: "#94A3B8",
        border: "#E2E8F0",
        disabled: "#CBD5E1",
        divider: "#F1F5F9",
    }
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const SHADOWS = {
    soft: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5.46,
        elevation: 5,
    }
};

export const BORDER_RADIUS = {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    full: 9999,
};
