import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const profileScreenStyles = () => (
    StyleSheet.create({
        safeArea: {
            flex: 1,
            // paddingTop:22,
            paddingBottom: 12
        },
        contentContainer: {
            gap: 18,
            paddingBottom: 100,
            paddingHorizontal: 18,
            paddingTop: 32,
        },
        heroCard: {
            borderRadius: Radius.xl,
            gap: 18,
            overflow: 'hidden',
            padding: 22,
        },
        heroTopRow: {
            gap: 18,
        },
        identityRow: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 16,
        },
        avatar: {
            borderRadius: 44,

            height: 88,
            width: 88,
        },
        identityCopy: {
            flex: 1,
            gap: 4,
        },
        heroActions: {
            gap: 12,
        },
        statsRow: {
            flexDirection: 'row',
            gap: 12,
        },
        customStackStyles:{
            justifyContent:"center",
            alignItems:"center",
        },
        panel: {
            borderRadius: Radius.xl,
            borderWidth: 1,
            gap: 18,
            padding: 20,
        },
        panelHeader: {
            flexDirection: 'row',
            gap: 14,
        },
        iconShell: {
            alignItems: 'center',
            borderRadius: Radius.md,
            height: 44,
            justifyContent: 'center',
            width: 44,
        },
        panelCopy: {
            flex: 1,
            gap: 4,
        },
        detailRow: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            gap: 6,
            paddingBottom: 14,
        },
        settingsRow: {
            alignItems: 'center',
            borderBottomWidth: StyleSheet.hairlineWidth,
            flexDirection: 'row',
            gap: 14,
            justifyContent: 'space-between',
            minHeight: 64,
            paddingBottom: 14,
        },
        settingsButton: {
            borderBottomWidth: 0,
            paddingBottom: 0,
        },
        settingsCopy: {
            flex: 1,
            gap: 4,
        },
    })
)

