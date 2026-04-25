import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const courseDetailsStyles = () => {
    return (
        StyleSheet.create({
            safeArea: {
                flex: 1,
            },
            contentContainer: {
                gap: 18,
                paddingBottom: 48,
                paddingHorizontal: 18,
                paddingTop: 16,
            },
            heroShell: {
                borderRadius: Radius.xl,
                minHeight: 340,
                overflow: 'hidden',
            },
            heroImage: {
                height: 340,
                width: '100%',
            },
            heroOverlay: {
                ...StyleSheet.absoluteFillObject,
            },
            heroContent: {
                bottom: 20,
                gap: 12,
                left: 20,
                position: 'absolute',
                right: 20,
            },
            levelPill: {
                alignSelf: 'flex-start',
                borderRadius: Radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 8,
            },
            bookmarkButton: {
                position: 'absolute',
                right: 16,
                top: 16,
            },
            metaRow: {
                flexDirection: 'row',
                gap: 12,
            },
            metaCard: {
                alignItems: 'flex-start',
                borderRadius: Radius.lg,
                borderWidth: 1,
                flex: 1,
                gap: 8,
                padding: 16,
            },
            panel: {
                borderRadius: Radius.xl,
                borderWidth: 1,
                gap: 16,
                padding: 20,
            },
            progressRow: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            instructorRow: {
                flexDirection: 'row',
                gap: 14,
            },
            instructorAvatar: {
                borderRadius: 30,
                height: 60,
                width: 60,
            },
            instructorCopy: {
                flex: 1,
                gap: 4,
            },
            actionStack: {
                gap: 12,
            },
            errorCard: {
                borderRadius: Radius.xl,
                borderWidth: 1,
                gap: 14,
                margin: 18,
                padding: 22,
            },
        })
    )
}
