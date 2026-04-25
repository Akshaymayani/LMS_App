import { setOfflineStatus } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

export function useNetwork() {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((state) => state.ui.isOffline);

  useEffect(() => {
    const syncConnection = (isConnected: boolean) => {
      dispatch(setOfflineStatus(!isConnected));
    };

    NetInfo.fetch().then((state) => {
      const reachable = state.isConnected && state.isInternetReachable !== false;
      syncConnection(Boolean(reachable));
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const reachable = state.isConnected && state.isInternetReachable !== false;
      syncConnection(Boolean(reachable));
    });

    return unsubscribe;
  }, [dispatch]);

  return {
    isConnected: !isOffline,
    isOffline,
  };
}
