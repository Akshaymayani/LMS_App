import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const loginPageStyles = () => {
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
        justifyContent: 'center',
        paddingHorizontal: 20,
      },
      heroStack: {
        gap: 20,
      },
      heroCard: {
        borderRadius: Radius.xl,
        gap: 16,
        overflow: 'hidden',
        padding: 24,
      },
      heroEyebrow: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: Radius.pill,
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
      heroBody: {
        maxWidth: 540,
      },
      heroStatRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
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
      formFields: {
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
