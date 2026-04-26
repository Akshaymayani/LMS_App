import { Radius } from "@/constants/theme";
import { StyleSheet } from "react-native";

const CatalogPageStyles = () => (
    StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        contentContainer: {
            paddingBottom: 128,
            paddingHorizontal: 18,
            paddingTop: 12,
        },
        headerWrap: {
            gap: 22,
            marginBottom: 20,
        },
        hero: {
            borderRadius: Radius.xl,
            gap: 18,
            overflow: 'hidden',
            padding: 22,
        },
        heroPill: {
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.16)',
            borderRadius: Radius.pill,
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        statGrid: {
            // flexDirection: 'row',
            gap: 12,
        },
        customStackGrid: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 22
        },
        searchShell: {
            alignItems: 'center',
            borderRadius: Radius.lg,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 12,
            minHeight: 58,
            paddingHorizontal: 16,
        },
        searchInput: {
            color: '#FFFFFF',
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
            minHeight: 54,
        },
        offlineBadge: {
            backgroundColor: 'rgba(0,0,0,0.16)',
            borderRadius: Radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        featuredStrip: {
            marginHorizontal: -4,
        },
        featuredRow: {
            flexDirection: 'row',
            gap: 14,
            paddingHorizontal: 4,
        },
        featuredCard: {
            borderRadius: Radius.xl,
            borderWidth: 1,
            overflow: 'hidden',
            width: 260,
        },
        featuredImage: {
            height: 148,
            width: '100%',
        },
        featuredCopy: {
            gap: 10,
            padding: 16,
        },
        featuredMeta: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        emptyState: {
            alignItems: 'center',
            borderRadius: Radius.xl,
            borderWidth: 1,
            gap: 12,
            marginTop: 18,
            padding: 24,
        },
        emptyFeatured: {
            alignItems: 'center',
            borderRadius: Radius.xl,
            borderWidth: 1,
            gap: 12,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 24,
            padding: 24,
        },
        featuredLoading: {
            height: 220,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 16,
            marginVertical: 12,
        },
        centerText: {
            textAlign: 'center',
        },
        footerLoader: {
            paddingBottom: 120,
            paddingTop: 12,
        },
        footerSpace: {
            height: 120,
        },
    })

)

export default CatalogPageStyles
