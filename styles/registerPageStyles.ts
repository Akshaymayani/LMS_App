import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const registerPageStyles = () => {
    return (
        StyleSheet.create({
            safeArea: {
                flex: 1,
            },
            flex: {
                flex: 1,
            },
            scrollContent: {
                flexGrow: 1,
                gap: 20,
                justifyContent: 'center',
                padding: 20,
            },
            hero: {
                borderRadius: Radius.xl,
                gap: 16,
                padding: 24,
            },
            heroLabel: {
                alignItems: 'center',
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: Radius.pill,
                flexDirection: 'row',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
            },
            formCard: {
                borderRadius: Radius.xl,
                borderWidth: 1,
                gap: 18,
                padding: 22,
            },
            formHeader: {
                gap: 8,
            },
            fieldGroup: {
                gap: 16,
            },
            switchLink: {
                alignItems: 'center',
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
            },
        })
    )
}
