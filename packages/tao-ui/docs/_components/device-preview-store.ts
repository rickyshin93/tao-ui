import { create } from 'zustand';

export type PreviewDevice = 'phone' | 'desktop';

interface DevicePreviewState {
  device: PreviewDevice;
  setDevice: (device: PreviewDevice) => void;
}

export const useDevicePreviewStore = create<DevicePreviewState>()((set) => ({
  device: 'phone',
  setDevice: (device) => set({ device }),
}));
