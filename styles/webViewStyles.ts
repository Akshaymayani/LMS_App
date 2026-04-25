import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const webViewStyles = () => (
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    webviewShell: {
      borderRadius: Radius.xl,
      borderWidth: 1,
      flex: 1,
      margin: 18,
      overflow: 'hidden',
    },
    header: {
      gap: 4,
      paddingHorizontal: 18,
      paddingTop: 18,
    },
    webview: {
      flex: 1,
      marginTop: 14,
    },
    loading: {
      alignItems: 'center',
      flex: 1,
      gap: 12,
      justifyContent: 'center',
    },
  })
)
