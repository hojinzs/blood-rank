interface KakaoStatic {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(options: Record<string, unknown>): void;
  };
}

interface Window {
  Kakao?: KakaoStatic;
}
