import { useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet, View } from "react-native";
import { AppText } from "./app/app-text";

export function DetailRow({ label, value }: { label: string; value: string }) {
    const { colors } = useAppTheme();

    return (
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <AppText variant="caption" tone="muted">
                {label}
            </AppText>
            <AppText>{value}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    detailRow: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 6,
        paddingBottom: 14,
    }
});