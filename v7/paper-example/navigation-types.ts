export type PaperDemoNavigation = {
  goBack: () => void;
  navigate: (
    nextDemo: string,
    params?: Record<string, string | boolean>
  ) => void;
  setOptions: (options: Record<string, unknown>) => void;
};
